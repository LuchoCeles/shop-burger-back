const express = require('express');
const router = express.Router();
const authAdmin = require('../middlewares/authAdmin');
const { body, param } = require('express-validator');
const validateRequest = require('../middlewares/validateRequest');
const pedidosController = require('../controllers/pedidosController');

// Crear un nuevo pedido con productos
router.post('/', authAdmin, [
  body('cliente').notEmpty(),
  body('descripcion'),
  body('productos').isArray({ min: 1 }).withMessage('productos debe ser un array con al menos un elemento'),
], validateRequest, pedidosController.CreateOrder);

// Obtener todos los pedidos (filtros: ?estado=pendiente&idCliente=1)
router.get('/', authAdmin, pedidosController.getOrders);

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

router.patch('/:id/update',[
  authAdmin,
  param('id').isInt({ min: 1 }).withMessage('ID debe ser válido')
],validateRequest, pedidosController.updateOrder);

module.exports = router;