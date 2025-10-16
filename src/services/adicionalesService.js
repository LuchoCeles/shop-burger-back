const { where } = require("sequelize");
const { Adicionales, sequelize, AdicionalesXProducto } = require("../models");

class AdicionalesService {
  async getAll(isActive = false) {
    const where = isActive ? { where: { estado: true } } : {};
    return await Adicionales.findAll(where);
  }

  async create(adicional) {
    return await Adicionales.create(adicional);
  }

  async update(id, adicional) {
    const existingAdicional = await Adicionales.findByPk(id);
    if (!existingAdicional) {
      throw new Error("Adicional no encontrado");
    }
    return await existingAdicional.update(adicional);
  }

  async delete(id) {
    const transaction = await sequelize.transaction();
    try {
      const existingAdicional = await Adicionales.findByPk(id, { transaction });
      if (!existingAdicional) {
        throw new Error("Adicional no encontrado");
      }

      const asociados = await AdicionalesXProducto.count({
        where: { idAdicional: id }, //verificar
        transaction,
      });

      if (asociados > 0) {
        throw new Error(`No se puede eliminar, esta asociado a un producto.`);
      }

      await existingAdicional.destroy({ transaction });

      await transaction.commit();

      return { message: "Adicional eliminado correctamente" };
      
    } catch (error) {
      if (!transaction.finished) await transaction.rollback();
      throw new Error(`Error al eliminar adicional: ${error.message}`);
    }
  }

  async changeState(id) {
    const existingAdicional = await Adicionales.findByPk(id);
    if (!existingAdicional) {
      throw new Error("Adicional no encontrado");
    }
    existingAdicional.estado = !existingAdicional.estado;
    await existingAdicional.save();
    return existingAdicional;
  }
}

module.exports = new AdicionalesService();
