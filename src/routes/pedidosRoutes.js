const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedido.controller');

// Crear un nuevo pedido
router.post('/', pedidoController.crear);

// Obtener todos los pedidos (con filtros opcionales por query: ?estado=pendiente&idCliente=1)
router.get('/', pedidoController.obtenerTodos);

// Obtener un pedido por ID
router.get('/:id', pedidoController.obtenerPorId);

// Obtener pedidos de un cliente específico
router.get('/cliente/:idCliente', pedidoController.obtenerPorCliente);

// Actualizar un pedido completo
router.put('/:id', pedidoController.actualizar);

// Actualizar solo el estado de un pedido
router.patch('/:id/estado', pedidoController.actualizarEstado);

// Agregar productos a un pedido
router.post('/:id/productos', pedidoController.agregarProductos);

// Eliminar un pedido
router.delete('/:id', pedidoController.eliminar);

module.exports = router;