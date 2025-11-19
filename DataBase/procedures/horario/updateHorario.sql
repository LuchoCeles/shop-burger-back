DROP PROCEDURE IF EXISTS updateHorario;

DELIMITER //

CREATE PROCEDURE updateHorario(IN p_data JSON)
BEGIN
    DECLARE v_id INT;
    DECLARE v_horarioApertura TIME;
    DECLARE v_horarioCierre TIME;
    DECLARE v_estado TINYINT;

    -- Extraemos los valores del JSON
    SET v_id = JSON_UNQUOTE(JSON_EXTRACT(p_data, '$.id'));
    SET v_horarioApertura = JSON_UNQUOTE(JSON_EXTRACT(p_data, '$.horarioApertura'));
    SET v_horarioCierre = JSON_UNQUOTE(JSON_EXTRACT(p_data, '$.horarioCierre'));
    SET v_estado = JSON_UNQUOTE(JSON_EXTRACT(p_data, '$.estado'));

    -- Realizamos la actualización en un solo paso atómico

    IF v_id = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El horario no existe o no se realizaron cambios';
    END IF;
    
    UPDATE Horario
    SET
        horarioApertura = v_horarioApertura,
        horarioCierre = v_horarioCierre,
        -- Usamos IFNULL/COALESCE aquí. Si v_estado es NULL, mantiene el valor existente.
        estado = COALESCE(v_estado, estado)
    WHERE id = v_id;
END //

DELIMITER ;