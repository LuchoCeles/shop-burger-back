DROP PROCEDURE IF EXISTS getProducts ;
DELIMITER //

CREATE PROCEDURE getProducts(
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

        ROUND(p.precio - (p.precio *( p.descuento / 100)), 2) AS precioFinal,

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
                    CONCAT(
                        '[',
                        GROUP_CONCAT(
                            CONCAT(
                                '{"id":', a.id,
                                ',"nombre":"', a.nombre, '"',
                                ',"precio":', a.precio,
                                ',"stock":', a.stock,
                                ',"maxCantidad":', a.maxCantidad,
                                ',"idAxp":', axp.id,
                                '}'
                            ) SEPARATOR ','
                        ),
                        ']'
                    )
                FROM adicionalesxproductos axp
                INNER JOIN adicionales a ON axp.idAdicional = a.id
                WHERE axp.idProducto = p.id
                  AND a.estado = 1
            ),
            '[]'
        ) AS adicionales

    FROM productos p
    WHERE (p_estado = 0 OR p.estado = 1);
END //

DELIMITER ;