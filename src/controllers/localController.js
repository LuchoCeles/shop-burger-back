const localService = require('../services/localService');

class LocalController {

  getAll = async (req, res) => {
    try {
      const locales = await localService.getAll();

      return res.status(200).json({
        success: true,
        message: "Lista de locales obtenida correctamente",
        data: locales,
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new LocalController();