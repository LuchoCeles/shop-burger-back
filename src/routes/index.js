const express = require('express');
const authAdminRoutes = require('./authAdminRoutes');
const productosRoutes = require('./productosRoutes');
const categoriasRoutes = require('./categoriasRoutes');

const router = express.Router();

router.use('/admin', authAdminRoutes);
router.use('/api', productosRoutes);
router.use('/api', categoriasRoutes);

module.exports = router;