const { where } = require('sequelize');
const { Producto } = require('../models');
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

  async getProductoByCategoria(req,res,next){
    try {
       const{idCategoria} = req.params;
       const productos = await productosService.getProductoByCategoria(idCategoria);
       res.json({
        success:true,
        data:productos
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
      const imageBuffer = req.file ? req.file.buffer : null;

      if (!productoData.nombre || !productoData.descripcion || !productoData.precio || !productoData.stock || !productoData.idCategoria || !imageBuffer) {
        return res.status(400).json({
          success: false,
          message: 'Todos los campos son obligatorios'
        });
      }

      if (productoData.precio) productoData.precio = parseFloat(productoData.precio);
      if (productoData.descuento) productoData.descuento = parseFloat(productoData.descuento);
      if (productoData.stock) productoData.stock = parseInt(productoData.stock);
      if (productoData.idCategoria) productoData.idCategoria = parseInt(productoData.idCategoria);

      if (productoData.isPromocion) {
        productoData.isPromocion = productoData.isPromocion === 'true';
      }

      const producto = await productosService.createProducto(productoData, imageBuffer);

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
      const imageBuffer = req.file ? req.file.buffer : null;

      // Parsear campos numéricos
      if (updateData.precio) updateData.precio = parseFloat(updateData.precio);
      if (updateData.descuento) updateData.descuento = parseFloat(updateData.descuento);
      if (updateData.stock) updateData.stock = parseInt(updateData.stock);

      if (updateData.isPromocion !== undefined) {
        updateData.isPromocion = updateData.isPromocion === 'true';
      }

      const producto = await productosService.updateProducto(id, updateData, imageBuffer);

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