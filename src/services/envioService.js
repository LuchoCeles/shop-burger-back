const { Envio } = require("../models");
const { sequelize } = require("../config/db");

class EnvioService {
  async get() {
    try {
      const data = await Envio.findOne();
      return data;
    } catch (error) {
      throw new Error(`Error al obtener los envios: ${error.message}`);
    }
  }

  async update(id, data) {
    const transaction = await sequelize.transaction();
    try {
      const envio = await Envio.findByPk(id);

      if (!envio) throw new Error("Envio no encontrado");

      envio.precio = data.precio;
      envio.estado = data.estado;

      await envio.save({ transaction });
      await transaction.commit();

      return envio;
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al actualizar el envio: ${error.message}`);
    }
  }
}

module.exports = new EnvioService();
