DROP PROCEDURE IF EXISTS updateMp;

DELIMITER //

CREATE PROCEDURE updateMp ( 
  IN p_id INT,
  IN p_estado VARCHAR(50)
)
BEGIN
 DECLARE v_idPedido INT;

 UPDATE pagos SET estado = p_estado WHERE id = p_id;

 IF p_estado = 'Cancelado' THEN

   SELECT idPedido INTO v_idPedido FROM pagos WHERE id = p_id;
   
   IF v_idPedido IS NOT NULL THEN
     UPDATE pedidos SET estado = 'Cancelado' WHERE id = v_idPedido;
   END IF;
 END IF;
END //

DELIMITER ;