const express = require('express');
const router = express.Router();
const authAdmin = require('../middlewares/authAdmin');
const { body, param } = require('express-validator');
const validateRequest = require('../middlewares/validateRequest');
const pedidosController = require('../controllers/pedidosController');
const validateHour = require('../middlewares/validateHour');

// Crear un nuevo pedido con productos
router.post('/', validateRequest, [
  body('cliente').notEmpty().withMessage('cliente es requerido'),
  body('descripcion').optional().isString().withMessage('descripcion debe ser una cadena'),
  body('productos').isArray({ min: 1 }).notEmpty().withMessage('productos debe ser un array con al menos un elemento'),
  body('productos.adicionales').isArray({ min: 1 }).optional().withMessage('adicionales debe ser un array con al menos un elemento'),
  body('productos.idGuarnicion').optional().isInt({ min: 1 }).withMessage('idGuarnicion debe ser un número entero'),
  body('productos.id').notEmpty().isInt({ min: 1 }).withMessage('idProducto debe ser un número entero'),
  body('productos.idTam').isInt({ min: 1 }).withMessage('cantidad debe ser un número entero'),
  body('metodoDePago').notEmpty().isString().withMessage('metodoDePago es requerido')
], pedidosController.CreateOrder.bind(pedidosController));

// Obtener todos los pedidos (filtros: ?estado=pendiente&idCliente=1)
router.get('/', pedidosController.getOrders);

// Actualizar solo el estado
router.patch('/estado', authAdmin, validateRequest, [
  body('id').isInt({ min: 1 }).withMessage('ID debe ser válido'),
  body('estado').notEmpty().withMessage('estado es requerido')
    .isIn(['pendiente', 'entregado', 'enviado', 'cancelado'])
    .withMessage('Estado inválido')
], pedidosController.updateStatus);

// Cancelar pedido (devuelve stock)
router.patch('/:id/cancelar', authAdmin, validateRequest, [
  param('id').isInt({ min: 1 }).withMessage('ID debe ser válido')
], pedidosController.cancel);

router.patch('/:id/update', validateRequest, [
  authAdmin,
  param('id').isInt({ min: 1 }).withMessage('ID debe ser válido'),
  body('estado').optional().isIn(['entregado', 'cancelado']).withMessage('Estado inválido'),
], pedidosController.updateOrder);

module.exports = router;