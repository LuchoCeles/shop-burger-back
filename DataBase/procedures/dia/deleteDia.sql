DROP PROCEDURE IF EXISTS deleteDia;

DELIMITER //
CREATE PROCEDURE deleteDia(IN p_id INT)
BEGIN
    DELETE FROM Dias WHERE id = p_id;
    SET MESSAGE_TEXT = 'No se puede borrar, tiene Local asignado';
END //
DELIMITER ;
