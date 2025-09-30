const pedidoService = require('../services/pedido.service');

class PedidosController {
  async crear(req, res) {
    try {
      const { idCliente, precioTotal, descripcion, estado } = req.body;

      if (!idCliente || !precioTotal) {
        return res.status(400).json({
          error: 'Los campos idCliente y precioTotal son requeridos'
        });
      }

      const pedido = await pedidoService.crear({
        idCliente,
        precioTotal,
        descripcion,
        estado
      });

      return res.status(201).json({
        mensaje: 'Pedido creado exitosamente',
        data: pedido
      });
    } catch (error) {
      return res.status(500).json({
        error: error.message
      });
    }
  }

  async getPedidos(req, res) {
    try {
      const { estado, idCliente } = req.query;
      
      const filtros = {};
      if (estado) filtros.estado = estado;
      if (idCliente) filtros.idCliente = idCliente;

      const pedidos = await pedidoService.obtenerTodos(filtros);

      return res.status(200).json({
        data: pedidos,
        total: pedidos.length
      });
    } catch (error) {
      return res.status(500).json({
        error: error.message
      });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const pedido = await pedidoService.obtenerPorId(id);

      return res.status(200).json({
        data: pedido
      });
    } catch (error) {
      const status = error.message.includes('no encontrado') ? 404 : 500;
      return res.status(status).json({
        error: error.message
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const datos = req.body;

      const pedido = await pedidoService.actualizar(id, datos);

      return res.status(200).json({
        mensaje: 'Pedido actualizado exitosamente',
        data: pedido
      });
    } catch (error) {
      const status = error.message.includes('no encontrado') ? 404 : 500;
      return res.status(status).json({
        error: error.message
      });
    }
  }

  async actualizarEstado(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      if (!estado) {
        return res.status(400).json({
          error: 'El campo estado es requerido'
        });
      }

      const pedido = await pedidoService.actualizarEstado(id, estado);

      return res.status(200).json({
        mensaje: 'Estado actualizado exitosamente',
        data: pedido
      });
    } catch (error) {
      const status = error.message.includes('no encontrado') ? 404 : 
                     error.message.includes('inválido') ? 400 : 500;
      return res.status(status).json({
        error: error.message
      });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const resultado = await pedidoService.eliminar(id);

      return res.status(200).json(resultado);
    } catch (error) {
      const status = error.message.includes('no encontrado') ? 404 : 500;
      return res.status(status).json({
        error: error.message
      });
    }
  }
}

module.exports = new PedidosController();