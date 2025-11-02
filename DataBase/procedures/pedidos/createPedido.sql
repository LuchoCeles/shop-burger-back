DROP PROCEDURE IF EXISTS createPedido;

DELIMITER //

CREATE PROCEDURE createPedido(IN p_data JSON)
BEGIN
    DECLARE v_idCliente INT;
    DECLARE v_telefono VARCHAR(40);
    DECLARE v_direccion VARCHAR(255);
    DECLARE v_descripcion TEXT;
    DECLARE v_metodoDePago VARCHAR(100);


    DECLARE v_precioProducto DECIMAL(10,2);
    DECLARE v_cantidadProducto INT;
    DECLARE v_descuentoProducto DECIMAL(5,2);
    DECLARE v_subTotalProductos DECIMAL(10,2) DEFAULT 0;
    DECLARE v_stockActualProducto INT;

    DECLARE v_precioAdicional DECIMAL(10,2);
    DECLARE v_cantidadAdicional INT;
    DECLARE v_subTotalAdicionales DECIMAL(10,2) DEFAULT 0;
    DECLARE v_maxCantidad INT;
    DECLARE v_stockActual INT;

    DECLARE v_precioTotal DECIMAL(10,2) DEFAULT 0;
    DECLARE v_idPedido INT;

    DECLARE v_i INT DEFAULT 0;
    DECLARE v_j INT DEFAULT 0;
    DECLARE v_path VARCHAR(100);
    
    -- Extraer datos del pedido
    SET v_telefono = JSON_UNQUOTE(JSON_EXTRACT(p_data, '$.cliente.telefono'));
    SET v_direccion = JSON_UNQUOTE(JSON_EXTRACT(p_data, '$.cliente.direccion'));
    SET v_descripcion = JSON_UNQUOTE(JSON_EXTRACT(p_data, '$.descripcion'));

    -- Crear el cliente
    INSERT INTO Clientes (telefono, direccion, createdAt, updatedAt)
    VALUES (v_telefono, v_direccion, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());
    SET v_idCliente = LAST_INSERT_ID();

    -- Crear el pedido
    INSERT INTO Pedidos (idCliente, precioTotal, descripcion, createdAt, updatedAt)
    VALUES (v_idCliente, 0, v_descripcion, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());
    SET v_idPedido = LAST_INSERT_ID();

    -- Loop sobre productos
    SET v_i = 0;
    WHILE v_i < JSON_LENGTH(JSON_EXTRACT(p_data, '$.productos')) DO
        SET v_path = CONCAT('$.productos[', v_i, '].id');
        SET v_cantidadProducto = JSON_EXTRACT(p_data, CONCAT('$.productos[', v_i, '].cantidad'));

        -- Obtener precio y stock del producto
        SELECT precio, descuento, stock INTO v_precioProducto, v_descuentoProducto, v_stockActualProducto
        FROM Productos
        WHERE id = JSON_UNQUOTE(JSON_EXTRACT(p_data, v_path));

        -- Verificar stock
        IF v_cantidadProducto > v_stockActualProducto THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = "Stock insuficiente para el producto";
        END IF;

        -- Actualizar stock del producto
        UPDATE Productos
        SET stock = stock - v_cantidadProducto
        WHERE id = JSON_UNQUOTE(JSON_EXTRACT(p_data, v_path));

        -- Calcular subtotal producto
        SET v_subTotalProductos = v_subTotalProductos + (v_precioProducto * v_cantidadProducto * (1 - v_descuentoProducto/100));

        -- Insertar en ProductosXPedidos
        INSERT INTO ProductosXPedidos (idProducto, idPedido, cantidad, createdAt, updatedAt)
        VALUES (
            JSON_UNQUOTE(JSON_EXTRACT(p_data, v_path)),
            v_idPedido,
            v_cantidadProducto,
            CURRENT_TIMESTAMP(),
            CURRENT_TIMESTAMP()
        );

        SET @v_idProdXPED = LAST_INSERT_ID(); -- Para relacionar los adicionales

        -- Loop sobre adicionales del producto
        SET v_j = 0;
        WHILE v_j < JSON_LENGTH(JSON_EXTRACT(p_data, CONCAT('$.productos[', v_i, '].adicionales'))) DO
            SET v_path = CONCAT('$.productos[', v_i, '].adicionales[', v_j, '].id');
            SET v_cantidadAdicional = JSON_EXTRACT(p_data, CONCAT('$.productos[', v_i, '].adicionales[', v_j, '].cantidad'));

            -- Obtener precio y stock del adicional
            SELECT precio, maxCantidad, stock INTO v_precioAdicional, v_maxCantidad, v_stockActual
            FROM Adicionales
            WHERE id = JSON_UNQUOTE(JSON_EXTRACT(p_data, v_path));

            -- Validar stock y maxCantidad
            IF v_cantidadAdicional > v_stockActual OR v_cantidadAdicional > v_maxCantidad THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = "Stock insuficiente o cantidad máxima excedida para el adicional";
            END IF;

            -- Actualizar stock del adicional
            UPDATE Adicionales
            SET stock = stock - v_cantidadAdicional
            WHERE id = JSON_UNQUOTE(JSON_EXTRACT(p_data, v_path));

            -- Insertar en AdicionalesXProductosXPedidos
            INSERT INTO AdicionalesXProductosXPedidos (idProductoXPedido, idAdicional, cantidad, precio, createdAt, updatedAt)
            VALUES (
                @v_idProdXPED,
                JSON_UNQUOTE(JSON_EXTRACT(p_data, v_path)),
                v_cantidadAdicional,
                v_precioAdicional,
                CURRENT_TIMESTAMP(),
                CURRENT_TIMESTAMP()
            );

            -- Acumular subtotal adicionales
            SET v_subTotalAdicionales = v_subTotalAdicionales + (v_precioAdicional * v_cantidadAdicional);

            SET v_j = v_j + 1;
        END WHILE;

        SET v_i = v_i + 1;
    END WHILE;

    -- Insertar metodo de pago
    SELECT id INTO v_metodoDePago FROM MetodosDePago WHERE nombre = JSON_UNQUOTE(JSON_EXTRACT(p_data, '$.metodoDePago'));
    INSERT INTO Pagos (idPedido, idMetodoDePago, createdAt, updatedAt)
    VALUES (v_idPedido, v_metodoDePago, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());

    -- Actualizar precio total del pedido
    SET v_precioTotal = v_subTotalProductos + v_subTotalAdicionales;
    UPDATE Pedidos SET precioTotal = v_precioTotal WHERE id = v_idPedido;

    -- Retornar ID del pedido
    SELECT v_idPedido AS id;
END //

DELIMITER ;
