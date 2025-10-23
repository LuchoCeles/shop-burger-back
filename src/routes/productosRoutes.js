const express = require('express');
const { body, param } = require('express-validator');
const productosController = require('../controllers/productosController');
const authAdmin = require('../middlewares/authAdmin');
const validateRequest = require('../middlewares/validateRequest');
const handleUpload = require('../middlewares/multerMiddleware');

const router = express.Router();

router.get('/:soloActivos/', productosController.getProducts);


router.post('/', [
  authAdmin,handleUpload,
  body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
  body('descripcion').notEmpty().withMessage('La descripción es obligatoria'),
  body('precio').notEmpty().isDecimal({ min: 0 }).withMessage('El precio es obligatorio y debe ser un número positivo'),
  body('stock').notEmpty().isInt({ min: 0 }).withMessage('El stock es obligatorio y debe ser un entero positivo'),
  body('idCategoria').notEmpty().isInt({ min: 1 }).withMessage('La categoría es obligatoria y debe ser un ID válido'),
], validateRequest, productosController.createProduct);

router.patch('/:id', authAdmin, handleUpload, [
  body('precio').optional().isDecimal({ min: 0 }),
  body('stock').optional().isInt({ min: 0 })
], validateRequest, productosController.updateProduct);

router.delete('/:id', authAdmin, productosController.deleteProduct);

router.patch("/:id/estado", authAdmin, [
  param("id").isInt({ min: 1 }).withMessage("ID de producto inválido"),
  body("estado").isBoolean().withMessage("Estado debe ser 0 o 1"),
], validateRequest, productosController.updateState);

module.exports = router;