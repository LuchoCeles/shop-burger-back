const { preference, payment } = require('../config/mercadoPago');
require('dotenv').config();

class MercadoPagoService {
  async create(body) {
    try {
      const rsp = await preference.create({ body });
      return rsp;
    } catch (error) {
      console.error("MercadoPago createPreference error:", error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const rsp = await payment.get({ id });
      return rsp;
    } catch (error) {
      console.error("MercadoPago payment.findById error:", error);
      throw error;
    }
  }
}

module.exports = new MercadoPagoService();