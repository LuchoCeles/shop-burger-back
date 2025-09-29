const categoriasService = require('../services/categoriasService');

class CategoriasController {
  async createCategoria(req, res, next) {
    try {
      const categoriaData = req.body;
      const categoria = await categoriasService.createCategoria(categoriaData);
      res.status(201).json({
        success: true,
        message: 'Categoría creada exitosamente',
        data: categoria
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCategoria(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const categoria = await categoriasService.updateCategoria(id, updateData);
      res.json({
        success: true,
        message: 'Categoría actualizada exitosamente',
        data: categoria
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CategoriasController();