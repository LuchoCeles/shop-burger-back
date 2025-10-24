const { sequelize } = require("../config/db")

class CategoriasService {
  async getCategories() {
    return await sequelize.query("CALL getAllCategories();");
  }

  async createCategorie(categoriaData) {
    return await sequelize.query("CALL createCategorie(:nombre);", {
      replacements: {
        nombre: categoriaData.nombre,
      },
    });
  }

  async updateCategorie(id, nombre) {
    try {
      const categoria = await sequelize.query("CALL updateCategorie(:id, :nombre);", {
        replacements: {
          id, nombre
        },
      });

      if (!categoria) {
        throw new Error("Categoría no encontrada");
      }

      return categoria;
    } catch (error) {
      throw new Error(`No se pudo actualizar la categoria`);
    }
  }

  async updateEstate(id, nuevoEstado) {
    try {
      const categoria = await sequelize.query("CALL updateCategorieState(:id, :estado);", {
        replacements: {
          id,
          estado: nuevoEstado,
        },
      });

      if (!categoria) {
        throw new Error(`No se encontro la categoria`);
      }

      return categoria;
    } catch (error) {
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
