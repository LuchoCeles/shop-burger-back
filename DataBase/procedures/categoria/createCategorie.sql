DROP PROCEDURE IF EXISTS createCategorie;

DELIMITER //
CREATE PROCEDURE createCategorie(
    IN p_nombre VARCHAR(100)
)
BEGIN
    INSERT INTO Categorias (nombre)
    VALUES (p_nombre);

    SELECT LAST_INSERT_ID() AS new_category_id;

    SELECT * FROM Categorias WHERE id = LAST_INSERT_ID();
END //

DELIMITER ;