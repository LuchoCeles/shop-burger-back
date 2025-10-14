const { Categoria } = require("../models");

class CategoriasService {
  async getCategories() {
   return await Categoria.findAll();
  }

  async createCategorie(categoriaData) {
    return await Categoria.create(categoriaData);
  }

  async updateCategorie(id, updateData) {
    const categoria = await Categoria.findByPk(id);

    if (!categoria) {
      throw new Error("Categoría no encontrada");
    }

    await categoria.update(updateData);
    return categoria;
  }

  async deleteCategorie(id) { // no elimina, da de baja la categoria
    const categoria = await Categoria.findByPk(id);
    if (!categoria) {
      throw new Error("Categoría no encontrada");
    }
    await categoria.update({ estado: false });

    return categoria;
  }
}

module.exports = new CategoriasService();
