const { sequelize } = require("../config/db");
const { Pago } = require('../models');

class PagosService {
  async updateMp(id, estado) {
    try {
      await sequelize.query("CALL updateMp(:id,:estado);", {
        replacements: { id, estado },
      });
      return true;
    } catch (error) {
      throw new Error("Error al actualizar el estado del pago");
    }
  }

  async create(datosPagos) {
    try {
      const nuevoPago = await Pago.create(datosPagos);
      return nuevoPago;
    } catch (error) {
      console.error("Error en PagoService.create:", error.message);
      throw new Error("Error al crear el registro de pago.");
    }
  }

  async getPagosExpirados(id, umbral) {
    try {
      const pagosExpirados = await Pago.findAll({
        where: {
          estado: 'Pendiente',
          idMetodoDePago: id,
          createdAt: {
            [Op.lt]: umbral
          }
        }
      });
      return pagosExpirados;
    } catch (error) {
      throw new Error("Error al buscar los pagos expirados.");
    }
  }

}

module.exports = new PagosService();