DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `createAdmin`(
    IN p_nombre VARCHAR(100),
    IN p_password VARCHAR(255)
)
BEGIN
    INSERT INTO Admin (nombre, password)
    VALUES (p_nombre, p_password);

    SELECT LAST_INSERT_ID() AS id;

    SELECT id, nombre
      FROM Admin
    WHERE id = LAST_INSERT_ID();
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `createBanco`(
    IN p_cuit VARCHAR(20),
    IN p_alias VARCHAR(100),
    IN p_cbu VARCHAR(50),
    IN p_apellido VARCHAR(100),
    IN p_nombre VARCHAR(100),
    IN p_password VARCHAR(255)
)
BEGIN
    INSERT INTO DatosBancarios (cuit, alias, cbu, apellido, nombre, password, createdAt, updatedAt)
      VALUES (p_cuit, p_alias, p_cbu, p_apellido, p_nombre, p_password, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());

    SELECT * FROM DatosBancarios WHERE id = LAST_INSERT_ID();
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `createCategorie`(
    IN p_nombre VARCHAR(100)
)
BEGIN
    INSERT INTO Categorias (nombre)
    VALUES (p_nombre);

    SELECT LAST_INSERT_ID() AS new_category_id;

    SELECT * FROM Categorias WHERE id = LAST_INSERT_ID();
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `createPedido`(IN p_data JSON)
BEGIN
    DECLARE v_idCliente INT;
    DECLARE v_telefono VARCHAR(40);
    DECLARE v_direccion VARCHAR(255);
    DECLARE v_descripcion TEXT;
    DECLARE v_metodoDePago VARCHAR(100);


    DECLARE v_precioProducto DECIMAL(10,0);
    DECLARE v_cantidadProducto INT;
    DECLARE v_descuentoProducto DECIMAL(5,0);
    DECLARE v_subTotalProductos DECIMAL(10,0) DEFAULT 0;
    DECLARE v_stockActualProducto INT;
    DECLARE v_estadoProducto TINYINT(1);

    DECLARE v_precioAdicional DECIMAL(10,0);
    DECLARE v_estadoAdicional TINYINT(1);
    DECLARE v_cantidadAdicional INT;
    DECLARE v_subTotalAdicionales DECIMAL(10,0) DEFAULT 0;
    DECLARE v_maxCantidad INT;
    DECLARE v_stockActual INT;

    DECLARE v_precioTotal DECIMAL(10,0) DEFAULT 0;
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
        SELECT precio, descuento, stock, estado INTO v_precioProducto, v_descuentoProducto, v_stockActualProducto, v_estadoProducto
        FROM Productos
        WHERE id = JSON_UNQUOTE(JSON_EXTRACT(p_data, v_path));

        IF v_estadoProducto <> 1 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = "El producto no está disponible";
        END IF;

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
            SELECT precio, maxCantidad, stock, estado INTO v_precioAdicional, v_maxCantidad, v_stockActual, v_estadoAdicional
            FROM Adicionales
            WHERE id = JSON_UNQUOTE(JSON_EXTRACT(p_data, v_path));

            IF v_estadoAdicional <> 1 THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = "El adicional no está disponible";
            END IF;

            -- Validar stock y maxCantidad
            IF v_cantidadAdicional > v_stockActual OR v_cantidadAdicional > v_maxCantidad THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = "Stock insuficiente o cantidad máxima excedida para el adicional";
            END IF;

            -- Actualizar stock del adicional
            UPDATE Adicionales
            SET stock = stock - v_cantidadAdicional
            WHERE id = JSON_UNQUOTE(JSON_EXTRACT(p_data, v_path));

            -- Insertar en AdicionalesXProductosXPedidos
            INSERT INTO adicionalesxproductosxpedidos (idProductoXPedido, idAdicional, cantidad, precio, createdAt, updatedAt)
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
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `deleteAdicional`(IN p_id INT)
BEGIN
    DECLARE v_asociado INT DEFAULT 0;

    -- Verificar si el adicional existe
    IF NOT EXISTS (SELECT 1 FROM adicionales WHERE id = p_id) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Adicional no encontrado';
    END IF;

    -- Verificar asociaciones
    SELECT COUNT(*) INTO v_asociado
    FROM adicionalesxproductos
    WHERE idAdicional = p_id;

    -- Si está asociado, primero eliminar esas relaciones
    IF v_asociado > 0 THEN
        DELETE FROM adicionalesxproductos WHERE idAdicional = p_id;
    END IF;

    -- Eliminar el adicional
    DELETE FROM adicionales WHERE id = p_id;

    -- Retornar mensaje de éxito
    SELECT 'Adicional eliminado correctamente' AS message;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `deleteHorario`(IN p_id INT)
BEGIN
/*Desactiva horario y elimina relación con días.*/
    UPDATE horario SET estado = 0 WHERE id = p_id;
    DELETE FROM horario_dias WHERE idHorario = p_id;

    SELECT 'Horario eliminado' AS mensaje;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `getAllCategories`()
BEGIN
    SELECT id, nombre, estado
      FROM Categorias;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `getBanco`()
BEGIN
    SELECT id, cuit, alias, cbu, apellido, nombre, mpEstado
      FROM DatosBancarios
    LIMIT 1;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `getHorario`()
BEGIN
    SELECT * FROM Horario ORDER BY id DESC;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `getLocalDetails`(IN p_idLocal INT)
BEGIN
    -- Validación de existencia (se queda igual)
    IF (SELECT COUNT(*) FROM Local WHERE id = p_idLocal) = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El local con el ID especificado no existe.';
    END IF;

    -- Construimos y devolvemos UN ÚNICO resultado.
    SELECT 
        JSON_OBJECT(
            'id', L.id,
            'direccion', L.direccion,
            'estado', L.estado,
            'horarios', (
                -- Subconsulta para construir el array de horarios MANUALMENTE
                SELECT
                    -- 1. CONCAT para añadir los corchetes de apertura y cierre del array: '[' y ']'
                    CONCAT('[',
                        -- 2. GROUP_CONCAT para unir todos los objetos de horario en un solo string, separados por comas
                        GROUP_CONCAT(
                            -- 3. JSON_OBJECT para crear cada objeto de horario individual
                            JSON_OBJECT(
                                'idHorario', H.id,
                                'horarioApertura', H.horarioApertura,
                                'horarioCierre', H.horarioCierre,
                                'estado', H.estado,
                                'dias', (
                                    -- Subconsulta para los días (se queda igual)
                                    SELECT GROUP_CONCAT(D.nombreDia ORDER BY D.id SEPARATOR ', ')
                                    FROM horarioDias AS HD
                                    JOIN Dias AS D ON HD.idDia = D.id
                                    WHERE HD.idHorario = H.id AND D.estado = 1
                                )
                            )
                        SEPARATOR ','), -- El separador entre objetos
                    ']')
                FROM horario AS H
                WHERE H.idLocal = L.id AND H.estado = 1
            )
        ) AS localData
    FROM 
        Local AS L
    WHERE 
        L.id = p_idLocal;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `getLocales`()
BEGIN
    SELECT 
        l.id AS idLocal,
        l.direccion,
        d.id AS idDia,
        d.nombreDia,
        h.horarioApertura,
        h.horarioCierre
    FROM local AS l
    INNER JOIN horario AS h ON h.idLocal = l.id
    INNER JOIN dias AS d ON d.id = h.idDia
    WHERE d.estado = 1
      AND h.estado = 1
    ORDER BY l.id ASC, d.id ASC, h.horarioApertura ASC;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `getProducts`(
    IN p_estado BOOLEAN
)
BEGIN
    SELECT
        p.id,
        p.nombre,
        p.descripcion,
        p.precio,
        p.url_imagen,
        p.stock,
        p.idCategoria,
        p.descuento,
        p.isPromocion,
        p.estado,
        ROUND(p.precio - (p.precio * (p.descuento / 100)), 2) AS precioFinal,

        (
            SELECT JSON_OBJECT(
                'nombre', c.nombre,
                'estado', c.estado
            )
        FROM categorias c 
            WHERE c.id = p.idCategoria
        LIMIT 1 ) AS categoria,
     
        IFNULL(
            (
                SELECT 
                    CONCAT('[',
                        GROUP_CONCAT(
                            JSON_OBJECT(
                                'id', a.id,
                                'nombre', a.nombre,
                                'precio', a.precio,
                                'stock', a.stock,
                                'maxCantidad', a.maxCantidad,
                                'idAxp', axp.id
                            ) SEPARATOR ','
                        ),
                        ']'
                    )
                FROM adicionalesxproductos axp
                INNER JOIN adicionales a ON axp.idAdicional = a.id
                WHERE axp.idProducto = p.id AND a.estado = 1
            ),
            '[]'
        ) AS adicionales,

  
        IFNULL(
            (
                SELECT 
                    CONCAT('[',
                        GROUP_CONCAT(
                            JSON_OBJECT(
                                'id', G.id,
                                'nombre', G.nombre,
                                'tam', ( 
                                    SELECT
                                        CONCAT('[',
                                            GROUP_CONCAT(
                                                JSON_OBJECT(
                                                    'id', T.id,
                                                    'nombre', T.nombre,
                                                    'estado', T.estado
                                                )
                                            SEPARATOR ','),
                                        ']')
                                    FROM TamXGuarnicion AS TXG
                                    INNER JOIN Tam AS T ON TXG.idTam = T.id
                                    WHERE TXG.idGuarnicion = G.id AND T.estado = 1
                                )
                            )
                        SEPARATOR ','),
                    ']')
                FROM GuarnicionesXProducto AS GXP
                INNER JOIN Guarniciones AS G ON GXP.idGuarnicion = G.id
                WHERE GXP.idProducto = p.id
            ),
            '[]' 
        ) AS guarniciones

    FROM productos p
    WHERE (p_estado = 0 OR p.estado = 1);
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `login`(IN p_nombre VARCHAR(100))
BEGIN
  SELECT id, nombre, password 
    FROM Admin 
  WHERE nombre = p_nombre;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `loginBanco`(
    IN p_cuit VARCHAR(20)
)
BEGIN
    SELECT * FROM DatosBancarios WHERE cuit = p_cuit ;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `updateCategorie`(
    IN p_id INT,
    IN p_nombre VARCHAR(100)
)
BEGIN
    UPDATE Categorias
    SET nombre = p_nombre, updatedAt = CURRENT_TIMESTAMP()
    WHERE id = p_id;

    SELECT * FROM Categorias WHERE id = p_id;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `updateCategorieState`(
    IN p_id INT,
    IN p_estado BOOLEAN
)
BEGIN
    UPDATE Categorias
    SET estado = p_estado, updatedAt = CURRENT_TIMESTAMP()
    WHERE id = p_id;

    SELECT * FROM Categorias WHERE id = p_id;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `updateDatosBancarios`(
    IN p_id INT,
    IN p_cuit VARCHAR(20),
    IN p_alias VARCHAR(100),
    IN p_cbu VARCHAR(50),
    IN p_apellido VARCHAR(100),
    IN p_nombre VARCHAR(100)
)
BEGIN
    UPDATE DatosBancarios 
      SET cuit = p_cuit, alias = p_alias, cbu = p_cbu, apellido = p_apellido, nombre = p_nombre, updatedAt = CURRENT_TIMESTAMP()
    WHERE id = p_id;

    SELECT * FROM DatosBancarios WHERE id = p_id;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `updateHorario`(IN p_data JSON)
BEGIN
    DECLARE v_id INT;
    DECLARE v_horarioApertura TIME;
    DECLARE v_horarioCierre TIME;
    DECLARE v_estado TINYINT;

    -- Extraemos los valores del JSON
    SET v_id = JSON_UNQUOTE(JSON_EXTRACT(p_data, '$.id'));
    SET v_horarioApertura = JSON_UNQUOTE(JSON_EXTRACT(p_data, '$.horarioApertura'));
    SET v_horarioCierre = JSON_UNQUOTE(JSON_EXTRACT(p_data, '$.horarioCierre'));
    SET v_estado = JSON_UNQUOTE(JSON_EXTRACT(p_data, '$.estado'));

    -- Realizamos la actualización en un solo paso atómico

    IF v_id = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El horario no existe o no se realizaron cambios';
    END IF;
    
    UPDATE Horario
    SET
        horarioApertura = v_horarioApertura,
        horarioCierre = v_horarioCierre,
        -- Usamos IFNULL/COALESCE aquí. Si v_estado es NULL, mantiene el valor existente.
        estado = COALESCE(v_estado, estado)
    WHERE id = v_id;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `updateMPState`(
    IN p_id INT,
    IN p_mpEstado TINYINT
)
BEGIN
    UPDATE DatosBancarios 
      SET mpEstado = p_mpEstado
    WHERE id = p_id;

    SELECT * FROM DatosBancarios WHERE id = p_id;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `updateMp`( 
  IN p_id INT,
  IN p_estado VARCHAR(50)
)
BEGIN
 UPDATE pagos SET estado = p_estado WHERE id = p_id;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `updatePasswordBanco`(
    IN p_id INT,
    IN p_password VARCHAR(100)
)
BEGIN
    UPDATE DatosBancarios 
      SET password = p_password, updatedAt = CURRENT_TIMESTAMP()
    WHERE id = p_id;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `updatePedido`(IN p_data JSON)
BEGIN
    DECLARE v_idPedido INT;
    DECLARE v_idCliente INT;
    DECLARE v_telefono VARCHAR(40);
    DECLARE v_direccion VARCHAR(255);
    DECLARE v_descripcion TEXT;

    DECLARE v_precioProducto DECIMAL(10,0);
    DECLARE v_cantidadProducto INT;
    DECLARE v_descuentoProducto DECIMAL(5,0);
    DECLARE v_stockActualProducto INT;
    DECLARE v_subTotalProductos DECIMAL(10,0) DEFAULT 0;

    DECLARE v_precioAdicional DECIMAL(10,0);
    DECLARE v_cantidadAdicional INT;
    DECLARE v_stockActual INT;
    DECLARE v_maxCantidad INT;
    DECLARE v_subTotalAdicionales DECIMAL(10,0) DEFAULT 0;

    DECLARE v_precioTotal DECIMAL(10,0) DEFAULT 0;
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
END$$
DELIMITER ;
