const productosService = require("../services/productosService");

class ProductosController {
  async getProducts(req, res) {
    try {
      const { soloActivos } = req.query;
      // es para parsear el string a boolean
      const soloActivosBool = soloActivos === "true" ? true : false;
      const productos = await productosService.getProducts(soloActivosBool);

      res.json({
        success: true,
        data: productos
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getProductoByCategoria(req, res) {
    try {
      const { idCategoria } = req.params;
      const productos = await productosService.getProductoByCategoria(
        idCategoria
      );
      res.json({
        success: true,
        data: productos
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getProductById(req, res) {
    try {
      const { id } = req.params;
      const producto = await productosService.getProductById(id);

      res.json({
        success: true,
        data: producto,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  createProduct = async (req, res, next) => {
    try {
      const imageBuffer = req.file ? req.file.buffer : null;
      const body = req.body;

      let tamData = [];
      if (body.tam) {
        try {
          tamData = JSON.parse(body.tam);
        } catch (e) {
          return res.status(400).json({ success: false, message: "El formato del array 'tam' es inválido." });
        }
      }

      const productoData = {
        nombre: body.nombre,
        descripcion: body.descripcion,
        stock: body.stock,
        idCategoria: body.idCategoria,
        descuento: body.descuento,
        isPromocion: body.isPromocion === 'true',
      };
      
      const productoCreado = await productosService.createProduct(productoData, tamData, imageBuffer);

      return res.status(201).json({
        success: true,
        message: "Producto creado exitosamente",
        data: productoCreado,
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

  async updateProduct(req, res) {
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
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      await productosService.deleteProduct(id);

      res.json({
        success: true,
        message: "Producto eliminado exitosamente",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new ProductosController();
