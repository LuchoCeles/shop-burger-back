const adicionalesService = require('../services/adicionalesService');

class AdicionalesController {
  async getAll(req, res, next) {
    const isActive = req.query.isActive === 'true';
    try {
      const adicionales = await adicionalesService.getAll(isActive);
      res.json({
        success: true,
        message: 'Adicionales obtenidos exitosamente',
        data: adicionales
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const { nombre, precio, stock, maxCantidad } = req.body;

      if (!nombre || !precio || !stock || !maxCantidad) {
        return res.status(400).json({
          success: false,
          message: 'Todos los campos son obligatorios'
        });
      }

      const nuevoAdicional = await adicionalesService.create({ nombre, precio, stock, maxCantidad });
      res.status(201).json({
        success: true,
        message: 'Adicional creado exitosamente',
        data: nuevoAdicional
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { nombre, precio, stock, maxCantidad } = req.body;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'El ID del adicional es requerido'
        });
      }

      if (!nombre || !precio || !stock || !maxCantidad) {
        return res.status(400).json({
          success: false,
          message: 'Todos los campos son obligatorios'
        });
      }

      const adicionalActualizado = await adicionalesService.update(id, { nombre, precio, stock, maxCantidad });
      res.json({
        success: true,
        message: 'Adicional actualizado exitosamente',
        data: adicionalActualizado
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'El ID del adicional es requerido'
        });
      }

      await adicionalesService.delete(id);
      res.json({
        success: true,
        message: 'Adicional eliminado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }

  async state(req, res, next) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'El ID del adicional es requerido'
        });
      }
      const adicional = await adicionalesService.changeState(id);
      res.json({
        success: true,
        message: 'Estado del adicional cambiado exitosamente',
        data: adicional
      });
    } catch (error) {
      next(error);
    }
  }

}
module.exports = new AdicionalesController();