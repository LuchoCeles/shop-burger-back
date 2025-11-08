const { sequelize } = require("../config/db");

class PagoService {
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
}

module.exports = new PagoService();