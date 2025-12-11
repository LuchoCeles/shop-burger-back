const { GuarnicionesXProducto } = require("../models");
const { sequelize } = require("../config/db");

class GuarnicionesXProductoService {
  async create(data) {
    const transaction = await sequelize.transaction();
    try {
      const prod = await GuarnicionesXProducto.create(data, { transaction });
      await transaction.commit();

      return prod;
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al asignale guarnicion al producto ${error.message}`);
    }
  }

  async delete(id) {
    const transaction = await sequelize.transaction();
    try {
      const prod = await GuarnicionesXProducto.findByPk(id);

      await prod.destroy({ transaction });
      await transaction.commit();

      return true;
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al eliminar la relación ${error.message}`);
    }
  }
}

module.exports = new GuarnicionesXProductoService();
