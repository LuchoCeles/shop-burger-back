DROP PROCEDURE IF EXISTS updateMPState;

DELIMITER //

CREATE PROCEDURE updateMPState(
    IN p_id INT,
    IN p_mpEstado TINYINT
)

BEGIN
    UPDATE DatosBancarios 
      SET mpEstado = p_mpEstado
    WHERE id = p_id;

    SELECT * FROM DatosBancarios WHERE id = p_id;
END //

DELIMITER ;