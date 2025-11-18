
DROP PROCEDURE IF EXISTS updateDia;

DELIMITER //
CREATE PROCEDURE updateDia(
    IN p_id INT,
    IN p_idHorario INT,
    IN p_nombreDia VARCHAR(50),
    IN p_estado TINYINT
)
BEGIN
    UPDATE Dias
    SET idHorario = p_idHorario,
        nombreDia = p_nombreDia,
        estado = p_estado
    WHERE id = p_id;
END //
DELIMITER ;
