const express = require('express');
const { body,param } = require('express-validator');
const productosController = require('../controllers/productosController');
const authAdmin = require('../middlewares/authAdmin');
const validateRequest = require('../middlewares/validateRequest');
const handleUpload = require('../middlewares/multerMiddleware');

const router = express.Router();

router.get('/', productosController.getProducts);
router.get('/:id', productosController.getProductById);


router.post('/', [
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

router.patch("/:id/estado",[
    authAdmin,
    param("id").isInt({ min: 1 }).withMessage("ID de producto inválido"),
    body("estado").isInt({ min: 0, max: 1 }).withMessage("Estado debe ser 0 o 1"),
    
  ], validateRequest, productosController.updateEstate);

module.exports = router;