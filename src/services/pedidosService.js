const {
  Pedido,
  Cliente,
  Producto,
  ProductosXPedido,
  Pago,
  Adicionales,
  AdicionalesXProductosXPedidos,
  MetodosDePago,
  Categoria,
  Envio,
  Guarniciones,
  ProductosXTam,
  Tam,
  GuarnicionesXProducto,
} = require("../models");
const { sequelize } = require("../config/db");

class PedidosService {
  async Create(datosPedido) {
    try {
      const pedido = await sequelize.query("CALL createPedido(:datos)", {
        replacements: {
          datos: JSON.stringify(datosPedido),
        },
      });
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
          {
            model: Envio,
            as: "envio",
            attributes: ["precio"],
          },
          {
            model: Pago,
            as: "pago",
            attributes: ["id", "estado"],
            include: [
              {
                model: MetodosDePago,
                as: "MetodosDePago",
                attributes: ["id", "nombre"],
              },
            ],
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
                attributes: ["id", "nombre", "descripcion"],
                include: [
                  {
                    model: Categoria,
                    as: "categoria",
                    attributes: ["id", "nombre"],
                  },
                  {
                    model: ProductosXTam,
                    as: "productosXTam",
                    attributes: ["id", "precio"],
                    include: [
                      { model: Tam, as: "tam", attributes: ["id", "nombre"] },
                    ],
                  },
                  {
                    model: GuarnicionesXProducto,
                    as: "guarnicionesXProducto",
                    include: [
                      {
                        model: Guarniciones,
                        as: "guarnicion",
                        attributes: ["id", "nombre"],
                      },
                    ],
                  },
                ],
              },
            ],
          });

          const productos = pxp.map((item) => ({
            id: item.producto.id,
            nombre: item.producto.nombre,
            descripcion: item.producto.descripcion,
            cantidad: item.cantidad,

            precio: item.producto.productosXTam?.[0]?.precio || 0,
            tam: item.producto.productosXTam?.[0]?.tam || null,

            guarniciones: item.producto.guarnicionesXProducto.map((g) => ({
              id: g.guarnicion.id,
              nombre: g.guarnicion.nombre,
            })),

            categoria: {
              id: item.producto.categoria.id,
              nombre: item.producto.categoria.nombre,
            },
          }));

          return {
            id: pedido.id,
            estado: pedido.estado,
            precioTotal: pedido.precioTotal,
            descripcion: pedido.descripcion,
            cliente: pedido.cliente,
            envio: pedido.envio ? { precio: pedido.envio.precio } : null,
            Pago: pedido.pago
              ? {
                  id: pedido.pago.id,
                  estado: pedido.pago.estado,
                  metodoDePago: pedido.pago.MetodosDePago.nombre,
                }
              : null,
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
      throw new Error(
        `Error al obtener el precio del pedido: ${error.message}`
      );
    }
  }

  async updateStatus(id, nuevoEstado) {
    try {
      console.log("Actualizando estado del pedido:", id, "a", nuevoEstado);
      const pedido = await Pedido.findByPk(id);

      await pedido.update({ estado: nuevoEstado });

      if (nuevoEstado === "entregado") {
        const pago = await Pago.findOne({ where: { idPedido: id } });
        if (pago) {
          await pago.update({ estado: "pagado" });
        }
      }

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
            model: ProductosXPedido,
            as: "productosxpedido",
            include: [
              { model: Producto, as: "producto" },
              {
                model: AdicionalesXProductosXPedidos,
                as: "AxPxP",
                include: [
                  {
                    model: Adicionales,
                    as: "adicional",
                  },
                ],
              },
              {
                model: Guarniciones,
                as: "guarnicion",
              },
            ],
          },
        ],
        transaction,
      });

      if (!pedido) {
        throw new Error("Pedido no encontrado");
      }
      if (pedido.estado === "cancelado") {
        await transaction.rollback();
        console.log(
          `Intento de cancelar pedido ${id} que ya estaba cancelado.`
        );
        return pedido;
      }
      if (pedido.estado === "entregado") {
        throw new Error("No se puede cancelar un pedido entregado");
      }

      // Devolvemos el stock
      for (const productoXPedido of pedido.productosxpedido) {
        await Producto.increment("stock", {
          by: productoXPedido.cantidad,
          where: { id: productoXPedido.producto.id },
          transaction,
        });

        if (productoXPedido.guarnicion) {
          await Guarniciones.increment("stock", {
            by: 1,
            where: { id: productoXPedido.guarnicion.id },
            transaction,
          });
        }

        if (productoXPedido.AxPxP && productoXPedido.AxPxP.length > 0) {
          for (const adicionalX of productoXPedido.AxPxP) {
            await Adicionales.increment("stock", {
              by: adicionalX.cantidad,
              where: { id: adicionalX.adicional.id },
              transaction,
            });
          }
        }
      }

      await pedido.update({ estado: "cancelado" }, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw new Error(
        `Error durante la transacción de cancelación: ${error.message}`
      );
    }

    try {
      // Con este try evitamos error con el commit
      const pedidoActualizado = await this.getById(id);
      return pedidoActualizado;
    } catch (readError) {
      // Devolvemos un objeto simple para indicar que la cancelación tuvo éxito aunque no pudimos devolver el objeto completo.
      return { id: id, estado: "cancelado", errorAlReleer: true };
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
        productos: datosActualizados.producto,
      };
      delete data.producto;
      console.log(JSON.stringify(data, null, 2));

      // Ejecutamos el procedimiento con el JSON como parámetro
      const [result] = await sequelize.query("CALL updatePedido(:datos)", {
        replacements: {
          datos: JSON.stringify(data),
        },
      });

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
  async getById(id) {
    try {
      const pedido = await Pedido.findOne({
        where: { id },
        attributes: ["id", "estado", "precioTotal", "descripcion"],
        include: [
          {
            model: Cliente,
            as: "cliente",
            attributes: ["id", "telefono", "direccion"],
          },
          {
            model: ProductosXPedido,
            as: "productosxpedido",
            include: [
              {
                model: Producto,
                as: "producto",
                attributes: ["id", "nombre", "precio"],
              },
              {
                model: AdicionalesXProductosXPedidos,
                as: "AxPxP",
                include: [
                  {
                    model: Adicionales,
                    as: "adicional",
                    attributes: ["id", "nombre", "precio"],
                  },
                ],
              },
            ],
          },
        ],
      });

      if (!pedido) {
        throw new Error("Pedido no encontrado");
      }

      return pedido;
    } catch (error) {
      console.error("Error en pedidoService.getById:", error);
      throw error;
    }
  }
}

module.exports = new PedidosService();
