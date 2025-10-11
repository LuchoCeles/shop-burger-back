const datosBancariosService = require("../services/datosBancariosService");

class DatosBancariosController {
  async create(req, res) {
    try {
      const { banco } = req.body;

      const d = await datosBancariosService.create({banco});

      return res.status(201).json({
        mensaje: "Datos creados exitosamente",
        data: d,
      });
    } catch (error) {
      return res.status(500).json({
        error: error.message,
      });
    }
  }
  async get (req,res,next){
    try {
      const datos = await datosBancariosService.get();
      res.status(200).json({
        success : true,
        data:datos,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DatosBancariosController();
