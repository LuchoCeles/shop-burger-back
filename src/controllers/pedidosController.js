const pedidoService = require("../services/pedidosService");
const mercadoPagoService = require("../services/mercadoPagoService");
const pagosService = require("../services/pagosService");
const metodosDePagoService = require("../services/metodosDePagoService");
require("dotenv").config();

class PedidosController {
  async CreateOrder(req, res) {
    try {
      const io = req.app.get("io");
      const { cliente, productos, descripcion, metodoDePago } = req.body;

      for (const item of productos) {
        if (!item.id || !item.cantidad) {
          return res.status(400).json({
            error: "Cada producto debe tener id y cantidad",
          });
        }

        if (item.cantidad <= 0) {
          return res.status(400).json({
            error: "La cantidad debe ser mayor a 0",
          });
        }

        if (item.adicionales && !Array.isArray(item.adicionales)) {
          return res.status(400).json({
            success: false,
            message: "Adicionales",
          });
        }
      }

      const pedido = await pedidoService.Create({
        cliente,
        productos,
        descripcion,
        metodoDePago,
      });

      const idMetodoPago = await metodosDePagoService.getIdPorNombre(
        metodoDePago
      );
      if (!idMetodoPago) {
        throw new Error(`El método de pago '${metodoDePago}' no es válido.`);
      }

      await pagosService.create({
        idPedido: pedido.id,
        idMetodoDePago: idMetodoPago,
        estado: "Pendiente",
      });

      io.emit("nuevoPedido", { message: "Nuevo pedido recibido" });

      if (metodoDePago === "Mercado Pago") {
        const mpResponse = await this.createOrderByMercadoPago(pedido.id);
        return res.status(201).json({
          message: "Pedido creado exitosamente",
          data: {
            id: mpResponse.pedidoId,
            init_point: mpResponse.init_point,
          },
        });
      }

      return res.status(201).json({
        message: "Pedido creado exitosamente",
        data: pedido,
      });
    } catch (error) {
      console.error("Error al crear pedido:", error);
      return res.status(500).json({
        error: error.message,
      });
    }
  }

  async createOrderByMercadoPago(id) {
    try {
      const pedido = await pedidoService.getPrecioById(id);
      const now = new Date();
      const expirationDateTo = new Date(
        now.getTime() + 1 * 60000
      ).toISOString(); // 10 minutos después

      const body = {
        items: [
          {
            title: `Pedido #${pedido.id}`,
            quantity: 1,
            currency_id: "ARS",
            id: pedido.id,
            unit_price: Number(pedido.precioTotal),
          },
        ],
        external_reference: String(pedido.id),

        notification_url: `${process.env.BASE_URL}/admin/pedido/webhooks/mercadopago`,

        expires: true,
        expiration_date_to: expirationDateTo,
      };

      const mpResponse = await mercadoPagoService.create(body);

      return {
        pedidoId: pedido.id,
        init_point: mpResponse.init_point,
      };
    } catch (error) {
      throw new Error(
        `Error al crear pedido con Mercado Pago: ${error.message}`
      );
    }
  }

  async getOrderById(id) {
    try {
      const pedido = await pedidoService.getById(id);
      return pedido;
    } catch (error) {
      console.error("Error al obtener pedido:", error);
      throw error;
    }
  }

  async webHooksMercadoPago(req, res) {
    const io = req.app.get("io");

    try {
      const paymentId = req.query["data.id"] || req.query.id;
      const type = req.query.type || req.query.topic;

      // Si la notificación no es sobre un pago o no tiene un ID, la ignoramos.
      if (type !== "payment" || !paymentId) {
        console.log("Notificación ignorada (no es un pago o no tiene ID).");
        return res.sendStatus(200);
      }

      const paymentData = await mercadoPagoService.getById(paymentId);

      // Si por alguna razón no se encuentran los datos del pago, no podemos continuar.
      if (!paymentData) {
        return res.sendStatus(200);
      }

      const orderId = Number(paymentData.external_reference);

      if (!orderId) {
        return res.status(200).send("Pago sin external_reference.");
      }

      const pedidoEnDB = await pedidoService.getById(orderId);
      if (
        !pedidoEnDB ||
        pedidoEnDB.estado === "Pagado" ||
        pedidoEnDB.estado === "cancelado"
      ) {
        return res
          .status(200)
          .json({ message: "Pedido no encontrado o ya procesado." });
      }

      const preference = await mercadoPagoService.searchPreference(
        String(orderId)
      );
      
      if (preference && preference.expiration_date_to) {
        const expirationDate = new Date(preference.expiration_date_to);
        const now = new Date();

        if (now > expirationDate) {
          await this.cancelOrderByMp(orderId);
          io.emit("pagoExpirado", {
            message: "El tiempo para pagar ha expirado.",
          });
          return res
            .status(200)
            .json({ message: "Pedido cancelado por expiración." });
        }
      }

      console.log(
        `[WEBHOOK] Verificando estado del pago para el pedido ${orderId}: '${paymentData.status}'`
      );

      if (paymentData.status === "approved") {
        await this.updateOrderByMp(orderId, "Pagado");
        io.emit("pagoExitoso", { message: "¡Pago exitoso!" });
        return res
          .status(200)
          .json({ message: "Pago actualizado exitosamente." });
      } else {
        await this.cancelOrderByMp(orderId);
        io.emit("pagoRechazado", {
          message: `Pago rechazado con estado: ${paymentData.status}`,
        });
        return res
          .status(200)
          .json({ message: "Pago no aprobado, pedido cancelado." });
      }
    } catch (error) {
      console.error("---------- [WEBHOOK] ¡ERROR INESPERADO! ----------");
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
  }
  async updateOrderByMp(id, estado) {
    try {
      await pagosService.updateMpEstado(id, estado);
      return true;
    } catch (error) {
      throw new Error(
        `Error al actualizar pedido con Mercado Pago: ${error.message}`
      );
    }
  }

  async cancelOrderByMp(id) {
    try {
      const pedido = await pedidoService.cancel(id);
      console.log("Pedido cancelado :", id);
      await PagoService.updateMp(id, "Rechazado");
      return pedido;
    } catch (error) {
      throw new Error(
        `Error al cancelar pedido con Mercado Pago: ${error.message}`
      );
    }
  }

  async getOrders(req, res) {
    try {
      const { estado, idCliente } = req.query;

      const filtros = {};
      if (estado) filtros.estado = estado;
      if (idCliente) filtros.idCliente = idCliente;

      const pedidos = await pedidoService.getAll(filtros);

      return res.status(200).json({
        message: "Pedidos obtenidos exitosamente",
        data: pedidos,
      });
    } catch (error) {
      console.error("Error al obtener pedidos:", error);
      return res.status(500).json({
        error: error.message,
      });
    }
  }

  async updateStatus(req, res) {
    try {
      const { id, estado } = req.body;

      const estadosValidos = ["pendiente", "entregado", "cancelado"];

      if (!estadosValidos.includes(estado)) {
        throw new Error("Estado inválido");
      }

      const pedidoActual = await pedidoService.getById(id);

      if (!pedidoActual) {
        throw new Error("Pedido no encontrado");
      }

      if (pedidoActual.estado === "entregado") {
        throw new Error("No se puede cambiar el estado de un pedido entregado");
      }

      if (pedidoActual.estado === "cancelado" && estado !== "cancelado") {
        throw new Error("No se puede reactivar un pedido cancelado");
      }

      if (!estado) {
        return res.status(400).json({
          error: "El campo estado es requerido",
        });
      }

      const pedido = await pedidoService.updateStatus(id, estado);

      return res.status(200).json({
        suscess: true,
        message: "Estado actualizado exitosamente",
        data: pedido,
      });
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      const status = error.message.includes("no encontrado")
        ? 404
        : error.message.includes("inválido") ||
          error.message.includes("No se puede")
        ? 400
        : 500;
      return res.status(status).json({
        error: error.message,
      });
    }
  }

  async cancel(req, res) {
    try {
      const { id } = req.params;
      const pedido = await pedidoService.cancel(id);

      return res.status(200).json({
        message: "Pedido cancelado exitosamente",
        data: pedido,
      });
    } catch (error) {
      console.error("Error al cancelar pedido:", error);
      const status = error.message.includes("no encontrado")
        ? 404
        : error.message.includes("ya está") ||
          error.message.includes("No se puede")
        ? 400
        : 500;
      return res.status(status).json({
        error: error.message,
      });
    }
  }

  async updateOrder(req, res) {
    try {
      const io = req.app.get("io");
      const { id } = req.params;
      const { cliente, producto, descripcion, estado } = req.body;

      if (!producto || !Array.isArray(producto) || producto.length === 0) {
        return res.status(400).json({
          success: false,
          message: " Debe incluir al menos un producto",
        });
      }

      for (const item of producto) {
        if (!item || !item.cantidad) {
          return res.status(400).json({
            success: false,
            message: "Cada prducto debe tener id y cantidad",
          });
        }
        if (item.cantidad <= 0) {
          return res.status(400).json({
            message: "La cantidad debe ser mayor a 0",
          });
        }

        if (item.adicionales && !Array.isArray(item.adicionales)) {
          return res.status(400).json({
            message: "Error al cargar adicionales",
          });
        }
      }

      const result = await pedidoService.updateOrder(id, {
        cliente,
        producto,
        descripcion,
        estado,
      });

      io.emit("PedidoActualizado", {
        message: "Pedido actualizado",
        pedidoId: id,
      });

      return res.status(200).json({
        success: true,
        message: "Pedidoa actualizado",
        data: result,
      });
    } catch (error) {
      console.error("Error al actualizar pedido", error);
      return res.status(500).json({
        message: error.message,
      });
    }
  }
}

module.exports = new PedidosController();
