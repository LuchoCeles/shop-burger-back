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
        data: productos,
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
        data: productos,
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

  createProduct = async (req, res) => {
    try {
      const imageBuffer = req.file ? req.file.buffer : null;
      const body = req.body;

      let tamData = [];
      if (body.tam) {
        try {
          tamData = JSON.parse(body.tam);
        } catch (e) {
          return res.status(400).json({
            success: false,
            message: "El formato del array 'tam' es inválido.",
          });
        }
      }

      const productoData = {
        nombre: body.nombre,
        descripcion: body.descripcion,
        stock: body.stock,
        idCategoria: body.idCategoria,
        descuento: body.descuento,
        isPromocion: body.isPromocion === "true",
      };

      const productoCreado = await productosService.createProduct(
        productoData,
        tamData,
        imageBuffer
      );

      return res.status(201).json({
        success: true,
        message: "Producto creado exitosamente",
        data: productoCreado,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

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

  updateProduct = async (req, res) => {
    try {
      const { id } = req.params;
      const data = req.body;
      const imageBuffer = req.file ? req.file.buffer : null;

      let tamData = null;
      if (data.tam) {
        try {
          tamData = JSON.parse(data.tam);
          if (!Array.isArray(tamData)) throw new Error();
        } catch (e) {
          return res.status(400).json({
            success: false,
            message: "El formato del campo 'tam' es inválido.",
          });
        }
      }

      const productoData = {
        nombre: data.nombre,
        descripcion: data.descripcion,
        stock: data.stock,
        idCategoria: data.idCategoria,
        descuento: data.descuento,
        isPromocion:
          data.isPromocion !== undefined
            ? data.isPromocion === "true"
            : undefined,
      };

      Object.keys(productoData).forEach(
        (key) => productoData[key] === undefined && delete productoData[key]
      );

      const productoActualizado = await productosService.updateProduct(
        id,
        productoData,
        tamData,
        imageBuffer
      );

      return res.status(200).json({
        success: true,
        message: "Producto actualizado exitosamente",
        data: productoActualizado,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: `Error al actualizar el producto ${error.message}`,
      });
    }
  };

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
