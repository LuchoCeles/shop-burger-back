DROP PROCEDURE IF EXISTS getAllCategories;

DELIMITER //

CREATE PROCEDURE getAllCategories()
BEGIN
    SELECT id, nombre, estado
      FROM Categorias;
END //

DELIMITER ;