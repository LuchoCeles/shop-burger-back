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

  async searchPreference(externalReference) {
    try {
      const rsp = await preference.search({
        qs: {
          external_reference: externalReference,
        },
      });
      return rsp.elements && rsp.elements.length > 0 ? rsp.elements[0] : null;
    } catch (error) {
      console.error("MercadoPago searchPreference error:", error);
      throw error;
    }
  }

  async getMerchantOrder(id) {
    try {
      const response = await fetch(`https://api.mercadopago.com/merchant_orders/${id}`, {
        headers: {
          Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
        }
      });
      const rsp = await response.json();
      return rsp;
    } catch (error) {
      console.error("MercadoPago getMerchantOrder error:", error);
      throw error;
    }
  }

}


module.exports = new MercadoPagoService();