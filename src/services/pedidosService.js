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
            through: { attributes: ["cantidad", "id"] },
            include: [{
              model: Adicionales,
              as: "adicionales",
              through: {
                model as: "AdicionalesXProductosXPedidos",
                attributes: ["cantidad"]
              },
            }],
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

        if (producto.adicionales && producto.adicionales.length > 0) {
          for (const adicional of producto.adicionales) {
            await Adicionales.increment("stock", {
              by: adicional.AdicionalesXProductosXPedidos.cantidad,
              where: { id: adicional.id },
              transaction,
            });
          }
        }
      }

      await pedido.update({ estado: "cancelado" }, { transaction });
      await transaction.commit();

      return await this.obtenerPorId(id);
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al cancelar pedido: ${error.message}`);
    }
  }

  async updateOrder(idPedido, datosActualizados) {
    try {
      if (!idPedido) {
        return { ok: false, message: "ID del pedido requerido" };
      }
     

      // Mezclamos el ID dentro del JSON que se enviará al procedimiento
      const data = {
        ...datosActualizados,
        idPedido,
        productos:datosActualizados.producto,
      };
      delete data.producto;
      console.log(JSON.stringify(data,null,2));
        
      // Ejecutamos el procedimiento con el JSON como parámetro
      const [result] = await sequelize.query(
        "CALL updatePedido(:datos)",
        {
          replacements: {
            datos: JSON.stringify(data),
          },
        }
      );

      return {
        ok: true,
        message: "Pedido actualizado correctamente",
        data: result,
      };
    } catch (error) {

      if (error.original?.sqlMessage) {
        return {
          ok: false,
          message: error.original.sqlMessage,
        };
      }

      return {
        ok: false,
        message: "Error interno al actualizar el pedido",
        error: error.message,
      };
    }
  }

}


module.exports = new PedidosService();
