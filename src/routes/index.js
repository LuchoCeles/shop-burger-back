const express = require('express');
const authAdminRoutes = require('./authAdminRoutes');
const productosRoutes = require('./productosRoutes');
const categoriasRoutes = require('./categoriasRoutes');
const pedidosRoutes = require('./pedidosRoutes');

const router = express.Router();

router.use('/admin', authAdminRoutes);
router.use('/api', productosRoutes);
router.use('/api', categoriasRoutes);
router.use('/api', pedidosRoutes);

module.exports = router;