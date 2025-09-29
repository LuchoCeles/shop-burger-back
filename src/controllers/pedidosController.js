const pedidoService = require('../services/pedido.service');

class PedidoController {
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

  async obtenerTodos(req, res) {
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

  async obtenerPorId(req, res) {
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

  async actualizar(req, res) {
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

  async eliminar(req, res) {
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

  async agregarProductos(req, res) {
    try {
      const { id } = req.params;
      const { productos } = req.body;

      if (!productos || !Array.isArray(productos) || productos.length === 0) {
        return res.status(400).json({
          error: 'Se requiere un array de productos válido'
        });
      }

      const pedido = await pedidoService.agregarProductos(id, productos);

      return res.status(200).json({
        mensaje: 'Productos agregados exitosamente',
        data: pedido
      });
    } catch (error) {
      const status = error.message.includes('no encontrado') ? 404 : 500;
      return res.status(status).json({
        error: error.message
      });
    }
  }

  async obtenerPorCliente(req, res) {
    try {
      const { idCliente } = req.params;
      const pedidos = await pedidoService.obtenerPorCliente(idCliente);

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
}

module.exports = new PedidoController();