const express = require('express');
const router = express.Router();
const authAdmin = require('../middlewares/authAdmin');
const { body, param } = require('express-validator');
const validateRequest = require('../middlewares/validateRequest');
const pedidosController = require('../controllers/pedidosController');

// Crear un nuevo pedido con productos
router.post('/pedido', [
  authAdmin,
  body('idCliente').notEmpty().withMessage('idCliente es requerido')
    .isInt({ min: 1 }).withMessage('idCliente debe ser un número válido'),
  body('productos').isArray({ min: 1 }).withMessage('productos debe ser un array con al menos un elemento'),
  body('productos.*.idProducto').isInt({ min: 1 }).withMessage('idProducto debe ser válido'),
  body('productos.*.cantidad').isInt({ min: 1 }).withMessage('cantidad debe ser mayor a 0'),
  body('descripcion').optional().isString()
], validateRequest, pedidosController.crear);

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