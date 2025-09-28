const { Producto, Categoria } = require('../models');
const { Op } = require('sequelize');

class ProductosService {
  async getProductos() {
    const productos = await Producto.findAll();
    return productos;
  }

  async getProductoById(id) {
    const producto = await Producto.findOne({
      where: { id, estado: true },
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

    await producto.update({ estado: false });
  }

  async createCategoria(categoriaData) {
    return await Categoria.create(categoriaData);
  }

  async updateCategoria(id, updateData) {
    const categoria = await Categoria.findByPk(id);

    if (!categoria) {
      throw new Error('Categoría no encontrada');
    }

    await categoria.update(updateData);
    return categoria;
  }
  
}

module.exports = new ProductosService();