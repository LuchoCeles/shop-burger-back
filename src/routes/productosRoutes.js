const express = require('express');
const { body } = require('express-validator');
const productosController = require('../controllers/productosController');
const authAdmin = require('../middlewares/authAdmin');
const validateRequest = require('../middlewares/validateRequest');

const router = express.Router();

router.get('/', productosController.getProductos);
router.get('/:id', productosController.getProductoById);

router.post('/', [
  authAdmin,
  body('nombre').notEmpty().trim(),
  body('precio').isDecimal({ min: 0 }),
  body('stock').isInt({ min: 0 }),
  body('idCategoria').isInt({ min: 1 })
], validateRequest, productosController.createProducto);

router.put('/:id', [
  authAdmin,
  body('precio').optional().isDecimal({ min: 0 }),
  body('stock').optional().isInt({ min: 0 })
], validateRequest, productosController.updateProducto);

router.delete('/:id', authAdmin, productosController.deleteProducto);

module.exports = router;