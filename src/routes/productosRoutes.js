const express = require('express');
const { body } = require('express-validator');
const productosController = require('../controllers/productosController');
const authAdmin = require('../middlewares/authAdmin');
const validateRequest = require('../middlewares/validateRequest');
const handleUpload = require('../middlewares/multerMiddleware');

const router = express.Router();

router.get('/producto/', productosController.getProducts);
router.get('/producto/:id', productosController.getProductById);


router.post('/producto', [
  authAdmin,
  body('nombre'),
  body('descripcion'),
  body('precio'),
  body('stock'),
  body('idCategoria')
], validateRequest, handleUpload, productosController.createProduct);

router.patch('/:id', [
  authAdmin,
  body('precio').optional().isDecimal({ min: 0 }),
  body('stock').optional().isInt({ min: 0 })
], validateRequest, handleUpload, productosController.updateProduct);

router.delete('/:id', authAdmin, productosController.deleteProduct);

module.exports = router;