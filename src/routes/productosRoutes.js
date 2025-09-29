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
  body('nombre'),
  body('descripcion'),
  body('precio'),
  body('stock'),
  body('idCategoria')
], validateRequest, handleUpload, productosController.createProducto);

router.patch('/:id', [
  authAdmin,
  body('precio').optional().isDecimal({ min: 0 }),
  body('stock').optional().isInt({ min: 0 })
], validateRequest, handleUpload, productosController.updateProducto);

router.delete('/:id', authAdmin, productosController.deleteProducto);

module.exports = router;