const {GuarnicionesXProducto } = require("../models");

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
}

module.exports = new GuarnicionesXProductoService();
