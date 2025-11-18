DROP PROCEDURE IF EXISTS getHorarios;
DELIMITER $$

CREATE PROCEDURE getHorarios()
BEGIN
    SELECT 
        h.id AS idHorario,
        h.idLocal,
        h.horarioApertura,
        h.horarioCierre,
        d.id AS idDia,
        d.nombreDia
    FROM horario h
    JOIN horario_dias hd ON hd.idHorario = h.id
    JOIN dias d ON d.id = hd.idDia
    WHERE h.estado = 1
      AND d.estado = 1
    ORDER BY h.id, d.id;
END$$

DELIMITER ;
