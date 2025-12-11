const GuarnicionesXProductoService = require("../services/guarnicionesXProductoService");

class GuarnicionesXProductoController {
  async create(req, res) {
    try {
      const { idProducto, idGuarnicion } = req.body;

      const prod = await GuarnicionesXProductoService.create({ idProducto, idGuarnicion });
      return res.status(201).json({
        success: true,
        message: "Asociacion guarnicion producto creada",
        data: prod,
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const result = await GuarnicionesXProductoService.delete(id);
      if (result) return res.status(200).json({
        success: true,
        message: "Asociacion guarnicion producto eliminada"
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
module.exports = new GuarnicionesXProductoController();