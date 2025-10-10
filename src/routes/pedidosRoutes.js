const express = require('express');
const router = express.Router();
const authAdmin = require('../middlewares/authAdmin');
const { body, param } = require('express-validator');
const validateRequest = require('../middlewares/validateRequest');
const pedidosController = require('../controllers/pedidosController');

// Crear un nuevo pedido con productos
router.post('/pedido', [
  authAdmin,
  body('productos').isArray({ min: 1 }).withMessage('productos debe ser un array con al menos un elemento'),
  body('cliente').notEmpty(),
  body('descripcion').notEmpty(),
], validateRequest, pedidosController.CreateOrder);

// Obtener todos los pedidos (filtros: ?estado=pendiente&idCliente=1)
router.get('/', authAdmin, pedidosController.getPedidos);

// Actualizar solo el estado
router.patch('/:id/estado', [
  authAdmin,
  param('id').isInt({ min: 1 }).withMessage('ID debe ser válido'),
  body('estado').notEmpty().withMessage('estado es requerido')
    .isIn(['pendiente', 'confirmado', 'preparando', 'en_camino', 'entregado', 'cancelado'])
    .withMessage('Estado inválido')
], validateRequest, pedidosController.actualizarEstado);

// Cancelar pedido (devuelve stock)
router.patch('/:id/cancelar', [
  authAdmin,
  param('id').isInt({ min: 1 }).withMessage('ID debe ser válido')
], validateRequest, pedidosController.cancelar);

// Eliminar pedido
router.delete('/:id', [
  authAdmin,
  param('id').isInt({ min: 1 }).withMessage('ID debe ser válido')
], validateRequest, pedidosController.delete);

module.exports = router;