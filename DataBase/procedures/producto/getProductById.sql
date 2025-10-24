DROP PROCEDURE IF EXISTS getProductById;

DELIMITER //
    CREATE PROCEDURE getProductById()
    BEGIN
        SELECT 
            p_id AS id_producto,
            p_nombre AS nombre_producto,
            p_precio AS precio_producto,
            p_stock AS stock_producto,
            c_id  as id_categoria,
            c_nombre AS nombre_categoria
        FROM productos p
        INNER JOIN categorias c
        ON p_idCategoria = c_id 
        WHERE p_estado = 1;
            
    END//

DELIMITER;