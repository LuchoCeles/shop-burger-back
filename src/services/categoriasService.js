
const { Categoria } = require("../models");

class CategoriasService {
  async createCategoria(categoriaData) {
    return await Categoria.create(categoriaData);
  }

  async updateCategoria(id, updateData) {
    const categoria = await Categoria.findByPk(id);

    if (!categoria) {
      throw new Error("Categoría no encontrada");
    }

    await categoria.update(updateData);
    return categoria;
  }
  async getCategorias() {
    return await Categoria.findAll();
  }

  async deleteCategoria(id) {
    const categoria = await Categoria.findByPk(id);
    if (!categoria) {
      throw new Error("Categoría no encontrada");
    }
    await categoria.update({ estado: false });

    return categoria;
  }
}

module.exports = new CategoriasService();
