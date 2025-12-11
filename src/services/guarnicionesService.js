const { Guarniciones, Tam } = require("../models");
const { sequelize } = require("../config/db");

class GuarnicionesService {
  async getAll() {
    try {
      const guarniciones = await Guarniciones.findAll({
        attributes: ["id", "nombre", "stock", "estado"],
        order: [["id", "DESC"]],
      });
      return guarniciones;
    } catch (error) {
      throw new Error(`Error al obtener guarniciones ${error.message}`);
    }
  }

  async createGuarnicion(data) {
    const transaction = await sequelize.transaction();
    try {
      const nuevaGuarnicion = await Guarniciones.create({
        nombre: data.nombre,
        stock: data.stock

      }, { transaction });
      await transaction.commit();
      return nuevaGuarnicion;
    } catch (error) {
      await transaction.rollback();
      throw new Error(`ERROR al crear guarnicion: ${error.message}`);
    }
  }
  async update(id, data) {
    const transaction = await sequelize.transaction();
    try {
      const { tamId } = data;

      const guarnicion = await Guarniciones.findByPk(id);

      guarnicion.nombre = data.nombre;
      guarnicion.stock = data.stock;
      await guarnicion.save({ transaction });

      if (tamId && Array.isArray(tamId)) await guarnicion.setTam(tamId);

      const guarnicionActualizada = await Guarniciones.findByPk(id, {
        include: {
          model: Tam,
          as: 'tam',
          through: { attributes: [] }
        }
      });

      await transaction.commit();
      return guarnicionActualizada;
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al modificar la guarnición: ${error.message}`);
    }
  }

  async updateEstado(id) {
    const transaction = await sequelize.transaction();
    try {
      const guarnicion = await Guarniciones.findByPk(id);
      guarnicion.estado = guarnicion.estado === 1 ? 0 : 1;

      await guarnicion.save({ transaction });
      await transaction.commit();

      return guarnicion;
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al eliminar guarnicion ${error.message}`);
    }
  }
}

module.exports = new GuarnicionesService();
