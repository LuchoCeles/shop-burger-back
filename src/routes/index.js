const express = require('express');
const authAdminRoutes = require('./authAdminRoutes');
const productosRoutes = require('./productosRoutes');
const categoriasRoutes = require('./categoriasRoutes');
const pedidosRoutes = require('./pedidosRoutes');
const clientesRoutes = require('./clientesRoutes');
const datosBancariosRoutes = require('./datosBancariosRoutes');

const router = express.Router();

router.use('/admin', authAdminRoutes);
router.use('/api', productosRoutes);
router.use('/api', categoriasRoutes);
router.use('/admin', pedidosRoutes);
router.use('/api', clientesRoutes)
router.use('/admin', datosBancariosRoutes);


module.exports = router;