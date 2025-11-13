const { sequelize } = require("../config/db");
const {Pago } = require('../models');

class PagosService {
  async updateMp(id, estado) { // no se usa, busca mal debido a que busca por id de pago, y es por id de pedido
    try {
      await sequelize.query("CALL updateMp(:id,:estado);", {
        replacements: { id, estado },
      });
      return true;
    } catch (error) {
      throw new Error("Error al actualizar el estado del pago");
    }
  }

  async updateMpEstado(id, estado) {
    try {
      await sequelize.query("CALL updateMpEstado(:id,:estado);", {
        replacements: { id, estado },
      });
      return true;
    } catch (error) {
      throw new Error("Error al actualizar el estado del pago");
    }
  }


  async create (datosPagos){
    try {
      const nuevoPago = await Pago.create(datosPagos);
      return nuevoPago;
    } catch (error) {
      console.error("Error en PagoService.create:", error.message);
      throw new Error("Error al crear el registro de pago.");
    }
  }
}

module.exports = new PagosService();