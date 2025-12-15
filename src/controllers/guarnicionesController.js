const guarnicionesService = require("../services/guarnicionesService");

class GuarnicionesController {

  async getAll(req, res) {
    try {
      const guarniciones = await guarnicionesService.getAll();

      return res.status(200).json({
        success: true,
        data: guarniciones,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async create(req, res) {
    try {
      const data = req.body;
      const guarnicion = await guarnicionesService.createGuarnicion(data);

      return res.status(201).json({
        success: true,
        message: "Guarnicion creada correctamente",
        data: guarnicion,
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

      const guarnicion = await guarnicionesService.update(id, data);

      return res.status(200).json({
        success: true,
        message: "Guarnicion actualizada correctamente",
        data: guarnicion,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateEstado(req, res) {
    try {
      const { id } = req.params;

      const guarnicion = await guarnicionesService.updateEstado(id);

      return res.status(200).json({
        success: true,
        message: "Guarnicion dada de baja",
        data: guarnicion,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new GuarnicionesController();