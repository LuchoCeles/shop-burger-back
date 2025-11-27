const { ProductosXTam } = require('../models');

class ProductosXTamService {
  async deleteByProducto(id,idTam, transaction = null) {
    try {
      await ProductosXTam.destroy({
        where: { idProducto: id , idTam: idTam},
        force: true,
        transaction,
      });
    } catch (error) {
      throw new Error(
        `Error al eliminar asociaciones de tamaños para el producto ${error.message}`
      );
    }
  }

  async getAll() {
    try {
      const asociaciones = await ProductosXTam.findAll();
      return asociaciones;
    } catch (error) {
      throw new Error(
        `Error al obtener las asociaciones de tamaños y productos: ${error.message}`
      );
    }
  }
}

module.exports = new ProductosXTamService();
