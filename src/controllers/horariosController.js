const horarioService = require("../services/horarioService");
class HorariosController {
  async create(req, res) {
    try {
      const datos = req.body;

      const result = await horarioService.createHorario(datos);

      return res.status(201).json({
        success: true,
        message: "Horario creado correctamente",
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getAll(req, res) {
    try {
      const result = await horarioService.getAll();

      return res.status(200).json({
        success: true,
        message: "Horarios obtenidos correctamente",
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateHorario(req, res) {
    const datos = { id: req.params.id, ...req.body };
    try {
      const result = await horarioService.updateHorario(datos);
      return res.status(200).json({
        success: true,
        message: "Horario actualziado",
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async deleteHorario(req, res) {
    try {
      const id = req.params.id;
      const result = await horarioService.deleteHorario(id);
      return res.status(200).json({
        success: true,
        message: "Horario eliminado correctamente",
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}
module.exports = new HorariosController();
