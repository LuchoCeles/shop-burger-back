const adicionalesXProductosService = require("../services/adicionalesXProductosService");

class AdicionalesXProductosController {
  async create(req, res) {
    try {
      const registro = await adicionalesXProductosService.create(req.body);
      res.status(201).json({
        success: true,
        message: "Adicional agregado",
        data: registro,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const resultado = await adicionalesXProductosService.delete(id);

      if (resultado) res.status(200).json({ success: true, message: "Adicional eliminado." });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new AdicionalesXProductosController();
