const {
  Pedido,
  Cliente,
  Producto,
  ProductosXPedido,
  Pago,
  Adicionales,
  AdicionalesXProductosXPedidos
} = require("../models");
const { sequelize } = require("../models");
const { Op } = require("sequelize");

class PedidosService {

  async Create(datosPedido) {
    const transaction = await sequelize.transaction();
    try {
      const { cliente, productos, descripcion } = datosPedido;
      let total = 0;
  
      const c = await Cliente.create(cliente, { transaction });
  
      const pedido = await Pedido.create(
        {
          idCliente: c.id,
          descripcion,
          precioTotal: total,
        },
        { transaction }
      );
  
      //  Recorrer los productos
      for (const P of productos) {
        const proc = await Producto.findByPk(P.id, {
          attributes: ['precio', 'stock'],
          transaction,
          lock: transaction.LOCK.UPDATE
        });
  
        if (!proc) throw new Error(`El producto ${P.nombre} no existe`);
        if (proc.stock < P.cantidad)
          throw new Error(`Stock insuficiente para ${P.nombre}. Disponible: ${proc.stock}, solicitado: ${P.cantidad}`);
  
        await Producto.decrement('stock', {
          by: P.cantidad,
          where: { id: P.id, stock: { [Op.gte]: P.cantidad } },
          transaction
        });
  
        total += Number(proc.precio) * P.cantidad;
  
        //  Crear registro de producto en el pedido
        const prodXPedido = await ProductosXPedido.create(
          {
            idPedido: pedido.id,
            idProducto: P.id,
            cantidad: P.cantidad,
          },
          { transaction }
        );
  
        //  Procesar adicionales (solo si existen)
        if (P.adicionales && Array.isArray(P.adicionales) && P.adicionales.length > 0) {
          for (const A of P.adicionales) {
            const adicional = await Adicionales.findByPk(A.id, {
              attributes: ['precio', 'stock', 'nombre'],
              transaction,
              lock: transaction.LOCK.UPDATE,
            });
  
            if (!adicional) throw new Error(`El adicional ${A.nombre} no existe`);
            if (adicional.stock < A.cantidad)
              throw new Error(`Stock insuficiente para el adicional ${A.nombre}`);
  
            await Adicionales.decrement('stock', {
              by: A.cantidad || 1,
              where: { id: A.id, stock: { [Op.gte]: A.cantidad || 1 } },
              transaction,
            });
  
            const subtotal = Number(adicional.precio) * (A.cantidad || 1);
            total += subtotal;
  
            await AdicionalesXProductosXPedidos.create(
              {
                idProductoXPedido: prodXPedido.id,
                idAdicional: A.id,
                cantidad: A.cantidad || 1,
                precio: adicional.precio,
              },
              { transaction }
            );
          }
        }
      }
  
      //  Actualizar total del pedido
      await pedido.update({ precioTotal: total }, { transaction });
      await transaction.commit();
  
      return pedido.id;
    } catch (error) {
      if (!transaction.finished) await transaction.rollback();
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
        where: filtros.estado ? { estado: filtros.estado } : undefined,
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
  
          const productos = await Promise.all(
            pxp.map(async (item) => {
              // Buscar adicionales para este producto del pedido
              const adicionalesXPxP = await AdicionalesXProductosXPedidos.findAll({
                where: { idProductoXPedido: item.id },
                include: [
                  {
                    model: Adicionales,
                    as: "adicional",
                    attributes: ["id", "nombre", "precio"],
                  },
                ],
              });
  
              const adicionales = adicionalesXPxP.map((a) => ({
                id: a.adicional.id,
                nombre: a.adicional.nombre,
                precio: a.adicional.precio,
                cantidad: a.Cantidad,
              }));
  
              return {
                id: item.producto.id,
                nombre: item.producto.nombre,
                precio: item.producto.precio,
                cantidad: item.cantidad,
                adicionales,
              };
            })
          );
  
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
  

  async getById(id) {
    const pedidoActual = await Pedido.findByPk(id);
    return pedidoActual;
  }

  async updateStatus(id, nuevoEstado) {
    try {

      const pedido = await Pedido.findByPk(id);

      await pedido.update({ estado: nuevoEstado });

      const rsp = await Pedido.findByPk(id, {
        include: [
          { model: Cliente, as: 'cliente' },
          { model: Producto, as: 'productos' },
          { model: Pago, as: 'pago' }
        ]
      });
      return rsp;
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
