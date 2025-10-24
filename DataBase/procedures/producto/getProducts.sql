DROP PROCEDURE IF EXISTS getProducts//

DELIMITER //
     CREATE PROCEDURE getProducts()
        BEGIN
            SELECT 
                p_id AS id_producto,
                p_nombre AS nombre_producto,
                p_precio AS precio_producto,
                p_stock AS stock_producto,
                c_nombre AS nombre_categoria,
                a_id AS id_adicional,
                a_nombre AS nombre_adicional,
                a_precio AS precio_adicional,
                a_stock AS stock_adicional,
                a_maxCantidad AS max_cantidad_adicional,
                axp_id AS idAxp
            FROM productos p
            INNER JOIN categorias c 
            ON p_idCategoria = c_id
            AND c_estado = 1
            LEFT JOIN adicionalesxproductos AS axp 
            ON p_id = axp_idProducto
            LEFT JOIN adicionales a 
            ON axp_idAdicional = a_id
            AND a_estado = 1
            WHERE p_estado = 1;

    END//
DELIMITER;