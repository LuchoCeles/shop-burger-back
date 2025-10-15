const adicionales = require('../models');

class AdicionalesService {
  async getAll(isActive = false) {
    const query = isActive ? { where: { estado: true } } : {};
    return await adicionales.findAll(query);
  }

  async create(adicional) {
    return await adicionales.create(adicional);
  }

  async update(id, adicional) {
    const existingAdicional = await adicionales.findByPk(id);
    if (!existingAdicional) {
      throw new Error('Adicional no encontrado');
    }
    return await existingAdicional.update(adicional);
  }

  async delete(id) {
    const existingAdicional = await adicionales.findByPk(id);
    if (!existingAdicional) {
      throw new Error('Adicional no encontrado');
    }
    await existingAdicional.destroy();
    return { message: 'Adicional eliminado correctamente' };
  }

  async changeState(id) {
    const existingAdicional = await adicionales.findByPk(id);
    if (!existingAdicional) {
      throw new Error('Adicional no encontrado');
    }
    existingAdicional.estado = !existingAdicional.estado;
    await existingAdicional.save();
    return existingAdicional;
  }

}

module.exports = new AdicionalesService();