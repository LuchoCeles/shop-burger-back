const {
  Pedido,
  Cliente,
  Producto,
  ProductosXPedido,
  Pago,
  Adicionales,
  AdicionalesXProductosXPedidos,
} = require("../models");
const { sequelize } = require("../config/db");

class PedidosService {
  async Create(datosPedido) {
    try {
      const pedido = await sequelize.query("CALL createPedido(:datos)", {
        replacements: {
          datos: JSON.stringify(datosPedido),
        }
      })
      return pedido[0];
    } catch (error) {
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
              const adicionalesXPxP =
                await AdicionalesXProductosXPedidos.findAll({
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
                cantidad: a.cantidad,
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

  async getPrecioById(id) {
    try {
      const pedido = await Pedido.findOne({
        where: { id },
        attributes: ["id", "precioTotal"],
      });

      return pedido;
    } catch (error) {
      throw new Error(`Error al obtener el precio del pedido: ${error.message}`);
    }
  }

  async updateStatus(id, nuevoEstado) {
    try {
      const pedido = await Pedido.findByPk(id);

      await pedido.update({ estado: nuevoEstado });

      const rsp = await Pedido.findByPk(id, {
        include: [
          { model: Cliente, as: "cliente" },
          { model: Producto, as: "productos" },
          { model: Pago, as: "pago" },
        ],
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

  async updateOrder(id, datosActualizados) {
    const transaction = await sequelize.transaction();

    try {
      const { cliente, producto, descripcion, estado } = datosActualizados;

      const pedido = await Pedido.findByPk(id, { transaction });
      if (!pedido) throw new Error(`Pedido no encontrado`);

      if (pedido.estado === "entregado")
        throw new Error(`No se puede modificar, pedido ya ENTREGADO`);

      if (cliente) {
        await Cliente.update(cliente, {
          where: { id: pedido.idCliente },
          transaction,
        });
      }

      const productosPedido = await ProductosXPedido.findAll({
        where: { idPedido: id },
        include: [
          {
            model: Producto,
            as: "producto",
            attributes: ["id", "stock", "precio"],
          },
        ],
        transaction,
      });

      for (const pxp of productosPedido) {
        await Producto.increment("stock", {
          by: pxp.cantidad,
          where: { id: pxp.idProducto },
          transaction,
        });

        const adicionales = await AdicionalesXProductosXPedidos.findAll({
          where: { idProductoXPedido: pxp.id },
          include: [
            { model: Adicionales, as: "adicional", attributes: ["id"] },
          ],
          transaction,
        });

        for (const a of adicionales) {
          await Adicionales.increment("stock", {
            by: a.cantidad,
            where: { id: a.idAdicional },
            transaction,
          });
        }

        await AdicionalesXProductosXPedidos.destroy({
          where: { idProductoXPedido: pxp.id },
          transaction,
        });
      }
      await ProductosXPedido.destroy({
        where: { idPedido: id },
        transaction,
      });

      let total = 0;

      for (const P of producto) {
        const prod = await Producto.findByPk(P.id, {
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        if (!prod) throw new Error(`Producto no encontrado`);
        if (prod.stock < P.cantidad)
          throw new Error(`Stock insuficiente para: ${P.nombre}`);

        await Producto.decrement("stock", {
          by: P.cantidad,
          where: { id: P.id },
          transaction,
        });

        total += Number(prod.precio) * P.cantidad;

        const prodPedido = await ProductosXPedido.create(
          {
            idProducto: P.id,
            idPedido: pedido.id,
            cantidad: P.cantidad,
          },
          { transaction }
        );

        if (P.adicional && Array.isArray(P.adicional)) {
          for (const A of P.adicional) {
            const adicional = await Adicionales.findByPk(A.id, {
              transaction,
              lock: transaction.LOCK.UPDATE,
            });

            if (!adicional) throw new Error(`no existe el adicional`);
            if (adicional.stock < A.cantidad)
              throw new Error(`Stock insuficiente para : ${A.nombre}`);

            await Adicionales.decrement({
              by: A.cantidad,
              where: { id: A.id },
              transaction,
            });

            await AdicionalesXProductosXPedidos.create(
              {
                idProductoXPedido: prodPedido.id,
                idAdicional: A.id,
                cantidad: A.cantidad,
                precio: adicional.precio,
              },
              { transaction }
            );

            total += Number(adicional.precio) * A.cantidad;
          }
        }
      }
      await pedido.update(
        {
          descripcion: descripcion ?? pedido.descripcion,
          estado: estado ?? pedido.estado,
          precioTotal: total,
        },
        { transaction }
      );

      await transaction.commit();
      return { message: "Pedido actualizado correctamente" };
    } catch (error) {
      if (!transaction.finished) await transaction.rollback();
      throw new Error(`Error al actualziar el pedido: ${error.message}`);
    }
  }
}

module.exports = new PedidosService();
