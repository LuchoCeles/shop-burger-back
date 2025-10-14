const categoriasService = require("../services/categoriasService");

class CategoriasController {
  async getCategories(req, res, next) {
    try {
      const categorias = await categoriasService.getCategories();
      res.status(200).json({
        success: true,
        data: categorias,
      });
    } catch (error) {
      next(error);
    }
  }

  async createCategorie(req, res, next) {
    try {
      const categoriaData = req.body;
      const categoria = await categoriasService.createCategorie(categoriaData);
      res.status(201).json({
        success: true,
        message: "Categoría creada exitosamente",
        data: categoria,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCategorie(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const categoria = await categoriasService.updateCategorie(id, updateData);
      res.json({
        success: true,
        message: "Categoría actualizada exitosamente",
        data: categoria,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCategorie(req, res, next) {
    try {
      const { id } = req.params;
      const categoria = await categoriasService.deleteCategorie(id);
      res.json({
        success: true,
        message: "Categoría eliminada exitosamente",
        data: categoria,
      });
    } catch (error) {
      next(error);
    }
  }
  
}

module.exports = new CategoriasController();
