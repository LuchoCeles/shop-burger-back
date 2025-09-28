const express = require('express');
const { body } = require('express-validator');
const productosController = require('../controllers/productosController');
const authAdmin = require('../middlewares/authAdmin');
const validateRequest = require('../middlewares/validateRequest');
const handleUpload = require('../middlewares/multerMiddleware');

const router = express.Router();

router.get('/', productosController.getProductos);
router.get('/:id', productosController.getProductoById);

router.post('/producto', [
  authAdmin,
  body('nombre').notEmpty().trim(),
  body('descripcion').notEmpty().trim(),
  body('precio').isDecimal({ min: 0 }),
  body('stock').isInt({ min: 0 }),
  body('idCategoria').isInt({ min: 1 })
], validateRequest, handleUpload, productosController.createProducto);

router.post('/categoria', [
  authAdmin,
  body('nombre').notEmpty().trim()
], validateRequest, productosController.createCategoria);

router.put('/categoria/:id', [
  authAdmin,
  body('nombre').notEmpty().trim(),
  body('estado').isBoolean().optional()
], validateRequest, productosController.updateCategoria);

router.put('/:id', [
  authAdmin,
  body('precio').optional().isDecimal({ min: 0 }),
  body('stock').optional().isInt({ min: 0 })
], validateRequest, handleUpload, productosController.updateProducto);

router.delete('/:id', authAdmin, productosController.deleteProducto);

module.exports = router;