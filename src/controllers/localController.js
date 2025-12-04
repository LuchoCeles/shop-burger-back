const localService = require("../services/localService");

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
  };

  createLocal = async (req, res) => {
    try {
      const data = req.body;

      if (!data.direccion || !data.direccion.trim()) {
        return res.status(400).json({
          success: false,
          message: "El campo 'direccion' es obligatorio",
        });
      }

      const local = await localService.createLocal(data);

      return res.status(201).json({
        success: true,
        message: "Local creado correctamente",
        data: local,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

  deleteLocal = async (req, res) => {
    try {
      const { id } = req.params;
      const nuevoEstado = await localService.delete(id);

      return res.status(200).json({
        success: true,
        message: "Local dado de baja",
        data: nuevoEstado,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

  updateDireccion = async (req, res) => {
    try {
      const { id } = req.params;
      const { direccion } = req.body;

      if (!direccion || typeof direccion !== 'string' || !direccion.trim()) {
        return res.status(400).json({
          success: false,
          message: "El campo 'direccion' es obligatorio y debe ser un texto.",
        });
      }

      const local = await localService.updateLocal(id, direccion.trim());

      return res.status(200).json({
        success: true,
        message: "Direccion cambiada correctamente",
        data: local,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
}

module.exports = new LocalController();
