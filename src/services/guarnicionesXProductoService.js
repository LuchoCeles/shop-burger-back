const { GuarnicionesXProducto } = require("../models");

class GuarnicionesXProductoService {

  async create(data) {
    try {
      const prod = await GuarnicionesXProducto.create(data);
      return prod;
    } catch (error) {
      throw new Error(
        `Error al asignale guarnicion al producto ${error.message}`
      );
    }
  }
  async delete(id) {
    try {
      const prod = await GuarnicionesXProducto.findByPk(id);
      await prod.destroy();
      return { message: "Relación eliminada correctamente" };
    } catch (error) {
      throw new Error(`Error al eliminar la relación ${error.message}`);
    }
  }
}

module.exports = new GuarnicionesXProductoService();
