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
CREATE DEFINER=`root`@`localhost` PROCEDURE `createHorario`(IN p_data JSON)
BEGIN
    DECLARE v_idLocal INT;
    DECLARE v_horaApertura TIME;
    DECLARE v_horaCierre TIME;
    DECLARE v_idHorario INT;
    DECLARE i INT DEFAULT 0;

    SET v_horaApertura  = JSON_UNQUOTE(JSON_EXTRACT(p_data, '$.horarioApertura'));
    SET v_horaCierre    = JSON_UNQUOTE(JSON_EXTRACT(p_data, '$.horarioCierre'));

    INSERT INTO horario( horarioApertura, horarioCierre)
    VALUES (v_horaApertura, v_horaCierre);

    SET v_idHorario = LAST_INSERT_ID();

    SELECT 'Horario creado correctamente' AS mensaje, v_idHorario AS idHorario;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `createPedido`(IN p_data JSON)
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

END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `createProducts`(IN p_data JSON)
BEGIN
    DECLARE v_nombre VARCHAR(50);
    DECLARE v_descripcion VARCHAR(255);
    DECLARE v_stock INT;
    DECLARE v_descuento INT;
    DECLARE v_isPromocion BOOLEAN;
    DECLARE v_idCategoria INT;
    DECLARE v_url_imagen VARCHAR(255);
    DECLARE v_idProducto INT;

    DECLARE v_i INT DEFAULT 0;
    DECLARE v_tam_count INT;
    DECLARE v_idTam INT;
    DECLARE v_precio DECIMAL(10,2);

    SET v_nombre = JSON_UNQUOTE(JSON_EXTRACT(p_data, '$.nombre'));
    SET v_descripcion = JSON_UNQUOTE(JSON_EXTRACT(p_data, '$.descripcion'));
    SET v_stock = JSON_UNQUOTE(JSON_EXTRACT(p_data, '$.stock'));
    SET v_descuento = JSON_UNQUOTE(JSON_EXTRACT(p_data, '$.descuento'));
    SET v_isPromocion = JSON_UNQUOTE(JSON_EXTRACT(p_data, '$.isPromocion'));
    SET v_idCategoria = JSON_UNQUOTE(JSON_EXTRACT(p_data, '$.idCategoria'));
    SET v_url_imagen = JSON_UNQUOTE(JSON_EXTRACT(p_data, '$.url_imagen'));
  
    START TRANSACTION;

    INSERT INTO Productos (nombre, descripcion, stock, descuento, isPromocion, idCategoria, url_imagen)
    VALUES (v_nombre, v_descripcion, v_stock, v_descuento, v_isPromocion, v_idCategoria, v_url_imagen);
    
    SET v_idProducto = LAST_INSERT_ID();

    SET v_tam_count = JSON_LENGTH(p_data, '$.tam');
    WHILE v_i < v_tam_count DO
        -- Extraemos el idTam y el precio del objeto actual en el array
        SET v_idTam = JSON_UNQUOTE(JSON_EXTRACT(p_data, CONCAT('$.tam[', v_i, '].idTam')));
        SET v_precio = JSON_UNQUOTE(JSON_EXTRACT(p_data, CONCAT('$.tam[', v_i, '].precio')));

        INSERT INTO ProductosXTam (idProducto, idTam, precio)
        VALUES (v_idProducto, v_idTam, v_precio);

        SET v_i = v_i + 1;
    END WHILE;

    COMMIT;

    SELECT v_idProducto AS id;

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
    SELECT id, cuit, alias, cbu, apellido, nombre, mercadoPagoAccessToken, (SELECT estado FROM MetodosDePago WHERE nombre = 'Mercado Pago') AS mpEstado
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
        p.url_imagen,
        p.stock,
        p.idCategoria,
        p.descuento,
        p.isPromocion,
        p.estado,
        (
            SELECT JSON_OBJECT('nombre', c.nombre,'estado', c.estado) FROM categorias c 
                WHERE c.id = p.idCategoria
            LIMIT 1 
        ) AS categoria,
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
                                'idGxP', GXP.id
                            )
                        SEPARATOR ','),
                    ']')
                FROM GuarnicionesXProducto AS GXP
                INNER JOIN Guarniciones AS G ON GXP.idGuarnicion = G.id
                WHERE GXP.idProducto = p.id
            ),
            '[]' 
        ) AS guarniciones,
        IFNULL(
            (
                SELECT 
                    CONCAT('[',
                        GROUP_CONCAT(
                            JSON_OBJECT(
                                'id',T.id,
                                'idPxT', PXT.id,
                                'nombre', T.nombre,
                                'precio', PXT.precio,
                                'precioFinal', ROUND(PXT.precio - (PXT.precio * (p.descuento / 100)), 2)
                            ) ORDER BY PXT.precio ASC SEPARATOR ','),
                    ']')
                FROM ProductosXTam AS PXT
                INNER JOIN Tam AS T ON PXT.idTam = T.id
                WHERE PXT.idProducto = p.id
            ),
            '[]' 
        ) AS tam

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
    SELECT * ,(SELECT estado FROM MetodosDePago WHERE nombre = 'Mercado Pago') AS mpEstado FROM DatosBancarios WHERE cuit = p_cuit ;
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

    CALL getBanco();
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
    IN p_mpEstado TINYINT,
    IN p_mercadoPagoAccessToken VARCHAR(70)
)
BEGIN
    UPDATE DatosBancarios 
      SET updatedAt = CURRENT_TIMESTAMP(), mercadoPagoAccessToken = p_mercadoPagoAccessToken
    WHERE id = p_id;

    UPDATE MetodosDePago
      SET estado = p_mpEstado
    WHERE nombre = 'Mercado Pago';

    CALL getBanco();
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `updateMp`( 
  IN p_id INT,
  IN p_estado VARCHAR(50)
)
BEGIN
 DECLARE v_idPedido INT;

 UPDATE pagos SET estado = p_estado WHERE id = p_id;

 IF p_estado = 'Cancelado' THEN
   SELECT idPedido INTO v_idPedido FROM pagos WHERE id = p_id;
   IF v_idPedido IS NOT NULL THEN
     UPDATE pedidos SET estado = 'Cancelado' WHERE id = v_idPedido;
   END IF;
 END IF;
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