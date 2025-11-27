class EnvioController {
  async create(req, res) {
    try {
      const data = req.body;
      const envio = await envioService.create(data);
      return res.status(200).json({
        success: true,
        message: "Datos de envio creado exitosamente",
        data: envio,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getAll(req, res) {
    try {
      const data = await envioService.getAll();
      return res.status(200).json({
        success: true,
        data: data,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateState(req, res) {
    try {
      const id = req.params.id;
      const data = await envioService.updateState(id);
      return res.status(200).json({
        success: true,
        message: "Estado del envio actualizado correctamente",
        data: data,
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
      const data = req.body;
      const envio = await envioService.update(id, data);
      return res.status(200).json({
        success: true,
        message: "Envio actualizado correctamente",
        data: envio,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
  async getById(req, res) {
    try {
      const { id } = req.params;
      const envio = await envioService.getById(id);
      return res.status(200).json({
        success: true,
        data: envio,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = EnvioController;
