const { Pedido, Cliente, Producto, ProductosXPedido, Pago } = require('../models');
const { sequelize } = require('../models');

class PedidosService {
  // Crear pedido con productos
 async crear(datosPedido) {
  const transaction = await sequelize.transaction();

  try {
    const { idCliente, productos, descripcion } = datosPedido;

    // Validar cliente
    const cliente = await Cliente.findByPk(idCliente);
    if (!cliente) throw new Error('Cliente no encontrado');

    // Validar productos
    if (!productos || productos.length === 0) {
      throw new Error('Debe incluir al menos un producto');
    }

    let precioTotal = 0;
    const productosValidados = [];

    for (const item of productos) {
      const producto = await Producto.findOne({
        where: {id: item.idProducto, estado:1}
      });
      if (!producto) throw new Error(`Producto con ID ${item.idProducto} no encontrado`);
      if (producto.stock < item.cantidad) throw new Error(`Stock insuficiente para ${producto.nombre}`);

      const precioConDescuento = producto.precio * (1 - (producto.descuento || 0) / 100);
      precioTotal += precioConDescuento * item.cantidad;

      productosValidados.push({
        id: producto.id,
        cantidad: item.cantidad,
        precioUnitario: precioConDescuento
      });
    }

    // Crear pedido
    const pedido = await Pedido.create({
      precioTotal: precioTotal.toFixed(2),
      descripcion,
      estado: 'pendiente',
      idCliente // asignar cliente al pedido directamente
    }, { transaction });

    // Asociar productos
    for (const item of productosValidados) {
      await ProductosXPedido.create({
        idPedido: pedido.id,
        idProducto: item.id,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario
      }, { transaction });

      // Actualizar stock
      await Producto.decrement('stock', {
        by: item.cantidad,
        where: { id: item.id },
        transaction
      });
    }

    await transaction.commit();

    // Devolver pedido completo
    return await Pedido.findByPk(pedido.id, {
      include: [
        { model: Cliente, as: 'cliente' },
        { model: Producto, as: 'productos', through: { attributes: ['cantidad'] } }
      ]
    });
  } catch (error) {
   // Solo hacer rollback si la transacción sigue abierta
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
      const estadosValidos = ['pendiente', 'confirmado', 'preparando', 'en_camino', 'entregado', 'cancelado'];
      
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