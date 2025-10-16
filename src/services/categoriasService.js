const { Categoria, sequelize } = require("../models");

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

  async updateEstate(id,nuevoEsatdo){
    const transaction = await sequelize.transaction();
    try {
       const categoria = await Categoria.findByPk(id);
       if(!categoria){
        throw new Error(`No se encontro la categoria`);
       }
       await categoria.update({estado:nuevoEsatdo},{transaction});
       await transaction.commit();
       return categoria;
    } catch (error) {
      if(!transaction.finished) await transaction.rollback();
      throw new Error (`Error al cambiar estado: ${error.message}`);
    }
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
