DROP PROCEDURE IF EXISTS getBanco;

DELIMITER //

CREATE PROCEDURE getBanco()
BEGIN
    SELECT id, cuit, alias, cbu, apellido, nombre, mpEstado
      FROM DatosBancarios
    LIMIT 1;
END //

DELIMITER ;