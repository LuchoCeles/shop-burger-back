const horarioDiasService = require('../services/horarioDiasService');

class HorarioDiasController {

  create = async (req, res) => {
    try {
      const { idHorario, idDia } = req.body;

      if (!idHorario || !idDia) {
        return res.status(400).json({
          success: false,
          message: "Los campos 'idHorario' y 'idDia' son obligatorios.",
        });
      }

      const result = await horarioDiasService.create({ idHorario, idDia });
      return res.status(201).json({
        success: true,
        message: "Horario asignado al día correctamente.",
        data: result,
      });
    } catch (error) {
      if (error.message.includes("ya está asignado")) {
        return res.status(409).json({ success: false, message: error.message });
      }
      return res.status(500).json({ success: false, message: error.message });
    }
  };

  getAll = async (req, res) => {
    try {
      const associations = await horarioDiasService.getAll();
      return res.status(200).json({
        success: true,
        message: "Lista de asignaciones obtenida correctamente.",
        data: associations,
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };

  delete = async (req, res) => {
    try {
      const { id } = req.params;
      const result = await horarioDiasService.delete(id);
      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      if (error.message.includes("No se encontró")) {
        return res.status(404).json({ success: false, message: error.message });
      }
      return res.status(500).json({ success: false, message: error.message });
    }
  };
}

module.exports = new HorarioDiasController();