const pedidoService = require('../services/pedidosService');
const { Pedido } = require('../models');

class PedidosController {

  async CreateOrder(req, res) {
    try {
      const io = req.app.get('io');
      const { cliente, productos, descripcion } = req.body;
      if (!cliente) {
        return res.status(400).json({
          error: 'El campo debe estar completo'
        });
      }

      if (!productos || !Array.isArray(productos) || productos.length === 0) {
        return res.status(400).json({
          error: 'Debe incluir al menos un producto en el array productos'
        });
      }

      for (const item of productos) {
        if (!item.id || !item.cantidad) {
          return res.status(400).json({
            error: 'Cada producto debe tener id y cantidad'
          });
        }
        if (item.cantidad <= 0) {
          return res.status(400).json({
            error: 'La cantidad debe ser mayor a 0'
          });
        }
      }

      const pedido = await pedidoService.Create({
        cliente,
        productos,
        descripcion
      });


      io.emit('nuevoPedido', { message: 'Nuevo pedido recibido' });
      return res.status(201).json({
        message: 'Pedido creado exitosamente',
        data: pedido
      });
    } catch (error) {
      console.error('Error al crear pedido:', error);
      return res.status(500).json({
        error: error.message
      });
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
        message: 'Pedidos obtenidos exitosamente',
        data: pedidos
      });
    } catch (error) {
      console.error('Error al obtener pedidos:', error);
      return res.status(500).json({
        error: error.message
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

      const pedidoActual = await Pedido.findByPk(id);

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
          error: 'El campo estado es requerido'
        });
      }

      const pedido = await pedidoService.updateStatus(id, estado);

      return res.status(200).json({
        suscess: true,
        message: 'Estado actualizado exitosamente',
        data: pedido
      });
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      const status = error.message.includes('no encontrado') ? 404 :
        error.message.includes('inválido') || error.message.includes('No se puede') ? 400 : 500;
      return res.status(status).json({
        error: error.message
      });
    }
  }

  async cancel(req, res) {
    try {
      const { id } = req.params;
      const pedido = await pedidoService.cancel(id);

      return res.status(200).json({
        message: 'Pedido cancelado exitosamente',
        data: pedido
      });
    } catch (error) {
      console.error('Error al cancelar pedido:', error);
      const status = error.message.includes('no encontrado') ? 404 :
        error.message.includes('ya está') || error.message.includes('No se puede') ? 400 : 500;
      return res.status(status).json({
        error: error.message
      });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const resultado = await pedidoService.delete(id);

      return res.status(200).json(resultado);
    } catch (error) {
      console.error('Error al eliminar pedido:', error);
      const status = error.message.includes('no encontrado') ? 404 :
        error.message.includes('Solo se pueden') ? 403 : 500;
      return res.status(status).json({
        error: error.message
      });
    }
  }
}

module.exports = new PedidosController();