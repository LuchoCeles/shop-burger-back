
const express = require('express');
const authAdmin = require('../middlewares/authAdmin');
const validateRequest = require('../middlewares/validateRequest');
const { body, param } = require('express-validator');
const router = express.Router();
const productosXTamController = require('../controllers/productosXTamController');

router.get('/', productosXTamController.getAll);

router.delete('/:id', authAdmin,validateRequest,  [
    param('id').toInt().isInt({ min: 1 }).withMessage('El ID del producto debe ser un número válido.'),
], productosXTamController.deleteByProducto);


module.exports = router;