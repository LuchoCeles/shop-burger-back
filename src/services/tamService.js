const { Tam, Categoria } = require("../models");

class TamService {
  async create(data) {
    try {
      const tam = await Tam.create(data);
      return tam;
    } catch (error) {
      throw new Error(`Error al crear tamaño del "combo" ${error.message}`);
    }
  }

  async get() {
    try {
      const tams = await Tam.findAll({
        attributes: ["id", "nombre", "idCategoria", "estado"]
      });
      return tams;
    } catch (error) {
      throw new Error(
        `Error al obtener los tamaños de guarnicion ${error.message}`
      );
    }
  }

  async updateTam(id, data) {
    try {
      const tam = await Tam.findByPk(id);
      await tam.update(data);
      return tam;
    } catch (error) {
      throw new Error(`Error al actualizar ${error.message}`);
    }
  }

  async updateEstado(id) {
    try {
      const tam = await Tam.findByPk(id);
      tam.estado = tam.estado === 1 ? 0 : 1;

      await tam.save();

      return tam;
    } catch (error) {
      throw new Error(`Error al actualizar datos de "combo" ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const tam = await Tam.findByPk(id);
      await tam.destroy();
      return { message: "Tamaño eliminado correctamente" };
    } catch (error) {
      throw new Error(`Error al eliminar datos de "combo" ${error.message}`);
    }
  }
}

module.exports = new TamService();
