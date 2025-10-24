DROP PROCEDURE IF EXISTS loginBanco;

DELIMITER //

CREATE PROCEDURE loginBanco(
    IN p_cuit VARCHAR(20)
)
BEGIN
    SELECT * FROM DatosBancarios WHERE cuit = p_cuit ;
END //

DELIMITER ;