const { DiasService } = require("../services/diasService");
class DiasController {
  async getAll(req, res) {
    try {
      const dias = await DiasService.getAll();
      return res.status(200).json({
        success: true,
        data: dias,
        message: "Días obtenidos correctamente",
      });
    } catch (error) {
     return res.status(500).json({ message: error.message, success: false });
    }
  }
}

module.exports = new DiasController();
