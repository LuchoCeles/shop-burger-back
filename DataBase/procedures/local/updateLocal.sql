DROP PROCEDURE IF EXISTS updateLocal;

DELIMITER //
CREATE PROCEDURE updateLocal(
    IN p_id INT,
    IN p_idDia INT,
    IN p_direccion VARCHAR(255)
)
BEGIN
    UPDATE Local
    SET idDia = p_idDia,
        direccion = p_direccion
    WHERE id = p_id;
END //
DELIMITER ;
