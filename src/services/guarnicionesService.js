const { Guarniciones, Tam } = require("../models");

class GuarnicionesService {
  async getAll() {
    try {
      const guarniciones = await Guarniciones.findAll({
        attributes: ["id", "nombre"],
        include: [
          {
            model: Tam,
            as : "tam",
            attributes : ["id","nombre","estado"],
          },
        ],
        order: [["id", "DESC"]],
      });
      return guarniciones;
    } catch (error) {
      throw new Error(`Error al obtener guarniciones ${error.message}`);
    }
  }

  async createGuarnicion(data) {
    try {
      const guarnicion = await Guarniciones.create(data);
      return guarnicion;
    } catch (error) {
      throw new Error(`ERROR al crear guarnicion ${error.message}`);
    }
  }

  async update(id, data) {
    try {
      const guarnicion = await Guarniciones.findByPk(id);

      if (!guarnicion) {
        throw new Error(`No se encontro la GUARNICION`);
      }

      await guarnicion.update(data);

      return guarnicion;
    } catch (error) {
      throw new Error(`Error al mosificar guarnicion ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const guarnicion = await Guarniciones.findByPk(id);
      if (!guarnicion) {
        throw new Error(`Guarncion no encontrada`);
      }
      await guarnicion.destroy();
      return;
    } catch (error) {
      throw new Error(`Error al eliminar guarnicion ${error.message}`);
    }
  }
}

module.exports = new GuarnicionesService();
