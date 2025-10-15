const express = require('express');
const authAdminRoutes = require('./authAdminRoutes');
const productosRoutes = require('./productosRoutes');
const categoriasRoutes = require('./categoriasRoutes');
const pedidosRoutes = require('./pedidosRoutes');
const datosBancariosRoutes = require('./datosBancariosRoutes');
const adicionalesRoutes = require('./adicionalesRoutes');

const router = express.Router();

router.use('/admin', authAdminRoutes);
router.use('/api/producto', productosRoutes);
router.use('/api/categoria', categoriasRoutes);
router.use('/admin/pedido', pedidosRoutes);
router.use('/admin/banco', datosBancariosRoutes);
router.use('/api/adicional', adicionalesRoutes);


module.exports = router;