DROP PROCEDURE IF EXISTS createDia;
DELIMITER //
CREATE PROCEDURE createDia(
    IN p_idHorario INT,
    IN p_nombreDia VARCHAR(50),
    IN p_estado TINYINT
)
BEGIN
    INSERT INTO Dias(idHorario, nombreDia, estado)
    VALUES (p_idHorario, p_nombreDia, 1);
END //
DELIMITER ;
