const express = require('express');
const router = express.Router();
const authAdmin = require('../middlewares/authAdmin');
const { body } = require('express-validator');
const validateRequest = require('../middlewares/validateRequest');
const pedidosController = require('../controllers/pedidosController');

// Crear un nuevo pedido
router.post('/pedido', [
  authAdmin,
  body('idCliente').notEmpty().withMessage('idCliente es requerido'),
  body('precioTotal').notEmpty().withMessage('precioTotal es requerido')
    .isDecimal({ min: 0 }).withMessage('precioTotal debe ser un número positivo'),
  body('descripcion').optional(),
  body('estado').optional()
    .isIn(['pendiente', 'confirmado', 'preparando', 'en_camino', 'entregado', 'cancelado'])
    .withMessage('Estado inválido')
], validateRequest, pedidosController.crear);

// Obtener todos los pedidos
router.get('/', authAdmin, pedidosController.getPedidos);

// Obtener un pedido por ID
router.get('/:id', authAdmin, pedidosController.getById);

// Actualizar un pedido completo
router.put('/:id', [
  authAdmin,
  body('precioTotal').optional()
    .isDecimal({ min: 0 }).withMessage('precioTotal debe ser un número positivo'),
  body('descripcion').optional(),
  body('estado').optional()
    .isIn(['pendiente', 'confirmado', 'preparando', 'en_camino', 'entregado', 'cancelado'])
    .withMessage('Estado inválido')
], validateRequest, pedidosController.update);

// Actualizar solo el estado de un pedido
router.patch('/:id/estado', [
  authAdmin,
  body('estado').notEmpty().withMessage('estado es requerido')
    .isIn(['pendiente', 'confirmado', 'preparando', 'en_camino', 'entregado', 'cancelado'])
    .withMessage('Estado debe ser: pendiente, confirmado, preparando, en_camino, entregado o cancelado')
], validateRequest, pedidosController.actualizarEstado);

// Eliminar un pedido
router.delete('/:id', authAdmin, pedidosController.delete);

module.exports = router;