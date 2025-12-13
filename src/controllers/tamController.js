const tamService = require("../services/tamService");

class TamController {
  async get(req, res) {
    try {
      const tam = await tamService.get();
      return res.status(200).json({
        success: true,
        message: "Tamaños de combos obtenidos",
        data: tam
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async create(req, res) {
    try {
      const { data } = req.body;

      const tam = await tamService.create(data);
      return res.status(201).json({
        success: true,
        message: "Tamaño de 'combo' creado correctamente",
        data: tam
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateEstado(req, res) {
    try {
      const { id } = req.params;

      const tam = await tamService.updateEstado(id);

      return res.status(200).json({
        success: true,
        message: "Tamaño de combro modificado",
        data: tam,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateTam(req, res) {
    try {
      const { id } = req.params;
      const { data } = req.body;
      const tam = await tamService.updateTam(id, data);
      return res.status(200).json({
        success: true,
        message: "Tamaño actualizado correctamente",
        data: tam
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      await tamService.delete(id);
      return res.status(200).json({
        success: true,
        message: "Tamaño eliminado correctamente"
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new TamController();