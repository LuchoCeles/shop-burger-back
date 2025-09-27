const { Producto, Categoria } = require('../models');
const { Op } = require('sequelize');

class ProductosService {
  async getProductos() {
    const productos = await Producto.findAll();
    return productos;
  }

  async getProductoById(id) {
    const producto = await Producto.findOne({
      where: { id, activo: true },
      include: [{
        model: Categoria,
        as: 'categoria',
        attributes: ['id', 'nombre']
      }]
    });

    if (!producto) {
      throw new Error('Producto no encontrado');
    }

    return producto;
  }

  async createProducto(productoData) {
    return await Producto.create(productoData);
  }

  async updateProducto(id, updateData) {
    const producto = await Producto.findByPk(id);

    if (!producto) {
      throw new Error('Producto no encontrado');
    }

    await producto.update(updateData);
    return producto;
  }

  async deleteProducto(id) {
    const producto = await Producto.findByPk(id);

    if (!producto) {
      throw new Error('Producto no encontrado');
    }

    await producto.update({ activo: false });
  }
}

module.exports = new ProductosService();