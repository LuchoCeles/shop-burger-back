DROP PROCEDURE IF EXISTS createHorario;
DELIMITER $$

CREATE PROCEDURE createHorario(IN p_data JSON)
BEGIN
    DECLARE v_idLocal INT;
    DECLARE v_horaApertura TIME;
    DECLARE v_horaCierre TIME;
    DECLARE v_idHorario INT;
    DECLARE i INT DEFAULT 0;

    SET v_idLocal       = JSON_UNQUOTE(JSON_EXTRACT(p_data, '$.idLocal'));
    SET v_horaApertura  = JSON_UNQUOTE(JSON_EXTRACT(p_data, '$.horarioApertura'));
    SET v_horaCierre    = JSON_UNQUOTE(JSON_EXTRACT(p_data, '$.horarioCierre'));

    INSERT INTO horario(idLocal, horarioApertura, horarioCierre)
    VALUES (v_idLocal, v_horaApertura, v_horaCierre);

    SET v_idHorario = LAST_INSERT_ID();

    SELECT 'Horario creado correctamente' AS mensaje, v_idHorario AS idHorario;
END$$

DELIMITER ;
