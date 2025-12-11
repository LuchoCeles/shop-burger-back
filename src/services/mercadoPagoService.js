const { preference, payment } = require('../config/mercadoPago');
const { sequelize } = require('../config/db');
require('dotenv').config();

class MercadoPagoService {
  async create(body) {
    const transaction = await sequelize.transaction();
    try {
      const rsp = await preference.create({ body }, { transaction });
      await transaction.commit();
      return rsp;
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al crear preferencia: ${error.message}`);
    }
  }

  async getById(id) {
    try {
      const rsp = await payment.get({ id });
      return rsp;
    } catch (error) {
      throw new Error(`Error al obtener el pago: ${error.message}`);
    }
  }
}

module.exports = new MercadoPagoService();