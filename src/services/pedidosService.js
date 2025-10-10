const { Pedido, Cliente, Producto, ProductosXPedido, Pago } = require('../models');
const { sequelize } = require('../models');

class PedidosService {

  async Create(datosPedido) {
    const transaction = await sequelize.transaction();
    try {
      const { cliente, productos, descripcion } = datosPedido;

      let total = 0;
      for (const P of productos) {
        const proc = await Producto.findByPk(P.idProducto, { attributes: ['precio'] });
        total += proc.precio * P.cantidad;
      }

      const c = await Cliente.create(cliente);

      const pedido = await Pedido.create({
        idCliente: c.id,
        descripcion: descripcion,
        precioTotal: total
      }, { transaction });

      for (const P of productos) {
        await ProductosXPedido.create({
          idPedido: pedido.id,
          idProducto: P.idProducto,
          cantidad: P.cantidad
        }, { transaction });
      }

      await transaction.commit();
      return pedido.id;

    } catch (error) {
      if (!transaction.finished) {
        await transaction.rollback();
      }
      throw new Error(`Error al crear pedido: ${error.message}`);
    }
  }


  // Obtener todos los pedidos
  async obtenerTodos(filtros = {}) {
    try {
      const opciones = {
        attributes: ['id', 'estado', 'precioTotal', 'descripcion'],
        order: [['id', 'DESC']]
      };

      // Filtro por estado si existe
      if (filtros.estado) {
        opciones.where = { estado: filtros.estado };
      }

      return await Pedido.findAll(opciones);
    } catch (error) {
      throw new Error(`Error al obtener pedidos: ${error.message}`);
    }
  }

  async obtenerPorId(id) {
    const pedido = await Pedido.findByPk(id, {
      include: [
        { model: Cliente, as: 'cliente' },
        { model: Producto, as: 'productos' },
        { model: Pago, as: 'pago' }
      ]
    });

    if (!pedido) throw new Error('Pedido no encontrado');
    return pedido;
  }


  // Actualizar solo el estado
  async actualizarEstado(id, nuevoEstado) {
    try {
      const estadosValidos = ['pendiente', 'entregado', 'cancelado'];

      if (!estadosValidos.includes(nuevoEstado)) {
        throw new Error('Estado inválido');
      }

      const pedido = await Pedido.findByPk(id);

      if (!pedido) {
        throw new Error('Pedido no encontrado');
      }

      // Lógica de validación de estados
      if (pedido.estado === 'entregado') {
        throw new Error('No se puede cambiar el estado de un pedido entregado');
      }

      if (pedido.estado === 'cancelado' && nuevoEstado !== 'cancelado') {
        throw new Error('No se puede reactivar un pedido cancelado');
      }

      await pedido.update({ estado: nuevoEstado });
      return await this.obtenerPorId(id);
    } catch (error) {
      throw new Error(`Error al actualizar estado: ${error.message}`);
    }
  }

  // Cancelar pedido (devuelve stock)
  async cancelar(id) {
    const transaction = await sequelize.transaction();

    try {
      const pedido = await Pedido.findByPk(id, {
        include: [{
          model: Producto,
          as: 'productos',
          through: { attributes: ['cantidad'] }
        }]
      });

      if (!pedido) {
        throw new Error('Pedido no encontrado');
      }

      if (pedido.estado === 'cancelado') {
        throw new Error('El pedido ya está cancelado');
      }

      if (pedido.estado === 'entregado') {
        throw new Error('No se puede cancelar un pedido entregado');
      }

      // Devolver stock de productos
      for (const producto of pedido.productos) {
        await Producto.increment('stock', {
          by: producto.ProductosXPedido.cantidad,
          where: { id: producto.id },
          transaction
        });
      }

      await pedido.update({ estado: 'cancelado' }, { transaction });
      await transaction.commit();

      return await this.obtenerPorId(id);
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al cancelar pedido: ${error.message}`);
    }
  }

  // Eliminar pedido (solo si está pendiente o cancelado)
  async eliminar(id) {
    const transaction = await sequelize.transaction();

    try {
      const pedido = await Pedido.findByPk(id);

      if (!pedido) {
        throw new Error('Pedido no encontrado');
      }

      if (!['pendiente', 'cancelado'].includes(pedido.estado)) {
        throw new Error('Solo se pueden eliminar pedidos pendientes o cancelados');
      }

      // Desvincular cliente si existe
      const cliente = await Cliente.findOne({ where: { idPedido: id } });
      if (cliente) {
        await cliente.update({ idPedido: null }, { transaction });
      }

      await pedido.destroy({ transaction });
      await transaction.commit();

      return { mensaje: 'Pedido eliminado exitosamente' };
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al eliminar pedido: ${error.message}`);
    }
  }

}

module.exports = new PedidosService();