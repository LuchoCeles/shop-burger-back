const { sequelize } = require("../models");

class HorarioService {
  async createHorario(datos) {
    try {
      return await sequelize.query("CALL createHorario(:datos);", {
        replacements: {
          datos: JSON.stringify(datos),
        },
      });
    } catch (error) {
      throw new Error(`error al crear horario ${error.message}`);
    }
  }

  async getAll() {
    try {
      return await sequelize.query("CALL getHorario()");
    } catch (error) {
      throw new Error(`Error al obtener Horarios`);
    }
  }

  async updateHorario(datos) {
    try {
      return await sequelize.query("CALL updateHorario(:datos);", {
        replacements: {
          datos: JSON.stringify(datos),
        },
      });
    } catch (error) {
      throw new Error(`Error al actualizar datos ${error.message}`);
    }
  }

  async deleteHorario(id) {
    try {
      return await sequelize.query("CALL deleteHorario(:id);", {
        replacements: {id},
      });
    } catch (error) {
      throw new Error(`Error al aliminar Horario ${error.message}`);
    }
  }
}

module.exports = new HorarioService();
