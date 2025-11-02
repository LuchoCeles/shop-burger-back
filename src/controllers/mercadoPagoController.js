const MercadoPagoService = require('../services/mercadoPagoService');

class MercadoPagoController {
  async create(req, res) {
    try {
      const { items, payer, external_reference } = req.body;

      const body = {
        type: "online",
        processing_mode: "automatic",
        total_amount: ""
      };

      const mpResponse = await mpService.createPreference(body);

      // devuelve al cliente la URL para redirigir al checkout
      return res.status(201).json({
        init_point: mpResponse.body.init_point,
        preference: mpResponse.body,
      });
    } catch (error) {
      return res.status(500).json({ error: "Internal server error", detail: error.message });
    }
  }

  async get(req, res) {
    try {
      const { payment_id } = req.params;

      if (!payment_id) {
        return res.status(400).json({ error: "Missing payment_id param" });
      }

      const mpResponse = await mpService.getPayment(payment_id);

      return res.status(200).json({
        payment: mpResponse.body,
      });
    } catch (error) {
      return res.status(500).json({ error: "Internal server error", detail: error.message });
    }
  }
}

module.exports = new MercadoPagoController();
