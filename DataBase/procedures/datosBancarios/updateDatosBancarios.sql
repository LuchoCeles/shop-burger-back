DROP PROCEDURE IF EXISTS updateDatosBancarios;

DELIMITER //

CREATE PROCEDURE updateDatosBancarios(
    IN p_id INT,
    IN p_cuit VARCHAR(20),
    IN p_alias VARCHAR(100),
    IN p_cbu VARCHAR(50),
    IN p_apellido VARCHAR(100),
    IN p_nombre VARCHAR(100)
)

BEGIN
    UPDATE DatosBancarios 
      SET cuit = p_cuit, alias = p_alias, cbu = p_cbu, apellido = p_apellido, nombre = p_nombre, updatedAt = CURRENT_TIMESTAMP()
    WHERE id = p_id;

    SELECT * FROM DatosBancarios WHERE id = p_id;
END //

DELIMITER ;