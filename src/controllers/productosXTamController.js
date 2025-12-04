const ProductosXTamService = require('../services/productosXTamService');

class ProductosXTamController {
  async deleteByProducto(req, res) {
    try {
      const { id } = req.params;
      await ProductosXTamService.deleteByProducto(id);
      return res.status(200).json({
        success: true,
        message: `Asociaciones de tamaños para el producto eliminadas correctamente.`,
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const asociaciones = await ProductosXTamService.getAll();
      return res.status(200).json({
        success: true,
        message: "Lista de asociaciones obtenida correctamente.",
        data: asociaciones,
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new ProductosXTamController();
