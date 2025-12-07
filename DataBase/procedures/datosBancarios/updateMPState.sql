DROP PROCEDURE IF EXISTS updateMPState;

DELIMITER //

CREATE PROCEDURE updateMPState(
    IN p_id INT,
    IN p_mpEstado TINYINT
)

BEGIN
    UPDATE DatosBancarios 
      SET updatedAt = CURRENT_TIMESTAMP(), mercadoPagoAccessToken = p_mercadoPagoAccessToken
    WHERE id = p_id;

    UPDATE MetodosDePago AS m
      SET estado = p_mpEstado
    WHERE m.nombre = 'Mercado Pago';

    CALL getBanco();
END //

DELIMITER ;