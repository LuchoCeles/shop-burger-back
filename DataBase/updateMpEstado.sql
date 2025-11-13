DROP PROCEDURE IF EXISTS updateMpEstado;

DELIMITER //

CREATE PROCEDURE updateMpEstado (
  IN p_idPedido INT, -- Renombramos el parámetro para mayor claridad
  IN p_estado VARCHAR(50)
)
BEGIN
  -- Actualizamos la tabla 'pagos' DONDE la clave foránea 'idPedido' coincide
  UPDATE pagos SET estado = p_estado WHERE idPedido = p_idPedido;

END //

DELIMITER ;