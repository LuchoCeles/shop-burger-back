DROP PROCEDURE IF EXISTS createProducts;

DELIMITER //

CREATE PROCEDURE createProducts(IN p_data JSON)
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

END //

DELIMITER ;