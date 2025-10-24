const productosService = require("../services/productosService");

class ProductosController {
  async getProducts(req, res, next) {
    try {
      const { soloActivos } = req.params;
      console.log('solo activo es un: ', soloActivos);
      // es para parsear el string a boolean
      const soloActivosBool = soloActivos === "true";
      const productos = await productosService.getProducts(soloActivosBool);

      res.json({
        success: true,
        data: productos,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProductoByCategoria(req, res, next) {
    try {
      const { idCategoria } = req.params;
      const productos = await productosService.getProductoByCategoria(
        idCategoria
      );
      res.json({
        success: true,
        data: productos,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProductById(req, res, next) {
    try {
      const { id } = req.params;
      const producto = await productosService.getProductById(id);

      res.json({
        success: true,
        data: producto,
      });
    } catch (error) {
      next(error);
    }
  }

  async createProduct(req, res, next) {
    try {
      const productoData = req.body;

      const imageBuffer = req.file ? req.file.buffer : null;

      if (productoData.precio)
        productoData.precio = parseFloat(productoData.precio);
      if (productoData.descuento)
        productoData.descuento = parseFloat(productoData.descuento);
      if (productoData.stock) productoData.stock = parseInt(productoData.stock);
      if (productoData.idCategoria)
        productoData.idCategoria = parseInt(productoData.idCategoria);

      if (productoData.isPromocion) {
        productoData.isPromocion = productoData.isPromocion === "true";
      }

      const producto = await productosService.createProduct(
        productoData,
        imageBuffer
      );

      res.status(201).json({
        success: true,
        message: "Producto creado exitosamente",
        data: producto,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateState(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      if (typeof estado === "undefined") {
        return res.status(400).json({
          success: false,
          message: "El campo 'estado' es obligatorio",
        });
      }

      const producto = await productosService.updateState(id, estado);

      res.status(200).json({
        success: true,
        message: "Estado actualizado",
        data: {
          id: producto.id,
          estado: producto.estado,
        },
      });
      
      

    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateProduct(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const imageBuffer = req.file ? req.file.buffer : null;

      // Parsear campos numéricos
      if (updateData.precio) updateData.precio = parseFloat(updateData.precio);
      if (updateData.descuento)
        updateData.descuento = parseFloat(updateData.descuento);
      if (updateData.stock) updateData.stock = parseInt(updateData.stock);

      if (updateData.isPromocion !== undefined) {
        updateData.isPromocion = updateData.isPromocion === "true";
      }

      const producto = await productosService.updateProduct(
        id,
        updateData,
        imageBuffer
      );

      res.json({
        success: true,
        message: "Producto actualizado exitosamente",
        data: producto,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;
      await productosService.deleteProduct(id);

      res.json({
        success: true,
        message: "Producto eliminado exitosamente",
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProductosController();
