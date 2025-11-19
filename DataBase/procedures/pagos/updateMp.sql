DROP PROCEDURE IF EXISTS updateMp;

DELIMITER //

CREATE PROCEDURE updateMp ( 
  IN p_id INT,
  IN p_estado VARCHAR(50)
)
BEGIN
 UPDATE pagos SET estado = p_estado WHERE id = p_id;
END //

DELIMITER ;