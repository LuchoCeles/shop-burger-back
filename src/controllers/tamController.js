const tamService = require("../services/tamService");

class TamController {
  get = async (req, res) => {
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

  create = async (req, res) => {
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

  updateEstado = async (req, res) => {
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

  updateTam = async (req, res) => {
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

  delete = async (req, res) => {
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