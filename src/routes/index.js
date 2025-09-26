const express = require('express');
const authAdminRoutes = require('./authAdminRoutes');
const productosRoutes = require('./productosRoutes');

const router = express.Router();

router.use('/admin', authAdminRoutes);
router.use('/', productosRoutes);

module.exports = router;