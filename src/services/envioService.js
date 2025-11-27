const { Envio } = require("../models");

class EnvioService {
  async create(data) {
    try {
      const dataEnvio = await Envio.create(data);
      return dataEnvio;
    } catch (error) {
      throw new Error(`Error al crear el envio: ${error.message}`);
    }
  }

  async getAll() {
    try {
      const data = await Envio.findAll();
      return data;
    } catch (error) {
      throw new Error(`Error al obtener los envios: ${error.message}`);
    }
  }

  async updateState(id) {
    try {
      const data = await Envio.findByPk(id);
      data.estado = data.estado === 1 ? 0 : 1;
      await data.save();
      return data;
    } catch (error) {
      throw new Error(
        `Error al actualizar el estado del envio: ${error.message}`
      );
    }
  }

  async update(id, data) {
    try {
      const envio = await Envio.findByPk(id);
      if (!envio) {
        throw new Error("Envio no encontrado");
      }
      envio.precio = data.precio;
      await envio.save();
      return envio;
    } catch (error) {
      throw new Error(`Error al actualizar el envio: ${error.message}`);
    }
  }
  async getById(id) {
    try {
      const envio = await Envio.findByPk(id);
      return envio;
    } catch (error) {
      throw new Error(`Error al obtener el envio: ${error.message}`);
    }
  }
}

module.exports = EnvioService;
