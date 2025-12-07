DROP PROCEDURE IF EXISTS updateMPState;

DELIMITER //

CREATE PROCEDURE updateMPState(
    IN p_id INT,
    IN p_mpEstado TINYINT,
    IN p_mercadoPagoAccessToken VARCHAR(70)
)

BEGIN
    UPDATE DatosBancarios 
      SET updatedAt = CURRENT_TIMESTAMP(), mercadoPagoAccessToken = p_mercadoPagoAccessToken
    WHERE id = p_id;

    UPDATE MetodosDePago
      SET estado = p_mpEstado
    WHERE nombre = 'Mercado Pago';

    CALL getBanco();
END //

DELIMITER ;