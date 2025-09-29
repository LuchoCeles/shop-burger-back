const { Pedido, Cliente, Producto, ProductosXPedido, Pago } = require('../models');

class PedidoService {
  async crear(datos) {
    try {
      const pedido = await Pedido.create(datos);
      return await this.obtenerPorId(pedido.id);
    } catch (error) {
      throw new Error(`Error al crear pedido: ${error.message}`);
    }
  }

  async obtenerTodos(filtros = {}) {
    try {
      const opciones = {
        include: [
          {
            model: Cliente,
            as: 'cliente',
            attributes: ['id', 'nombre', 'email', 'telefono']
          },
          {
            model: Producto,
            as: 'productos',
            through: {
              model: ProductosXPedido,
              attributes: ['cantidad', 'precioUnitario']
            }
          },
          {
            model: Pago,
            as: 'pago'
          }
        ],
        order: [['createdAt', 'DESC']]
      };

      if (filtros.estado) {
        opciones.where = { estado: filtros.estado };
      }

      if (filtros.idCliente) {
        opciones.where = { ...opciones.where, idCliente: filtros.idCliente };
      }

      return await Pedido.findAll(opciones);
    } catch (error) {
      throw new Error(`Error al obtener pedidos: ${error.message}`);
    }
  }

  async obtenerPorId(id) {
    try {
      const pedido = await Pedido.findByPk(id, {
        include: [
          {
            model: Cliente,
            as: 'cliente',
            attributes: ['id', 'nombre', 'email', 'telefono']
          },
          {
            model: Producto,
            as: 'productos',
            through: {
              model: ProductosXPedido,
              attributes: ['cantidad', 'precioUnitario']
            }
          },
          {
            model: Pago,
            as: 'pago'
          }
        ]
      });

      if (!pedido) {
        throw new Error('Pedido no encontrado');
      }

      return pedido;
    } catch (error) {
      throw new Error(`Error al obtener pedido: ${error.message}`);
    }
  }

  async actualizar(id, datos) {
    try {
      const pedido = await Pedido.findByPk(id);
      
      if (!pedido) {
        throw new Error('Pedido no encontrado');
      }

      await pedido.update(datos);
      return await this.obtenerPorId(id);
    } catch (error) {
      throw new Error(`Error al actualizar pedido: ${error.message}`);
    }
  }

  async actualizarEstado(id, nuevoEstado) {
    try {
      const estadosValidos = ['pendiente', 'confirmado', 'preparando', 'en_camino', 'entregado', 'cancelado'];
      
      if (!estadosValidos.includes(nuevoEstado)) {
        throw new Error('Estado inválido');
      }

      return await this.actualizar(id, { estado: nuevoEstado });
    } catch (error) {
      throw new Error(`Error al actualizar estado: ${error.message}`);
    }
  }

  async eliminar(id) {
    try {
      const pedido = await Pedido.findByPk(id);
      
      if (!pedido) {
        throw new Error('Pedido no encontrado');
      }

      await pedido.destroy();
      return { mensaje: 'Pedido eliminado exitosamente' };
    } catch (error) {
      throw new Error(`Error al eliminar pedido: ${error.message}`);
    }
  }

  async agregarProductos(idPedido, productos) {
    try {
      const pedido = await Pedido.findByPk(idPedido);
      
      if (!pedido) {
        throw new Error('Pedido no encontrado');
      }

      const productosData = productos.map(p => ({
        idPedido: idPedido,
        idProducto: p.idProducto,
        cantidad: p.cantidad,
        precioUnitario: p.precioUnitario
      }));

      await ProductosXPedido.bulkCreate(productosData);
      return await this.obtenerPorId(idPedido);
    } catch (error) {
      throw new Error(`Error al agregar productos: ${error.message}`);
    }
  }

  async obtenerPorCliente(idCliente) {
    try {
      return await Pedido.findAll({
        where: { idCliente },
        include: [
          {
            model: Producto,
            as: 'productos',
            through: {
              model: ProductosXPedido,
              attributes: ['cantidad', 'precioUnitario']
            }
          },
          {
            model: Pago,
            as: 'pago'
          }
        ],
        order: [['createdAt', 'DESC']]
      });
    } catch (error) {
      throw new Error(`Error al obtener pedidos del cliente: ${error.message}`);
    }
  }
}

module.exports = new PedidoService();