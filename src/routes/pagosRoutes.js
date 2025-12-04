const express = require('express');
const authAdmin = require('../middlewares/authAdmin');
const router = express.Router();
const pagosController = require('../controllers/pagosController');
const validateRequest = require('../middlewares/validateRequest');
const { body } = require('express-validator');

router.patch('/estado', authAdmin, validateRequest, [
    body('id').isInt().withMessage('El ID debe ser un número entero.'),
    body('estado').notEmpty().withMessage('estado es requerido').isIn(['Pagado', 'Cancelado']).withMessage('Estado inválido')
], pagosController.update);

module.exports = router;




