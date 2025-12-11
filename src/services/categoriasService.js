const { sequelize } = require("../config/db")
const { Producto, Categoria } = require("../models");

class CategoriasService {
  async getCategories() {
    try {
      return await sequelize.query("CALL getAllCategories();");
    } catch (error) {
      throw new Error(`Error al obtener categorias: ${error.message}`);
    }
  }

  async createCategorie(categoriaData) {
    const transaction = await sequelize.transaction();
    try {
      const categoria = await sequelize.query("CALL createCategorie(:nombre);", {
        replacements: {
          nombre: categoriaData.nombre,
        },
        transaction
      });
      await transaction.commit();
      return categoria;
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al crear categoria: ${error.message}`);
    }
  }

  async updateCategorie(id, nombre) {
    const transaction = await sequelize.transaction();
    try {
      const categoria = await sequelize.query("CALL updateCategorie(:id, :nombre);", {
        replacements: {
          id, nombre
        },
        transaction
      });
      await transaction.commit();

      return categoria;
    } catch (error) {
      await transaction.rollback();
      throw new Error(`No se pudo actualizar la categoria`);
    }
  }

  async updateEstate(id, nuevoEstado) {
    const transaction = await sequelize.transaction();
    try {
      const categoria = await sequelize.query("CALL updateCategorieState(:id, :estado);", {
        replacements: {
          id,
          estado: nuevoEstado,
          transaction
        },
      });
      await transaction.commit();

      return categoria;
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al cambiar estado: ${error.message}`);
    }
  }

  async deleteCategory(id) {
    const transaction = await sequelize.transaction();
    try {
      const products = await Producto.count({
        where: { idCategoria: id },
        transaction,
      });

      if (products > 0) throw new Error("No se puede eliminar la categoria, tiene productos asociados.");

      const result = await Categoria.destroy({
        where: { id },
        transaction,
      });

      if (result === 0) throw new Error("Categoría no encontrada.");

      await transaction.commit();
      return true;

    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al eliminar categoría: ${error.message}`);
    }
  }
}

module.exports = new CategoriasService();
