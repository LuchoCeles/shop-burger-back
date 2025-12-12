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
} = require("../models");
const { Op } = require("sequelize");
const { sequelize } = require("../config/db");

class PedidosService {
  async Create(datosPedido) {
    const transaction = await sequelize.transaction();
    try {
      const pedido = await sequelize.query("CALL createPedido(:datos)", {
        replacements: {
          datos: JSON.stringify(datosPedido),
        },
        transaction,
      });
      await transaction.commit();
      return pedido[0];
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al crear pedido: ${error.message}`);
    }
  }

  buildWhereFilters(filtros) {
    const where = {};

    if (filtros.estado) {
      where.estado = filtros.estado;
    }

    // Fecha exacta
    if (filtros.fecha) {
      const inicio = new Date(filtros.fecha);
      inicio.setHours(0, 0, 0, 0);

      const fin = new Date(filtros.fecha);
      fin.setHours(23, 59, 59, 999);

      where.createdAt = { [Op.between]: [inicio, fin] };
    }

    // Rango
    if (filtros.fechaDesde && filtros.fechaHasta) {
      const desde = new Date(filtros.fechaDesde);
      desde.setHours(0, 0, 0, 0);

      const hasta = new Date(filtros.fechaHasta);
      hasta.setHours(23, 59, 59, 999);

      where.createdAt = { [Op.between]: [desde, hasta] };
    }

    return where;
  }

  async fetchPedidos(where) {
    return await Pedido.findAll({
      attributes: ["id", "estado", "precioTotal", "descripcion", "createdAt"],
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
        {
          model: ProductosXPedido,
          as: "productosxpedido",
          attributes: ["id", "cantidad"],
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
                    {
                      model: Tam,
                      as: "tam",
                      attributes: ["id", "nombre"],
                    },
                  ],
                },
              ],
            },
            {
              model: Guarniciones,
              as: "guarnicion",
              attributes: ["id", "nombre"],
            },
            {
              model: AdicionalesXProductosXPedidos,
              as: "AxPxP",
              attributes: ["id", "cantidad", "precio"],
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
      order: [["id", "DESC"]],
      where,
    });
  }

  formatProductos(items = []) {
    return items.map((item) => ({
      nombre: item.producto.nombre,
      cantidad: item.cantidad,
      precio: item.producto.productosXTam?.[0]?.precio || 0,
      tam: item.producto.productosXTam?.[0]?.tam || null,
      categoria: {
        id: item.producto.categoria.id,
        nombre: item.producto.categoria.nombre,
      },
      guarnicion: item.guarnicion
        ? { id: item.guarnicion.id, nombre: item.guarnicion.nombre }
        : null,
      adicionales:
        item.AxPxP?.map((ad) => ({
          id: ad.adicional.id,
          nombre: ad.adicional.nombre,
          precio: Number(ad.precio),
          cantidad: ad.cantidad,
        })) || [],
    }));
  }

  formatPedidos(pedidos) {
    return pedidos.map((pedido) => ({
      id: pedido.id,
      estado: pedido.estado,
      precioTotal: pedido.precioTotal,
      descripcion: pedido.descripcion,
      createdAt: pedido.createdAt,
      cliente: pedido.cliente,
      envio: pedido.envio ? { precio: pedido.envio.precio } : null,
      pago: pedido.pago
        ? {
            id: pedido.pago.id,
            estado: pedido.pago.estado,
            metodoDePago: pedido.pago.MetodosDePago?.nombre || null,
          }
        : null,
      productos: this.formatProductos(pedido.productosxpedido),
    }));
  }

  async getAll(filtros = {}) {
    try {
      const where = this.buildWhereFilters(filtros);
      const pedidos = await this.fetchPedidos(where);
      return this.formatPedidos(pedidos);
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
    if (nuevoEstado === "Cancelado") {
      return await this.cancel(id);
    }
    const transaction = await sequelize.transaction();
    try {
      const pedido = await Pedido.findByPk(id);

      await pedido.update({ estado: nuevoEstado }, { transaction });

      if (nuevoEstado === "Cancelado") {
        const pago = await Pago.findOne({ where: { idPedido: id } });
        if (pago) {
          await pago.update({ estado: "Cancelado" }, { transaction });
        }
      }

      await transaction.commit();

      const rsp = await Pedido.findByPk(id, {
        include: [
          { model: Cliente, as: "cliente" },
          { model: Producto, as: "productos" },
          { model: Pago, as: "pago" },
        ],
      });

      return rsp;
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al actualizar estado: ${error.message}`);
    }
  }

  async getCompletOrderById(id, transaction) {
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
      return pedido;
    } catch (error) {
      throw new Error(`Error al obtener el pedido: ${error.message}`);
    }
  }

  async returnStock(productoXPedido, transaction) {
    try {
      const ops = [];

      for (const pxp of productoXPedido) {
        ops.push(
          Producto.increment("stock", {
            by: pxp.cantidad,
            where: { id: pxp.producto.id },
            transaction,
          })
        );

        if (pxp.guarnicion) {
          ops.push(
            Guarniciones.increment("stock", {
              by: 1,
              where: { id: pxp.guarnicion.id },
              transaction,
            })
          );
        }

        if (pxp.AxPxP && pxp.AxPxP.length > 0) {
          for (const adicionalX of pxp.AxPxP) {
            ops.push(
              Adicionales.increment("stock", {
                by: adicionalX.cantidad,
                where: { id: adicionalX.adicional.id },
                transaction,
              })
            );
          }
        }
      }

      await Promise.all(ops);
    } catch (error) {
      throw new Error(`Error al devolver el stock: ${error.message}`);
    }
  }

  async cancel(id) {
    const transaction = await sequelize.transaction();
    try {
      const pedido = await this.getCompletOrderById(id, transaction);

      if (!pedido) throw new Error("Pedido no encontrado");

      if (pedido.estado === "Cancelado")
        throw new Error("No se puede cambiar un pedido cancelado");

      if (pedido.estado === "Entregado")
        throw new Error("No se puede cancelar un pedido entregado");

      await this.returnStock(pedido.productosxpedido, transaction);

      await pedido.update({ estado: "Cancelado" }, { transaction });
      const pago = await Pago.findOne({
        where: { idPedido: id },
        transaction,
      });

      if (pago) {
        await pago.update({ estado: "Cancelado" }, { transaction });
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw new Error(
        `Error durante la transacción de cancelación: ${error.message}`
      );
    }

    try {
      const pedidoActualizado = await this.getStateById(id);
      return pedidoActualizado;
    } catch (readError) {
      throw new Error(`Error al obtener el pedido: ${readError.message}`);
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

      return result;
    } catch (error) {
      throw new Error(`Error al actualizar el pedido: ${error.message}`);
    }
  }

  async getStateById(id) {
    try {
      const pedido = await Pedido.findOne({
        where: { id },
        attributes: ["id", "estado"],
      });

      if (!pedido) {
        throw new Error("Pedido no encontrado");
      }

      return pedido;
    } catch (error) {
      throw new Error(`Error al obtener el pedido: ${error.message}`);
    }
  }
}

module.exports = new PedidosService();
