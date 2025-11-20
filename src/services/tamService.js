const { Tam } = require("../models");

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
        order: [["id", "ASC"]],
      });
      return tams;
    } catch (error) {
      throw new Error(
        `Error al obtener los tamaños de guarnicion ${error.message}`
      );
    }
  }

  async update(id) {
    try {
      const tam = await Tam.findByPk(id);
      tam.estado = tam.estado === 1 ? 0 : 1;

      await tam.save();

      return tam;
    } catch (error) {
      throw new Error(`Error al actualizar datos de "combo" ${error.message}`);
    }
  }
}

module.exports = new TamService();
