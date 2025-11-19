const { Tam } = require("../models");

class TamService {
  async get() {
    try {
      const tams = await Tam.findAll({
        order: ['id','ASC']
      });
      return tams;
    } catch (error) {
        throw new Error(`Error al obtener los tamaños de guarnicion ${error.message}`);
    }
  }
}

module.exports = new TamService();
