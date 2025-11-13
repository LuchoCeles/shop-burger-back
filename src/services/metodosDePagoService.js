const { MetodosDePago } = require('../models');

class MetodoDePagoService {
    
  async getIdPorNombre(nombre) {
    try {
      const metodo = await MetodosDePago.findOne({ where: { nombre: nombre } });
      return metodo ? metodo.id : null;
    } catch (error) {
      console.error("Error en MetodoDePagoService.getIdPorNombre:", error.message);
      throw new Error("Error al buscar el método de pago.");
    }
  }
}

module.exports = new MetodoDePagoService();