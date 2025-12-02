DROP PROCEDURE IF EXISTS updateProducts;

DELIMITER //


CREATE PROCEDURE updateProductoCompleto_v2(
    IN p_idProducto INT,
    IN p_productoData JSON,
    IN p_tamData JSON,
    IN p_antiguaCategoria INT,
    IN p_nuevaCategoria INT
)
BEGIN
    DECLARE v_nombre VARCHAR(255);
    DECLARE v_descripcion TEXT;
    DECLARE v_idCategoria INT;
    DECLARE v_urlImagen VARCHAR(500);

    DECLARE i INT DEFAULT 0;
    DECLARE len INT DEFAULT 0;
    DECLARE v_idTam INT;
    DECLARE v_precio DECIMAL(10,2);

    -- Extraer datos del JSON
    SET v_nombre = JSON_UNQUOTE(JSON_EXTRACT(p_productoData, '$.nombre'));
    SET v_descripcion = JSON_UNQUOTE(JSON_EXTRACT(p_productoData, '$.descripcion'));
    SET v_idCategoria = JSON_EXTRACT(p_productoData, '$.idCategoria');
    SET v_urlImagen = JSON_UNQUOTE(JSON_EXTRACT(p_productoData, '$.url_imagen'));

    -- 1) Actualizar PRODUCTO
    UPDATE productos
    SET 
        nombre = COALESCE(v_nombre, nombre),
        descripcion = COALESCE(v_descripcion, descripcion),
        idCategoria = COALESCE(v_idCategoria, idCategoria),
        url_imagen = COALESCE(v_urlImagen, url_imagen)
    WHERE id = p_idProducto;

    -- Determinar longitud de array tamData
    IF p_tamData IS NULL THEN
        SET len = 0;
    ELSE
        SET len = JSON_LENGTH(p_tamData);
    END IF;

    -- Si cambió la categoría → borrar asociaciones
    IF p_antiguaCategoria IS NOT NULL 
       AND p_nuevaCategoria IS NOT NULL
       AND p_antiguaCategoria <> p_nuevaCategoria THEN

        DELETE FROM productosxtam WHERE idProducto = p_idProducto;

        SET i = 0;
        WHILE i < len DO
            SET v_idTam = JSON_EXTRACT(p_tamData, CONCAT('$[', i, '].idTam'));
            SET v_precio = JSON_EXTRACT(p_tamData, CONCAT('$[', i, '].precio'));

            INSERT INTO productosxtam (idProducto, idTam, precio)
            VALUES (p_idProducto, v_idTam, v_precio);

            SET i = i + 1;
        END WHILE;

    ELSE
        -- Si mandaron tamData → reemplazar todas las asociaciones
        IF len > 0 THEN
            DELETE FROM productosxtam WHERE idProducto = p_idProducto;

            SET i = 0;
            WHILE i < len DO
                SET v_idTam = JSON_EXTRACT(p_tamData, CONCAT('$[', i, '].idTam'));
                SET v_precio = JSON_EXTRACT(p_tamData, CONCAT('$[', i, '].precio'));

                INSERT INTO productosxtam (idProducto, idTam, precio)
                VALUES (p_idProducto, v_idTam, v_precio);

                SET i = i + 1;
            END WHILE;
        END IF;
    END IF;


END //


DELIMITER ;
