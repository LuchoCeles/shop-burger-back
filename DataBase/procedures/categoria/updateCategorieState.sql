DELIMITER //

CREATE PROCEDURE updateCategorieState(
    IN p_id INT,
    IN p_estado BOOLEAN
)
BEGIN
    UPDATE Categorias
    SET estado = p_estado
    WHERE id = p_id;

    SELECT * FROM Categorias WHERE id = p_id;
END //

DELIMITER ;