DROP PROCEDURE IF EXISTS deleteAdicional;
DELIMITER //

CREATE PROCEDURE deleteAdicional(IN p_id INT)
BEGIN
    DECLARE v_asociado INT DEFAULT 0;

    -- Verificar si el adicional existe
    IF NOT EXISTS (SELECT 1 FROM adicionales WHERE id = p_id) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Adicional no encontrado';
    END IF;

    -- Verificar asociaciones
    SELECT COUNT(*) INTO v_asociado
    FROM adicionalesxproductos
    WHERE idAdicional = p_id;

    -- Si está asociado, primero eliminar esas relaciones
    IF v_asociado > 0 THEN
        DELETE FROM adicionalesxproductos WHERE idAdicional = p_id;
    END IF;

    -- Eliminar el adicional
    DELETE FROM adicionales WHERE id = p_id;

    -- Retornar mensaje de éxito
    SELECT 'Adicional eliminado correctamente' AS message;
END //

DELIMITER ;
