DROP PROCEDURE IF EXISTS updateCategorie;
DELIMITER //

CREATE PROCEDURE updateCategorie(
    IN p_id INT,
    IN p_nombre VARCHAR(100)
)

BEGIN
    UPDATE Categorias
    SET nombre = p_nombre
    WHERE id = p_id;

    SELECT * FROM Categorias WHERE id = p_id;
END //

DELIMITER ;