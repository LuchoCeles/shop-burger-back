const order = require('../config/mercadoPago');

class MercadoPagoService {
  async create(body) {
    try {
      const rsp = await order.create({ body });
      return rsp;
    } catch (error) {
      console.error("MercadoPago createPreference error:", error);
      throw error;
    }
  }

  async get(id) {
    try {
      const response = await mercadopago.payment.findById(paymentId);
      return response;
    } catch (error) {
      console.error("MercadoPago getPayment error:", error);
      throw error;
    }
  }
}

module.exports = new MercadoPagoService();