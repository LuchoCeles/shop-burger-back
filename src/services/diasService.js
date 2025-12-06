const { DiasModel } = require("../models");
class DiasService {
  async getAll() {
    try {
      const dias = await DiasModel.findAll({
        attributes: ["id", "nombre", "estado"],
      });
      return dias;
    } catch (error) {
      throw new Error(`Error al obtener los días ${error.message}`);
    }
  }
}

module.exports = DiasService;
