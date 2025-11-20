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
        p.precio,
        p.url_imagen,
        p.stock,
        p.idCategoria,
        p.descuento,
        p.isPromocion,
        p.estado,
        ROUND(p.precio - (p.precio * (p.descuento / 100)), 2) AS precioFinal,

        (
            SELECT c.nombre 
            FROM categorias c 
            WHERE c.id = p.idCategoria AND c.estado = 1
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
END //

DELIMITER ;