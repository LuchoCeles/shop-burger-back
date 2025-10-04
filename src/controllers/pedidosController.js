const pedidoService = require('../services/pedidosService');

class PedidosController {
  // Crear nuevo pedido con productos
  async crear(req, res) {
    try {
      const { idCliente, productos, descripcion } = req.body;

      // Validaciones
      if (!idCliente) {
        return res.status(400).json({
          error: 'El campo idCliente es requerido'
        });
      }

      if (!productos || !Array.isArray(productos) || productos.length === 0) {
        return res.status(400).json({
          error: 'Debe incluir al menos un producto en el array productos'
        });
      }

      // Validar estructura de productos
      for (const item of productos) {
        if (!item.idProducto || !item.cantidad) {
          return res.status(400).json({
            error: 'Cada producto debe tener idProducto y cantidad'
          });
        }
        if (item.cantidad <= 0) {
          return res.status(400).json({
            error: 'La cantidad debe ser mayor a 0'
          });
        }
      }

      const pedido = await pedidoService.crear({
        idCliente,
        productos,
        descripcion
      });

      return res.status(201).json({
        mensaje: 'Pedido creado exitosamente',
        data: pedido
      });
    } catch (error) {
      console.error('Error al crear pedido:', error);
      return res.status(500).json({
        error: error.message
      });
    }
  }

  // Obtener todos los pedidos con filtros
  async getPedidos(req, res) {
    try {
      const { estado, idCliente } = req.query;
      
      const filtros = {};
      if (estado) filtros.estado = estado;
      if (idCliente) filtros.idCliente = idCliente;

      const pedidos = await pedidoService.obtenerTodos(filtros);

      return res.status(200).json({
        mensaje: 'Pedidos obtenidos exitosamente',
        total: pedidos.length,
        data: pedidos
      });
    } catch (error) {
      console.error('Error al obtener pedidos:', error);
      return res.status(500).json({
        error: error.message
      });
    }
  }

  // Obtener pedido por ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const pedido = await pedidoService.obtenerPorId(id);

      return res.status(200).json({
        mensaje: 'Pedido obtenido exitosamente',
        data: pedido
      });
    } catch (error) {
      console.error('Error al obtener pedido:', error);
      const status = error.message.includes('no encontrado') ? 404 : 500;
      return res.status(status).json({
        error: error.message
      });
    }
  }

  // Obtener pedidos de un cliente
  async getPedidosByCliente(req, res) {
    try {
      const { idCliente } = req.params;
      const pedidos = await pedidoService.obtenerPorCliente(idCliente);

      return res.status(200).json({
        mensaje: 'Pedidos del cliente obtenidos exitosamente',
        total: pedidos.length,
        data: pedidos
      });
    } catch (error) {
      console.error('Error al obtener pedidos del cliente:', error);
      return res.status(500).json({
        error: error.message
      });
    }
  }

  // Actualizar pedido (descripción, estado)
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
      console.error('Error al actualizar pedido:', error);
      const status = error.message.includes('no encontrado') ? 404 : 
                     error.message.includes('No se puede modificar') ? 403 : 500;
      return res.status(status).json({
        error: error.message
      });
    }
  }

  // Actualizar solo estado del pedido
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
      console.error('Error al actualizar estado:', error);
      const status = error.message.includes('no encontrado') ? 404 : 
                     error.message.includes('inválido') || error.message.includes('No se puede') ? 400 : 500;
      return res.status(status).json({
        error: error.message
      });
    }
  }

  // Cancelar pedido (devuelve stock)
  async cancelar(req, res) {
    try {
      const { id } = req.params;
      const pedido = await pedidoService.cancelar(id);

      return res.status(200).json({
        mensaje: 'Pedido cancelado exitosamente',
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

  // Eliminar pedido
  async delete(req, res) {
    try {
      const { id } = req.params;
      const resultado = await pedidoService.eliminar(id);

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