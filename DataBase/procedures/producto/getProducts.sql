DROP PROCEDURE IF EXISTS getProducts;
DELIMITER //

CREATE PROCEDURE getProducts(
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
END //

DELIMITER ;