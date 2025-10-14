const datosBancariosService = require("../services/datosBancariosService");

class DatosBancariosController {
  async create(req, res) {
    try {
      const { banco } = req.body;

      const d = await datosBancariosService.create({banco});
      
      return res.status(201).json({
        message: "Datos creados exitosamente",
        data: d,
      });
    } catch (error) {
      return res.status(500).json({
        error: error.message,
      });
    }
  }
}

module.exports = new DatosBancariosController();
