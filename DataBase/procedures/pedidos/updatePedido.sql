DROP PROCEDURE IF EXISTS updatePedido;
DELIMITER //

CREATE PROCEDURE updatePedido(IN p_data JSON)
BEGIN
    DECLARE v_idPedido INT;
    DECLARE v_idCliente INT;
    DECLARE v_telefono VARCHAR(40);
    DECLARE v_direccion VARCHAR(255);
    DECLARE v_descripcion TEXT;

    DECLARE v_precioProducto DECIMAL(10,2);
    DECLARE v_cantidadProducto INT;
    DECLARE v_descuentoProducto DECIMAL(5,2);
    DECLARE v_stockActualProducto INT;
    DECLARE v_subTotalProductos DECIMAL(10,2) DEFAULT 0;

    DECLARE v_precioAdicional DECIMAL(10,2);
    DECLARE v_cantidadAdicional INT;
    DECLARE v_stockActual INT;
    DECLARE v_maxCantidad INT;
    DECLARE v_subTotalAdicionales DECIMAL(10,2) DEFAULT 0;

    DECLARE v_precioTotal DECIMAL(10,2) DEFAULT 0;
    DECLARE v_i INT DEFAULT 0;
    DECLARE v_j INT DEFAULT 0;
    DECLARE v_path VARCHAR(200);
    DECLARE v_idProdXPED INT;

    DECLARE v_estadoActual VARCHAR(50);
    DECLARE v_createdAt DATETIME;

    DECLARE done INT DEFAULT 0;
    DECLARE v_oldProdtId INT;
    DECLARE v_oldCantProd INT;

    DECLARE cur_oldProductos CURSOR FOR
        SELECT idProducto, cantidad from productosxpedidos WHERE idPedido = v_idPedido;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    -- ===============================
    -- 1️⃣ Extraer datos del pedido Y validamos estado y tiempo
    -- ===============================
    SET v_idPedido = JSON_UNQUOTE(JSON_EXTRACT(p_data, '$.idPedido'));

    SELECT estado, createdAt INTO v_estadoActual, v_createdAt FROM pedidos WHERE id = v_idPedido;

    IF v_estadoActual  IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El pedido no existe';
    END IF;

    IF v_estadoActual <> 'pendiente' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Solo se pueden actualizar pedidos en estado pendiente';
    END IF;

    IF TIMESTAMPDIFF(MINUTE, v_createdAt, CURRENT_TIMESTAMP()) > 5 THEN  /* desde que se crea el pedido, cambiamos la variable y es desde que se modifica el pedido*/
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El tiempo para actualizar el pedido ha expirado';
    END IF;

    SET done = 0;

    OPEN cur_oldProductos;
    restore_loop: LOOP
        FETCH cur_oldProductos INTO v_oldProdtId, v_oldCantProd;
        IF done THEN
            LEAVE restore_loop;
        END IF;

        -- Restaurar stock del producto
        UPDATE productos
        SET stock = stock + v_oldCantProd
        WHERE id = v_oldProdtId;

        UPDATE adicionales a
        JOIN adicionalesxproductosxpedidos axp ON a.id = axp.idAdicional
        SET a.stock = a.stock + axp.cantidad
        WHERE axp.idProductoXPedido IN (
            SELECT id FROM productosxpedidos WHERE idProducto = v_oldProdtId AND idPedido = v_idPedido
        );
    END LOOP;

    CLOSE cur_oldProductos;


    SET v_descripcion = JSON_UNQUOTE(JSON_EXTRACT(p_data, '$.descripcion'));
    SET v_telefono = JSON_UNQUOTE(JSON_EXTRACT(p_data, '$.cliente.telefono'));
    SET v_direccion = JSON_UNQUOTE(JSON_EXTRACT(p_data, '$.cliente.direccion'));

    -- ===============================
    -- 2️⃣ Actualizar datos del cliente (si existen)
    -- ===============================
    SELECT idCliente INTO v_idCliente FROM pedidos WHERE id = v_idPedido;

    IF v_idCliente IS NOT NULL THEN
        UPDATE clientes
        SET telefono = v_telefono,
            direccion = v_direccion,
            updatedAt = CURRENT_TIMESTAMP()
        WHERE id = v_idCliente;
    END IF;

    /* Eliminamos relaciones */
    DELETE FROM adicionalesxproductosxpedidos
      WHERE idproductoxpedido IN(
      SELECT id from productosxpedidos
    WHERE idPedido = v_idPedido);

     DELETE FROM productosxpedidos WHERE idPedido = v_idPedido;

    -- ===============================
    -- 4️⃣ Recorrer productos
    -- ===============================
    SET v_i = 0;
    WHILE v_i < JSON_LENGTH(JSON_EXTRACT(p_data, '$.productos')) DO
        SET v_path = CONCAT('$.productos[', v_i, '].id');
        SET v_cantidadProducto = JSON_EXTRACT(p_data, CONCAT('$.productos[', v_i, '].cantidad'));

        -- Obtener info del producto
        SELECT precio, descuento, stock INTO v_precioProducto, v_descuentoProducto, v_stockActualProducto
        FROM productos
        WHERE id = JSON_UNQUOTE(JSON_EXTRACT(p_data, v_path));

        IF v_cantidadProducto > v_stockActualProducto THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Stock insuficiente para producto';
        END IF;

        
        -- Actualizar stock producto
        UPDATE productos
        SET stock = stock - v_cantidadProducto
        WHERE id = JSON_UNQUOTE(JSON_EXTRACT(p_data, v_path));

        -- Calcular subtotal producto
        SET v_subTotalProductos = v_subTotalProductos + (v_precioProducto * v_cantidadProducto * (1 - v_descuentoProducto / 100));

        -- Insertar producto en ProductosXPedidos

        INSERT INTO productosxpedidos (idProducto, idPedido, cantidad, createdAt, updatedAt)
        VALUES (
            JSON_UNQUOTE(JSON_EXTRACT(p_data, v_path)),
            v_idPedido,
            v_cantidadProducto,
            CURRENT_TIMESTAMP(),
            CURRENT_TIMESTAMP()
        );

        SET v_idProdXPED = LAST_INSERT_ID();

        -- ===============================
        -- 5️⃣ Recorrer adicionales por producto
        -- ===============================
        SET v_j = 0;
        WHILE v_j < JSON_LENGTH(JSON_EXTRACT(p_data, CONCAT('$.productos[', v_i, '].adicionales'))) DO
            SET v_path = CONCAT('$.productos[', v_i, '].adicionales[', v_j, '].id');
            SET v_cantidadAdicional = JSON_EXTRACT(p_data, CONCAT('$.productos[', v_i, '].adicionales[', v_j, '].cantidad'));

            -- Obtener info del adicional
            SELECT precio, maxCantidad, stock INTO v_precioAdicional, v_maxCantidad, v_stockActual
            FROM adicionales
            WHERE id = JSON_UNQUOTE(JSON_EXTRACT(p_data, v_path));

            IF v_cantidadAdicional > v_stockActual OR v_cantidadAdicional > v_maxCantidad THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Stock insuficiente o cantidad máxima excedida para adicional';
            END IF;

            -- Actualizar stock adicional
            UPDATE adicionales
            SET stock = stock - v_cantidadAdicional
            WHERE id = JSON_UNQUOTE(JSON_EXTRACT(p_data, v_path));

            -- Insertar en AdicionalesXProductosXPedidos
            INSERT INTO adicionalesxproductosxpedidos (idProductoXPedido, idAdicional, cantidad, precio, createdAt, updatedAt)
            VALUES (
                v_idProdXPED,
                JSON_UNQUOTE(JSON_EXTRACT(p_data, v_path)),
                v_cantidadAdicional,
                v_precioAdicional,
                CURRENT_TIMESTAMP(),
                CURRENT_TIMESTAMP()
            );

            -- Calcular subtotal adicional
            SET v_subTotalAdicionales = v_subTotalAdicionales + (v_precioAdicional * v_cantidadAdicional);
            SET v_j = v_j + 1;
        END WHILE;

        SET v_i = v_i + 1;
    END WHILE;

    -- ===============================
    -- 6️⃣ Calcular total y actualizar pedido
    -- ===============================
    SET v_precioTotal = v_subTotalProductos + v_subTotalAdicionales;

    UPDATE pedidos
    SET 
        descripcion = v_descripcion,
        precioTotal = v_precioTotal,
        updatedAt = CURRENT_TIMESTAMP()
    WHERE id = v_idPedido;

    -- ===============================
    -- 7️⃣ Retornar resultado
    -- ===============================
    SELECT v_idPedido AS id, v_precioTotal AS totalActualizado;
END //

DELIMITER ;
