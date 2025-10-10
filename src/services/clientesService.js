const { Cliente, sequelize } = require("../models");

class ClientesService {
  async createCliente(clienteData) {
    const transaction = await sequelize.transaction();

    try {
      const { idPedido, direccion, descripcion, telefono } = clienteData;

      if (!direccion) {
        throw new Error("La direccion es obligatoria");
      }

      const cliente = await Cliente.create(
        {
          idPedido,
          direccion,
          descripcion,
          telefono,
        },
        { transaction }
      );

      await transaction.commit();
      return cliente;
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al crear cliente: ${error.message}`);
    }
  }

  async updateCliente(id, data) {
    const transaction = await sequelize.transaction();
    try {
      const cliente = await Cliente.findByPk(id);

      if (!cliente) {
        throw new Error("Cliente no encontrado");
      }

      await cliente.update(data, { transaction });
      await transaction.commit();
      return cliente;
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al actualizar cliente: ${error.message}`);
    }
  }

  async getClientes() {
    try {
      const clientes = await Cliente.findAll({
        attributes: [
          "id",
          "descripcion",
          "telefono",
          "direccion"
        ],
        order: [["id", "ASC"]],
      });

      return clientes;
    } catch (error) {
      throw new Error(`Error al obtener clientes: ${error.message}`);
    }
  }

  async deleteCliente(id) {
    const transaction = await sequelize.transaction();
    try {
      const cliente = await Cliente.findByPk(id);
      if (!cliente) {
        throw new Error("Cliente no encontrado");
      }

      await cliente.destroy({ transaction });
      await transaction.commit();

      return { mensaje: "Cliente eliminado" };
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al eliminar cliente: ${error.message}`);
    }
  }
}
module.exports = new ClientesService();
