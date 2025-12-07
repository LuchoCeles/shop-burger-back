DROP PROCEDURE IF EXISTS getBanco;

DELIMITER //

CREATE PROCEDURE getBanco()
BEGIN
    SELECT id, cuit, alias, cbu, apellido, nombre, mercadoPagoAccessToken, (SELECT estado FROM MetodosDePago WHERE nombre = 'Mercado Pago') AS mpEstado
      FROM DatosBancarios
    LIMIT 1;
END //

DELIMITER ;