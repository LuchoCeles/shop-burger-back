const productosService = require('../services/productosService');

class ProductosController {
  async getProductos(req, res, next) {
    try {
      const productos = await productosService.getProductos();
      
      res.json({
        success: true,
        data: productos
      });
    } catch (error) {
      next(error);
    }
  }

  async getProductoById(req, res, next) {
    try {
      const { id } = req.params;
      const producto = await productosService.getProductoById(id);
      
      res.json({
        success: true,
        data: producto
      });
    } catch (error) {
      next(error);
    }
  }

  async createProducto(req, res, next) {
    try {
      const productoData = req.body;
      const producto = await productosService.createProducto(productoData);
      
      res.status(201).json({
        success: true,
        message: 'Producto creado exitosamente',
        data: producto
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProducto(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const producto = await productosService.updateProducto(id, updateData);
      
      res.json({
        success: true,
        message: 'Producto actualizado exitosamente',
        data: producto
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteProducto(req, res, next) {
    try {
      const { id } = req.params;
      await productosService.deleteProducto(id);
      
      res.json({
        success: true,
        message: 'Producto eliminado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProductosController();