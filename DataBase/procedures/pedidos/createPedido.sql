DROP PROCEDURE IF EXISTS createPedido;

DELIMITER //

CREATE PROCEDURE createPedido(IN p_data JSON)
BEGIN
    DECLARE v_idCliente INT;
    DECLARE v_telefono VARCHAR(40);
    DECLARE v_direccion VARCHAR(255);
    DECLARE v_descripcion TEXT;

    DECLARE v_precioProducto DECIMAL(10,2);
    DECLARE v_cantidadProducto INT;
    DECLARE v_descuentoProducto DECIMAL(5,2);
    DECLARE v_subTotalProductos DECIMAL(10,2);
    DECLARE v_stockActualProducto INT;

    DECLARE v_precioAdicional DECIMAL(10,2);
    DECLARE v_cantidadAdicional INT;
    DECLARE v_subTotalAdicionales DECIMAL(10,2);
    DECLARE v_maxCantidad INT;
    DECLARE v_stockActual INT;

    DECLARE v_precioTotal DECIMAL(10,2);

    DECLARE v_idPedido INT;

    DECLARE v_i INT DEFAULT 0;
    DECLARE v_total INT;

    -- Extraer datos del pedido
    SET v_idCliente = JSON_UNQUOTE(JSON_EXTRACT(p_data, '$.cliente.id'));
    SET v_telefono = JSON_UNQUOTE(JSON_EXTRACT(p_data, '$.cliente.telefono'));
    SET v_direccion = JSON_UNQUOTE(JSON_EXTRACT(p_data, '$.cliente.direccion'));
    SET v_precioTotal = JSON_UNQUOTE(JSON_EXTRACT(p_data, '$.precioTotal'));
    SET v_descripcion = JSON_UNQUOTE(JSON_EXTRACT(p_data, '$.descripcion'));
    
    -- Descontamos stock de adicionales
    WHILE v_i < JSON_LENGTH(JSON_EXTRACT(p_data, '$.adicionales')) DO
      SET v_cantidadAdicional = JSON_EXTRACT(p_data, CONCAT('$.adicionales[', v_i, '].stock'));
        
      SELECT precio, maxCantidad, stock
        INTO v_precioAdicional, v_maxCantidad, v_stockActual
        FROM Adicionales
      WHERE id = JSON_EXTRACT(p_data, CONCAT('$.adicionales[', v_i, '].id'));

      IF v_cantidadAdicional > v_stockActual AND v_cantidadAdicional > v_maxCantidad THEN
        SIGNAL SQLSTATE '45000'
          SET MESSAGE_TEXT = CONCAT("Error al cargar el Stock de Adicionales")
      END IF;

      UPDATE Adicionales
        SET stock = stock - v_cantidadAdicional
        WHERE id = JSON_EXTRACT(p_data, CONCAT('$.adicionales[', v_i, '].id'));

      SET v_i = v_i + 1;
    END WHILE;

    SET v_i = 0;

    -- Obtenemos el subtotal de los adicionales
    WHILE v_i < JSON_LENGTH(JSON_EXTRACT(p_data, '$.adicionales')) DO
        SELECT precio, cantidad INTO v_precioAdicional, v_cantidadAdicional
          FROM Adicionales
        WHERE id = JSON_UNQUOTE(JSON_EXTRACT(p_data, CONCAT('$.adicionales[', v_i, '].id')));
      SET v_subTotalAdicionales = v_subTotalAdicionales + (v_precioAdicional * v_cantidadAdicional);
      SET v_i = v_i + 1;
    END WHILE;

    SET v_i = 0;

    -- Descontamos el stock de productos
    WHILE v_i < JSON_LENGTH(JSON_EXTRACT(p_data, '$.productos')) DO
      SET v_cantidadProducto = JSON_EXTRACT(p_data, CONCAT('$.productos[', v_i, '].stock'));
        
      SELECT stock INTO v_stockActualProducto
        FROM Productos
      WHERE id = JSON_EXTRACT(p_data, CONCAT('$.productos[', v_i, '].id'));

      IF v_cantidadProducto > v_stockActualProducto THEN
        SIGNAL SQLSTATE '45000'
          SET MESSAGE_TEXT = CONCAT("Error al cargar el Stock de Productos")
      END IF;

      UPDATE Productos
        SET stock = stock - v_cantidadProducto
      WHERE id = JSON_EXTRACT(p_data, CONCAT('$.productos[', v_i, '].id'));

      SET v_i = v_i + 1;
    END WHILE;

    SET v_i = 0;

    -- Obtenemos el subtotal de producto
    WHILE v_i < JSON_LENGTH(JSON_EXTRACT(p_data, '$.productos')) DO

        SELECT precio, cantidad, descuento INTO v_precioProducto, v_cantidadProducto, v_descuentoProducto
          FROM Productos
        WHERE id = JSON_UNQUOTE(JSON_EXTRACT(p_data, CONCAT('$.productos[', v_i, '].id')));

      SET v_subTotalProductos = v_subTotalProductos + (v_cantidadProducto * ((v_precioProducto)) * ((1 - v_descuentoProducto) / 100));

      SET v_i = v_i + 1;
    END WHILE;

    SET v_i = 0;

    -- Creamos el cliente
    INSERT INTO Clientes (telefono, direccion, createdAt, updatedAt)
      VALUES (v_telefono, v_direccion, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());

    SET v_idCliente = LAST_INSERT_ID();

    -- Creamos el pedido
    INSERT INTO Pedidos (idCliente, precioTotal, descripcion, createdAt, updatedAt)
      VALUES (v_idCliente, 0, v_descripcion, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());

    SET v_idPedido = LAST_INSERT_ID();

    -- Calculamos el precio total y lo actualizamos en el pedido
    SET v_precioTotal = v_subTotalProductos + v_subTotalAdicionales;

    UPDATE Pedidos SET precioTotal = v_precioTotal WHERE id = v_idPedido;

    -- Creamos las pibot de productosXPedido
    WHILE v_i < JSON_LENGTH(JSON_EXTRACT(p_data, '$.productos')) DO

      INSERT INTO ProductosXPedidos (idProducto, idPedido, cantidad, createdAt, updatedAt)
        VALUES (
            JSON_EXTRACT(p_data, CONCAT('$.productos[', v_i, '].id')), 
            v_idPedido, 
            JSON_EXTRACT(p_data, CONCAT('$.productos[', v_i, '].cantidad')), 
            CURRENT_TIMESTAMP(), 
            CURRENT_TIMESTAMP()
          );

      SET v_i = v_i + 1;
    END WHILE;

    SET v_i = 0;

    -- Creamos las pibot de adicionalesXProductosXPedido
    WHILE v_i < JSON_LENGTH(JSON_EXTRACT(p_data, '$.adicionales')) DO

      SELECT precio INTO v_precioAdicional
        FROM Adicionales
      WHERE id = JSON_EXTRACT(p_data, CONCAT('$.adicionales[', v_i, '].id'));

      INSERT INTO AdicionalesXProductosXPedidos (idProductoXPedido, idAdicional, cantidad, precio, createdAt, updatedAt)
        VALUES (
          JSON_EXTRACT(p_data, CONCAT('$.productos[', v_i, '].id')), 
          JSON_EXTRACT(p_data, CONCAT('$.adicionales[', v_i, '].id')), 
          JSON_EXTRACT(p_data, CONCAT('$.adicionales[', v_i, '].cantidad')), 
          v_precioAdicional, 
          CURRENT_TIMESTAMP(), 
          CURRENT_TIMESTAMP()
        );

      SET v_i = v_i + 1;
    END WHILE;

END //

DELIMITER ;    