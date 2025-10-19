const { where } = require("sequelize");
const { AdicionalesXProducto, sequelize,Producto,Adicionales } = require("../models");
const models = require("../models");
class AdicionalesXProductosService {
 
  async create(data) {
    const transaction = await sequelize.transaction();
    try {
      const { idProducto, idAdicional } = data;
      const registro = await AdicionalesXProducto.create(
        { idProducto, idAdicional },
        { transaction }
      );

      await transaction.commit();
      return registro;
    } catch (error) {
      if (!transaction.finished) await transaction.rollback();
      throw new Error(`Error al crear relación: ${error.message}`);
    }
  }
  
  async update(id, data) {
    const transaction = await sequelize.transaction();
    try {
      const registro = await AdicionalesXProducto.findByPk(id);
      if (!registro) throw new Error(`No encontrado`);

      await registro.update(data, { transaction });
      await transaction.commit();
      return registro;
    } catch (error) {
      if (!transaction.finished) await transaction.rollback();
      throw new Error(`Error al actualizar relación: ${error.message}`);
    }
  }

  async delete(id) {
    const transaction = await sequelize.transaction();
    try {
      const registro = await AdicionalesXProducto.findByPk(id);
      if (!registro) throw new Error(`Adicional no encontrado`);

      await registro.destroy({ transaction });
      await transaction.commit();

      return { message: "Adicional eliminado." };
    } catch (error) {
      if (!transaction.finished) await transaction.rollback();
      throw new Error(`Error al eliminar relación: ${error.message}`);
    }
  }
}
module.exports = new AdicionalesXProductosService();
