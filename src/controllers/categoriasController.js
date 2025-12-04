const categoriasService = require("../services/categoriasService");

class CategoriasController {
  async getCategories(req, res) {
    try {
      const categorias = await categoriasService.getCategories();
      res.status(200).json({
        success: true,
        data: categorias,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async createCategorie(req, res) {
    try {
      const categoriaData = req.body;
      const categoria = await categoriasService.createCategorie(categoriaData);
      res.status(201).json({
        success: true,
        message: "Categoría creada exitosamente",
        data: categoria,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateEstate(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      const categoria = await categoriasService.updateEstate(id, estado);
      res.status(200).json({
        success: true,
        message: "Estado actualizado",
        data: {
          id: categoria.id,
          esatdo: categoria.estado,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateCategorie(req, res) {
    try {
      const { id } = req.params;
      const { nombre } = req.body;
      const categoria = await categoriasService.updateCategorie(id, nombre);
      res.json({
        success: true,
        message: "Categoría actualizada exitosamente",
        data: categoria,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      const categoria = await categoriasService.deleteCategory(id);
      res.json({
        success: true,
        message: categoria.message,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new CategoriasController();
