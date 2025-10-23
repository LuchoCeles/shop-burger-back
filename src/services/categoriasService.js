const { sequelize } = require("../config/db")

class CategoriasService {
  async getCategories() {
    return await sequelize.query("CALL getAllCategories();");
  }

  async createCategorie(categoriaData) {
    return await Categoria.create(categoriaData);
  }

  async updateCategorie(id, updateData) {
    const categoria = await Categoria.findByPk(id);

    if (!categoria) {
      throw new Error("Categoría no encontrada");
    }
    try {
      await categoria.update(updateData);
      return categoria;
    } catch (error) {
      throw new Error(`No se pudo actualizar la categoria`);
    }
  }

  async updateEstate(id, nuevoEsatdo) {
    const transaction = await sequelize.transaction();
    try {
      const categoria = await Categoria.findByPk(id);
      if (!categoria) {
        throw new Error(`No se encontro la categoria`);
      }
      await categoria.update({ estado: nuevoEsatdo }, { transaction });
      await transaction.commit();
      return categoria;
    } catch (error) {
      if (!transaction.finished) await transaction.rollback();
      throw new Error(`Error al cambiar estado: ${error.message}`);
    }
  }

  async deleteCategory(id) {
    // no elimina, da de baja la categoria
    const transaction = await sequelize.transaction();
    try {
      const products = await Producto.count({
        where: { idCategoria: id },
        transaction,
      });

      if (products > 0) {
        throw new Error(
          `No se puede eliminar la categoria, tiene productos asociados.`
        );
      }

      const result = await Categoria.destroy({
        where: { id },
        transaction,
      });

      if (result === 0) {
        throw new Error(`Categoira no encontrada.`);
      }

      await transaction.commit();
      return { message: "Categoria eliminada correctamente" };
    } catch (error) {
      if (!transaction.finished) await transaction.rollback();
      throw new Error(`Error al eliminar categoria: ${error.message}`);
    }
  }
}

module.exports = new CategoriasService();
