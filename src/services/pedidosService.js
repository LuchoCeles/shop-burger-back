const {
  Pedido,
  Cliente,
  Producto,
  ProductosXPedido,
} = require("../models");
const { sequelize } = require("../models");
const { Op } = require("sequelize");

class PedidosService {

  async Create(datosPedido) {
    const transaction = await sequelize.transaction();
    try {
      const { cliente, productos, descripcion } = datosPedido;

      let total = 0;

      for (const P of productos) {
        // traemos precio + stock y bloqueamos la fila para esta transacción
        const proc = await Producto.findByPk(P.id, {
          attributes: ['precio', 'stock'],
          transaction,
          lock: transaction.LOCK.UPDATE // bloqueo de fila
        });

        if (!proc) {
          throw new Error(`El producto ${P.nombre} no existe`);
        }

        if (proc.stock < P.cantidad) {
          throw new Error(
            `Stock insuficiente para el producto ${P.nombre}. Disponible: ${proc.stock}, solicitado: ${P.cantidad}`
          );
        }

        const decrementResult = await Producto.decrement('stock', {
          by: P.cantidad,
          where: {
            id: P.id,
            stock: { [Op.gte]: P.cantidad } // solo decrementa si hay stock suficiente
          },
          transaction
        });

        if (Array.isArray(decrementResult) && decrementResult[0] === 0) {
          throw new Error(
            `No fue posible descontar stock para el producto ${P.nombre} ID ${P.id}`
          );
        } else if (typeof decrementResult === 'number' && decrementResult === 0) {
          throw new Error(
            `No fue posible descontar stock para el producto ${P.nombre} ID ${P.id}`
          );
        }

        total += Number(proc.precio) * P.cantidad;
      }

      const c = await Cliente.create(cliente);

      const pedido = await Pedido.create(
        {
          idCliente: c.id,
          descripcion: descripcion,
          precioTotal: total,
        },
        { transaction }
      );

      for (const P of productos) {
        await ProductosXPedido.create(
          {
            idPedido: pedido.id,
            idProducto: P.id,
            cantidad: P.cantidad,
          },
          { transaction }
        );
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

  async getAll(filtros = {}) {
    try {
      const pedidos = await Pedido.findAll({
        attributes: ["id", "estado", "precioTotal", "descripcion"],
        include: [
          {
            model: Cliente,
            as: "cliente",
            attributes: ["id", "telefono", "direccion"],
          },
        ],
        order: [["id", "DESC"]],
        where: filtros.estado ? { estado: filtros.estado } : undefined
      });

      const pedidosConProductos = await Promise.all(
        pedidos.map(async (pedido) => {
          const pxp = await ProductosXPedido.findAll({
            where: { idPedido: pedido.id },
            include: [
              {
                model: Producto,
                as: "producto",
                attributes: ["id", "nombre", "precio"],
              },
            ],
          });

          const productos = pxp.map((item) => ({
            id: item.producto.id,
            nombre: item.producto.nombre,
            precio: item.producto.precio,
            cantidad: item.cantidad,
          }));

          return {
            id: pedido.id,
            estado: pedido.estado,
            precioTotal: pedido.precioTotal,
            descripcion: pedido.descripcion,
            cliente: pedido.cliente,
            productos,
          };
        })
      );

      return pedidosConProductos;
    } catch (error) {
      throw new Error(`Error al obtener pedidos: ${error.message}`);
    }
  }

  async updateStatus(id, nuevoEstado) {
    try {

      const pedido = await Pedido.findByPk(id);

      await pedido.update({ estado: nuevoEstado });

      return await this.obtenerPorId(id);
    } catch (error) {
      throw new Error(`Error al actualizar estado: ${error.message}`);
    }
  }

  async cancel(id) {
    const transaction = await sequelize.transaction();

    try {
      const pedido = await Pedido.findByPk(id, {
        include: [
          {
            model: Producto,
            as: "productos",
            through: { attributes: ["cantidad"] },
          },
        ],
      });

      if (!pedido) {
        throw new Error("Pedido no encontrado");
      }

      if (pedido.estado === "cancelado") {
        throw new Error("El pedido ya está cancelado");
      }

      if (pedido.estado === "entregado") {
        throw new Error("No se puede cancelar un pedido entregado");
      }

      for (const producto of pedido.productos) {
        await Producto.increment("stock", {
          by: producto.ProductosXPedido.cantidad,
          where: { id: producto.id },
          transaction,
        });
      }

      await pedido.update({ estado: "cancelado" }, { transaction });
      await transaction.commit();

      return await this.obtenerPorId(id);
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al cancelar pedido: ${error.message}`);
    }
  }

  async delete(id) {
    const transaction = await sequelize.transaction();

    try {
      const pedido = await Pedido.findByPk(id);

      if (!pedido) {
        throw new Error("Pedido no encontrado");
      }

      if (!["pendiente", "cancelado"].includes(pedido.estado)) {
        throw new Error(
          "Solo se pueden eliminar pedidos pendientes o cancelados"
        );
      }

      const cliente = await Cliente.findOne({ where: { idPedido: id } });
      if (cliente) {
        await cliente.update({ idPedido: null }, { transaction });
      }

      await pedido.destroy({ transaction });
      await transaction.commit();

      return { mensaje: "Pedido eliminado exitosamente" };
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al eliminar pedido: ${error.message}`);
    }
  }
}

module.exports = new PedidosService();
