const envioService = require("../services/envioService");

class EnvioController {
  async get(req, res) {
    try {
      const data = await envioService.get();
      return res.status(200).json({
        success: true,
        data: {
          id: data.id,
          precio: Number(data.precio),
          estado: data.estado
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const precio = req.body;
      const data = await envioService.update(id, precio);
      return res.status(200).json({
        success: true,
        message: "Envio actualizado correctamente",
        data: {
          id: data.id,
          precio: Number(data.precio),
          estado: data.estado
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new EnvioController();
