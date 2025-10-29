const {sequelize} = require("../config/db");
const { Adicionales, AdicionalesXProducto } = require("../models");

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
      // Llamamos al procedimiento
      await sequelize.query(
        "CALL deleteAdicional(:id)",
        { replacements: { id }, transaction }
      );

      await transaction.commit();
      return { message: "Adicional eliminado correctamente" };
    } catch (error) {
      if (!transaction.finished) await transaction.rollback();

      console.error("💥 Error SQL al eliminar adicional:", error); // <-- Log completo en consola

      // Lanzamos el error original para que llegue al controller
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
