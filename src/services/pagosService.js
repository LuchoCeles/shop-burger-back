const { sequelize } = require("../config/db");
const { Pago } = require('../models');
const { Op } = require('sequelize');

class PagosService {
  async updateMp(id, estado) {
    const transaction = await sequelize.transaction();
    try {
      await sequelize.query("CALL updateMp(:id,:estado);", {
        replacements: { id, estado },
        transaction,
      });
      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw new Error("Error al actualizar el estado del pago");
    }
  }

  async getPagosExpirados(id, umbral) {
    try {
      const pagosExpirados = await Pago.findAll({
        where: {
          estado: 'Pendiente',
          idMetodoDePago: id,
          createdAt: {
            [Op.lt]: umbral
          }
        }
      });
      return pagosExpirados;
    } catch (error) {
      throw new Error("Error al buscar los pagos expirados.");
    }
  }

}

module.exports = new PagosService();