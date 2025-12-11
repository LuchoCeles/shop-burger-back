const { Tam } = require("../models");
const { sequelize } = require("../config/db");

class TamService {
  async create(data) {
    const transaction = await sequelize.transaction();
    try {
      const tam = await Tam.create(data, { transaction });
      await transaction.commit();
      return tam;
    } catch (error) {
      await transaction.rollback();
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
      throw new Error(`Error al obtener los tamaños de guarnicion ${error.message}`);
    }
  }

  async updateTam(id, data) {
    const transaction = await sequelize.transaction();
    try {
      const tam = await Tam.findByPk(id);

      await tam.update(data, { transaction });
      await transaction.commit();
      return tam;
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al actualizar ${error.message}`);
    }
  }

  async updateEstado(id) {
    const transaction = await sequelize.transaction();
    try {
      const tam = await Tam.findByPk(id);
      tam.estado = tam.estado === 1 ? 0 : 1;

      await tam.save({ transaction });
      await transaction.commit();

      return tam;
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al actualizar datos de "combo" ${error.message}`);
    }
  }

  async delete(id) {
    const transaction = await sequelize.transaction();
    try {
      const tam = await Tam.findByPk(id);
      await tam.destroy({ transaction });
      await transaction.commit();

      return true;
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al eliminar datos de "combo" ${error.message}`);
    }
  }
}

module.exports = new TamService();
