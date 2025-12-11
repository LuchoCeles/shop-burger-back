const { sequelize } = require("../config/db");
const { Adicionales } = require("../models");

class AdicionalesService {
  async getAll(isActive = false) {
    try {
      const where = isActive ? { where: { estado: true } } : {};
      return await Adicionales.findAll(where);
    } catch (error) {
      throw new Error(`Error al obtener los adicionales: ${error.message}`);
    }
  }

  async create(adicional) {
    try {
      const transaction = await sequelize.transaction();

      const newAdicional = await Adicionales.create(adicional, { transaction });
      await transaction.commit();

      return newAdicional;
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al crear el adicional: ${error.message}`);
    }
  }

  async update(id, adicional) {
    try {
      const transaction = await sequelize.transaction();
      const existingAdicional = await Adicionales.findByPk(id);

      if (!existingAdicional) throw new Error("Adicional no encontrado");

      const updatedAdicional = await existingAdicional.update(adicional, { transaction });
      await transaction.commit();

      return updatedAdicional;
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al actualizar el adicional: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const transaction = await sequelize.transaction();

      await sequelize.query("CALL deleteAdicional(:id)",
        { replacements: { id }, transaction }
      );

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al eliminar adicional: ${error.message}`);
    }
  }

  async changeState(id) {
    try {
      const transaction = await sequelize.transaction();
      const existingAdicional = await Adicionales.findByPk(id);

      if (!existingAdicional) throw new Error("Adicional no encontrado");

      existingAdicional.estado = !existingAdicional.estado;

      await existingAdicional.save({ transaction });
      await transaction.commit();

      return existingAdicional;
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al cambiar el estado del adicional: ${error.message}`);
    }
  }
}

module.exports = new AdicionalesService();
