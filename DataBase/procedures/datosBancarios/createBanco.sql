DROP PROCEDURE IF EXISTS createBanco;

DELIMITER //

CREATE PROCEDURE createBanco(
    IN p_cuit VARCHAR(20),
    IN p_alias VARCHAR(100),
    IN p_cbu VARCHAR(50),
    IN p_apellido VARCHAR(100),
    IN p_nombre VARCHAR(100),
    IN p_password VARCHAR(255)
)

BEGIN
    INSERT INTO DatosBancarios (cuit, alias, cbu, apellido, nombre, password, createdAt, updatedAt)
      VALUES (p_cuit, p_alias, p_cbu, p_apellido, p_nombre, p_password, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());

    SELECT * FROM DatosBancarios WHERE id = LAST_INSERT_ID();
END //

DELIMITER ;