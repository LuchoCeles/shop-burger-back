const pedidoService = require("../services/pedidosService");
const mercadoPagoService = require("../services/mercadoPagoService");
const { getSocketInstance } = require("../config/socket");
require("dotenv").config();

class PedidosController {
  async CreateOrder(req, res) {
    try {
      const { cliente, productos, descripcion, metodoDePago } = req.body;
      const io = getSocketInstance();

      const pedido = await pedidoService.Create({
        cliente,
        productos,
        descripcion,
        metodoDePago,
      });

      io.emit("nuevoPedido", { idPedido: pedido.id, message: "Nuevo pedido recibido" });

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
        success: true,
        message: "Pedido creado exitosamente",
        data: {
          id: pedido.id,
        },
      });
    } catch (error) {
      console.error("Error al crear pedido:", error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async createOrderByMercadoPago(id) {
    try {
      const pedido = await pedidoService.getPrecioById(id);
      const now = new Date();
      const expirationDateTo = new Date(
        now.getTime() + process.env.MP_EXPIRY_MINUTES * 60000
      ).toISOString();

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

        notification_url: `${process.env.BASE_URL}/api/mercadopago/webhooks`,

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

      const pedidoActual = await pedidoService.getById(id);

      if (!pedidoActual) {
        throw new Error("Pedido no encontrado");
      }

      if (pedidoActual.estado === "Entregado") {
        throw new Error("No se puede cambiar el estado de un pedido entregado");
      }

      if (pedidoActual.estado === "Cancelado" && estado !== "Cancelado") {
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
      return res.status(500).json({
        suscess: false,
        error: "Error al actualizar estado: " + error.message,
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
      return res.status(500).json({
        suscess: false,
        error: "Error al cancelar pedido: " + error.message,
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