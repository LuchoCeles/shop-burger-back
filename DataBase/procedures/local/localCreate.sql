DROP PROCEDURE IF EXISTS createLocal;

DELIMITER //
CREATE PROCEDURE createLocal(
    IN p_idDia INT,
    IN p_direccion VARCHAR(255)
)
BEGIN
    INSERT INTO Local(idDia, direccion)
    VALUES (p_idDia, p_direccion);
END //
DELIMITER ;
