const pedidoService = require("../services/pedidosService");
const mercadoPagoService = require("../services/mercadoPagoService");
const pagosService = require("../services/pagosService");
const { getSocketInstance } = require("../config/socket");

class MercadoPagoController {
  async webHooksMercadoPago(req, res) {
    try {
      const webhook = req.query;

      if (!webhook.id) {
        return res.status(400).json({ message: "Invalid webhook data", success: false });
      }

      if (webhook.type === "payment" || webhook.topic === "payment") {
        const rsp = await this.payment(webhook.id);
        return rsp;
      }

    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async payment(paymentId) {
    try {
      const io = getSocketInstance();
      const data = await mercadoPagoService.getById(paymentId);
      const id = Number(data.additional_info.items[0].id);

      if (!id) throw new Error("ID inválido");

      if (data.status === "approved") {
        await this.paymentSuccess(id, io);
        return res.status(200).json({ success: true, message: "Pago aprobado" });
      }

      if (data.status === "rejected") {
        await this.paymentRejected(id, io);
        return res.status(401).json({ success: false, message: "Pago rechazado" });
      }
    } catch (error) {
      throw new Error(`Error al procesar pago: ${error.message}`);
    }
  }

  async paymentSuccess(id, io) {
    try {
      await this.updateOrderByMp(id, "Pagado");
      io.emit("pagoAprobado", {
        id,
        message: "Pago aprobado",
      });
      return res.status(200).json({ success: true, message: "Pago aprobado" });
    } catch (error) {
      return res.status(500).json({ message: error.message, success: false });
    }
  }

  async paymentRejected(id, io) {
    try {
      await this.cancelOrderByMp(id, "Rechazado");
      io.emit("pagoRechazado", {
        id,
        message: "Pago rechazado",
      });
      return res.status(401).json({ success: false, message: "Pago rechazado" });
    } catch (error) {
      return res.status(500).json({ message: error.message, success: false });
    }
  }

  async updateOrderByMp(id, estado) {
    try {
      await pagosService.updateMp(id, estado);
      return res.status(200).json({ success: true, message: "Pago actualizado" });
    } catch (error) {
      return res.status(500).json({ message: error.message, success: false });
    }
  }

  async cancelOrderByMp(id, estado) {
    try {
      const pedido = await pedidoService.cancel(id);
      await pagosService.updateMp(id, estado);
      return res.status(200).json({ success: true, message: "Pago Cancelado", data: pedido });
    } catch (error) {
      return res.status(500).json({ message: error.message, success: false });
    }
  }
}

module.exports = new MercadoPagoController();
