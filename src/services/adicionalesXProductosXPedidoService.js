const { sequelize, AdicionalesXProductosXpedido } = require("../models");

class AdicionalesXProductosXpedido {
  async create(data) {
    const transaction = await sequelize.transaction();
    try {
      const { idAdicional, cantidad, precio } = data;
      const registro = await AdicionalesXProductosXpedido.create(
        {
          idAdicional,
          cantidad,
          precio,
        },
        {
          transaction,
        }
      );
      await transaction.commit();
      return registro;
    } catch (error) {
      if (!transaction.finished) await transaction.rollback();
      throw new Error(`Error al agregar adicionales: ${error.message}`);
    }
  }

  async getAll() {
    try {
      const adicionales = await AdicionalesXProductosXpedido.findAll({
        include: [
          {
            model: ProductosXPedidos,
            as: "productoPedido",
            attributes: ["id", "idProducto", "idPedido", "cantidad"],
          },
          {
            model: Adicionales,
            as: "adicional",
            attributes: ["id", "nombre", "precio"],
          },
        ],
        order: [["id", "ASC"]],
      });

      return adicionales;
    } catch (error) {
      throw new Error(`Error al obtener los adicionales: ${error.message}`);
    }
  }

  async update(id, data) {
    const transaction = await sequelize.transaction();
    try {
      const registro = await AdicionalesXProductosXpedido.findByPk(id);
      if (!registro) throw new Error(`Adicionales no encontrados`);
      await registro.update(data, { transaction });
      await transaction.commit();
      return registro;
    } catch (error) {
      if (!transaction.finished) await transaction.rollback();
      throw new Error(`Error al actualizar: ${error.message}`);
    }
  }

  async delete(id) {
    const transaction = await sequelize.transaction();
    try {
      const registro = await AdicionalesXProductosXpedido.findByPk(id);
      if (!registro) throw new Error(`No encontrado`);
      await registro.destroy({ transaction });
      await transaction.commit();
      return { message: "Eliminado correctamente" };
    } catch (error) {
      if (!transaction.finished) await transaction.rollback();
      throw new Error(`Error al eliminar relación: ${error.message}`);
    }
  }
}
module.exports = new AdicionalesXProductosXpedido();
