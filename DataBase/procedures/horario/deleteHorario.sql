DROP PROCEDURE IF EXISTS deleteHorario;
DELIMITER $$

CREATE PROCEDURE deleteHorario(IN p_id INT)
BEGIN
/*Desactiva horario y elimina relación con días.*/
    UPDATE horario SET estado = 0 WHERE id = p_id;
    DELETE FROM horario_dias WHERE idHorario = p_id;

    SELECT 'Horario eliminado' AS mensaje;
END$$

DELIMITER ;
