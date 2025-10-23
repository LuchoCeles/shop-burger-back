DELIMITER //

CREATE PROCEDURE login(IN p_nombre VARCHAR(100))
BEGIN
  SELECT id, nombre, password 
    FROM Admin 
  WHERE nombre = p_nombre;
END //

DELIMITER ;
