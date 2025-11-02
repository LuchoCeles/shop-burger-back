const preference = require('../config/mercadoPago');

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
}

module.exports = new MercadoPagoService();