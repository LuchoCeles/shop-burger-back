const express = require('express');
const authAdminRoutes = require('./authAdminRoutes');
const categoriasRoutes = require('./categoriasRoutes');
const productosRoutes = require('./productosRoutes');
const pedidosRoutes = require('./pedidosRoutes');
const clientesRoutes = require('./clientesRoutes');
const pagosRoutes = require('./pagosRoutes');
const datosBancariosRoutes = require('./datosBancariosRoutes');
const localRoutes = require('./localRoutes');

const router = express.Router();

router.use('/admin', authAdminRoutes);
router.use('/categorias', categoriasRoutes);
router.use('/productos', productosRoutes);
router.use('/pedidos', pedidosRoutes);
router.use('/clientes', clientesRoutes);
router.use('/pagos', pagosRoutes);
router.use('/datos-bancarios', datosBancariosRoutes);
router.use('/local', localRoutes);

module.exports = router;