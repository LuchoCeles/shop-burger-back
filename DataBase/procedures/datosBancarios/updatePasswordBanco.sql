DROP PROCEDURE IF EXISTS updatePasswordBanco;

DELIMITER //

CREATE PROCEDURE updatePasswordBanco(
    IN p_id INT,
    IN p_password VARCHAR(100)
)

BEGIN
    UPDATE DatosBancarios 
      SET password = p_password, updatedAt = CURRENT_TIMESTAMP()
    WHERE id = p_id;
END //

DELIMITER ;