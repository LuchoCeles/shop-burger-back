DROP PROCEDURE IF EXISTS createAdmin;

DELIMITER //

CREATE PROCEDURE createAdmin(
    IN p_nombre VARCHAR(100),
    IN p_password VARCHAR(255)
)
BEGIN
    INSERT INTO Admin (nombre, password)
    VALUES (p_nombre, p_password);

    SELECT LAST_INSERT_ID() AS id;

    SELECT id, nombre
      FROM Admin
    WHERE id = LAST_INSERT_ID();
END //

DELIMITER ;