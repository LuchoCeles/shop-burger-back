const { AdicionalesXProducto } = require("../models");
const { sequelize } = require("../config/db");

class AdicionalesXProductosService {

  async create(data) {
    try {
      const transaction = await sequelize.transaction();
      const { idProducto, idAdicional } = data;

      const registro = await AdicionalesXProducto.create(
        { idProducto, idAdicional },
        { transaction }
      );

      await transaction.commit();
      return registro;
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al crear relación: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const transaction = await sequelize.transaction();
      const registro = await AdicionalesXProducto.findByPk(id);

      if (!registro) throw new Error(`Adicional no encontrado`);

      await registro.destroy({ transaction });
      await transaction.commit();

      return true;
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al eliminar relación: ${error.message}`);
    }
  }
}
module.exports = new AdicionalesXProductosService();
