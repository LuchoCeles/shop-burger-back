// src/controllers/GuarnicionesController.js

const guarnicionesService = require("../services/guarnicionesService");

class GuarnicionesController {

  getAll = async (req, res, next) => { 
    try {
      const guarniciones = await guarnicionesService.getAll();
      
      return res.status(200).json({
        success: true,
        data: guarniciones,
      });
    } catch (error) {
      next(error);
    }
  }

  create = async (req, res, next) => {
    try {
      const data = req.body;
      const guarnicion = await guarnicionesService.createGuarnicion(data);
      
      return res.status(201).json({
        success: true,
        message: "Guarnicion creada correctamente",
        data: guarnicion,
      });
    } catch (error) {
      next(error);
    }
  }

  update = async (req, res, next) => {
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
      next(error);
    }
  }

  updateEstado = async (req, res, next) => {
    try {
      const { id } = req.params;

      await guarnicionesService.updateEstado(id);

      return res.status(200).json({
        success: true,
        message: "Guarnicion dada de baja",
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new GuarnicionesController();