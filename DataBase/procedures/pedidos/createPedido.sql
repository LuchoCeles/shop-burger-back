DROP PROCEDURE IF EXISTS createPedido;
DELIMITER //

CREATE PROCEDURE createPedido(IN p_data JSON)
BEGIN
    DECLARE v_idCliente INT;
    DECLARE v_telefono VARCHAR(40);
    DECLARE v_direccion VARCHAR(255);
    DECLARE v_descripcion TEXT;
    DECLARE v_metodoDePago INT;

    DECLARE v_cantidadProducto INT;
    DECLARE v_descuentoProducto INT;
    DECLARE v_stockActualProducto INT;
    DECLARE v_estadoProducto TINYINT;

    DECLARE v_precioProducto DECIMAL(10,2);
    DECLARE v_subTotalProductos DECIMAL(10,2) DEFAULT 0;

    DECLARE v_precioAdicional DECIMAL(10,2);
    DECLARE v_idAdicional INT;
    DECLARE v_cantidadAdicional INT;
    DECLARE v_maxCantidad INT;
    DECLARE v_stockActual INT;
    DECLARE v_estadoAdicional TINYINT;
    DECLARE v_subTotalAdicionales DECIMAL(10,2) DEFAULT 0;

    DECLARE v_precioEnvio DECIMAL(10,2) DEFAULT 0;
    DECLARE v_idEnvio INT;

    DECLARE v_precioTotal DECIMAL(10,2) DEFAULT 0;
    DECLARE v_idPedido INT;

    DECLARE v_i INT DEFAULT 0;
    DECLARE v_j INT DEFAULT 0;

    DECLARE v_idProducto INT;
    DECLARE v_idTam INT;

    DECLARE v_idGuarnicion INT;
    DECLARE v_estadoGuarnicion TINYINT;
    DECLARE v_stockGuarnicion INT;

    -- =============================
    -- Crear cliente
    -- =============================
    SET v_telefono = JSON_UNQUOTE(JSON_EXTRACT(p_data, '$.cliente.telefono'));
    SET v_direccion = JSON_UNQUOTE(JSON_EXTRACT(p_data, '$.cliente.direccion'));
    SET v_descripcion = JSON_UNQUOTE(JSON_EXTRACT(p_data, '$.descripcion'));

    INSERT INTO Clientes (telefono, direccion)
    VALUES (v_telefono, v_direccion);

    SET v_idCliente = LAST_INSERT_ID();

    -- =============================
    -- Crear pedido
    -- =============================
    INSERT INTO Pedidos (idCliente, precioTotal, descripcion)
    VALUES (v_idCliente, 0, v_descripcion);

    SET v_idPedido = LAST_INSERT_ID();

    -- =============================
    -- Obtener envío activo
    -- =============================
    SELECT id, precio INTO v_idEnvio, v_precioEnvio
    FROM Envios WHERE estado = 1 LIMIT 1;

    IF v_idEnvio IS NOT NULL THEN
        UPDATE Pedidos SET idEnvio = v_idEnvio WHERE id = v_idPedido;
    END IF;

    -- =============================
    -- PROCESAR PRODUCTOS
    -- =============================
    WHILE v_i < JSON_LENGTH(JSON_EXTRACT(p_data, '$.productos')) DO

        SET v_idProducto = JSON_EXTRACT(p_data, CONCAT('$.productos[', v_i, '].id'));
        SET v_idTam = JSON_EXTRACT(p_data, CONCAT('$.productos[', v_i, '].idTam'));
        SET v_cantidadProducto = JSON_EXTRACT(p_data, CONCAT('$.productos[', v_i, '].cantidad'));
        SET v_idGuarnicion = JSON_EXTRACT(p_data, CONCAT('$.productos[', v_i, '].idGuarnicion'));

        -- =============================
        -- Validar guarnición
        -- =============================
        IF v_idGuarnicion IS NOT NULL THEN

            -- Validar que el producto permita esa guarnición
            IF NOT EXISTS (
                SELECT 1 FROM GuarnicionesXProducto
                WHERE idProducto = v_idProducto AND idGuarnicion = v_idGuarnicion
            ) THEN
                SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Guarnición no permitida para este producto';
            END IF;

            -- Obtener stock/estado
            SELECT stock, estado INTO v_stockGuarnicion, v_estadoGuarnicion
            FROM Guarniciones WHERE id = v_idGuarnicion;

            IF v_estadoGuarnicion <> 1 THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Guarnición no disponible';
            END IF;

            IF v_stockGuarnicion < v_cantidadProducto THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Stock insuficiente de guarnición';
            END IF;

            -- Restar stock de guarnición
            UPDATE Guarniciones SET stock = stock - v_cantidadProducto
            WHERE id = v_idGuarnicion;
        END IF;

        -- =============================
        -- Validar producto
        -- =============================
        SELECT descuento, stock, estado
        INTO v_descuentoProducto, v_stockActualProducto, v_estadoProducto
        FROM Productos WHERE id = v_idProducto;

        IF v_estadoProducto <> 1 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Producto no disponible';
        END IF;

        IF v_cantidadProducto > v_stockActualProducto THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Stock insuficiente';
        END IF;

        -- Obtener precio según tamaño
        SELECT precio INTO v_precioProducto
        FROM ProductosXTam
        WHERE idProducto = v_idProducto AND idTam = v_idTam AND estado = 1;

        IF v_precioProducto IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El precio del producto no está configurado';
        END IF;

        -- Restar stock
        UPDATE Productos SET stock = stock - v_cantidadProducto
        WHERE id = v_idProducto;

        -- Subtotal productos
        SET v_subTotalProductos = v_subTotalProductos
            + (v_precioProducto * v_cantidadProducto * (1 - v_descuentoProducto / 100));

        -- Insertar producto en pedido — con guarnición
        INSERT INTO ProductosXPedidos (idProducto, idPedido, cantidad, idGuarnicion)
        VALUES (v_idProducto, v_idPedido, v_cantidadProducto, v_idGuarnicion);

        SET @idProdXPED = LAST_INSERT_ID();

        -- =============================
        -- ADICIONALES
        -- =============================
        SET v_j = 0;

        WHILE v_j < JSON_LENGTH(JSON_EXTRACT(p_data, CONCAT('$.productos[', v_i, '].adicionales'))) DO

            SET v_idAdicional = JSON_EXTRACT(p_data, CONCAT('$.productos[', v_i, '].adicionales[', v_j, '].id'));
            SET v_cantidadAdicional = JSON_EXTRACT(p_data, CONCAT('$.productos[', v_i, '].adicionales[', v_j, '].cantidad'));

            SELECT precio, maxCantidad, stock, estado
            INTO v_precioAdicional, v_maxCantidad, v_stockActual, v_estadoAdicional
            FROM Adicionales WHERE id = v_idAdicional;

            IF v_estadoAdicional <> 1 THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Adicional no disponible';
            END IF;

            IF v_cantidadAdicional > v_stockActual
                OR v_cantidadAdicional > v_maxCantidad THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cantidad de adicional inválida';
            END IF;

            UPDATE Adicionales SET stock = stock - v_cantidadAdicional
            WHERE id = v_idAdicional;

            INSERT INTO AdicionalesXProductosXPedidos
                (idProductoXPedido, idAdicional, cantidad, precio)
            VALUES
                (@idProdXPED, v_idAdicional, v_cantidadAdicional, v_precioAdicional);

            SET v_subTotalAdicionales = v_subTotalAdicionales
                + (v_precioAdicional * v_cantidadAdicional);

            SET v_j = v_j + 1;

        END WHILE;

        SET v_i = v_i + 1;

    END WHILE;

    -- =============================
    -- MÉTODO DE PAGO
    -- =============================
    SELECT id INTO v_metodoDePago
    FROM MetodosDePago
    WHERE nombre = JSON_UNQUOTE(JSON_EXTRACT(p_data, '$.metodoDePago'));

    INSERT INTO Pagos (idPedido, idMetodoDePago)
    VALUES (v_idPedido, v_metodoDePago);

    -- =============================
    -- TOTAL FINAL
    -- =============================
    SET v_precioTotal = v_subTotalProductos + v_subTotalAdicionales + v_precioEnvio;

    UPDATE Pedidos SET precioTotal = v_precioTotal
    WHERE id = v_idPedido;

    SELECT v_idPedido AS id;

END //
DELIMITER ;
