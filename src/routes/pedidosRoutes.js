const express = require('express');
const router = express.Router();
const authAdmin = require('../middlewares/authAdmin');
const { body, param } = require('express-validator');
const validateRequest = require('../middlewares/validateRequest');
const pedidosController = require('../controllers/pedidosController');

// Crear un nuevo pedido con productos
router.post('/', [
  body('cliente').notEmpty().withMessage('cliente es requerido'),
  body('descripcion').optional().isString().withMessage('descripcion debe ser una cadena'),
  body('productos').isArray({ min: 1 }).notEmpty().withMessage('productos debe ser un array con al menos un elemento'),
  body('adicionales').isArray({ min: 1 }).optional().withMessage('adicionales debe ser un array con al menos un elemento'),
  body('metodoDePago').notEmpty().isString().withMessage('metodoDePago es requerido')
], validateRequest, pedidosController.CreateOrder);

// Obtener todos los pedidos (filtros: ?estado=pendiente&idCliente=1)
router.get('/', pedidosController.getOrders);

// Actualizar solo el estado
router.patch('/estado', authAdmin, [
  body('id').isInt({ min: 1 }).withMessage('ID debe ser válido'),
  body('estado').notEmpty().withMessage('estado es requerido')
    .isIn(['pendiente', 'entregado', 'cancelado'])
    .withMessage('Estado inválido')
], validateRequest, pedidosController.updateStatus);

// Cancelar pedido (devuelve stock)
router.patch('/:id/cancelar', authAdmin, [
  param('id').isInt({ min: 1 }).withMessage('ID debe ser válido')
], validateRequest, pedidosController.cancel);

router.patch('/:id/update', [
  authAdmin,
  param('id').isInt({ min: 1 }).withMessage('ID debe ser válido')
], validateRequest, pedidosController.updateOrder);

module.exports = router;