const express = require('express');
const authAdminRoutes = require('./authAdminRoutes');
const productosRoutes = require('./productosRoutes');
const categoriasRoutes = require('./categoriasRoutes');
const pedidosRoutes = require('./pedidosRoutes');
const datosBancariosRoutes = require('./datosBancariosRoutes');
const adicionalesRoutes = require('./adicionalesRoutes');
const adicionalesXProductosRoutes = require('./adicioanlesXProductosRoutes');
const mercadoPagoRoutes = require('./mercadoPagoRoutes');
const horariosRoute = require('./horariosRoutes');
const localRoute = require('./localRoutes');
const horarioDiasRoutes = require('./horarioDiasRoutes');
const guarnicionRoutes = require('./guarnicionesRoutes');
const guarnicionesXProductoRoutes = require('./guarnicionesXProductoRoutes');
const tamRoutes = require('./tamRoutes');

const router = express.Router();

router.use('/admin', authAdminRoutes);
router.use('/api/producto', productosRoutes);
router.use('/api/categoria', categoriasRoutes);
router.use('/admin/pedido', pedidosRoutes);
router.use('/admin/banco', datosBancariosRoutes);
router.use('/api/adicional', adicionalesRoutes);
router.use('/admin/adicionalxproducto', adicionalesXProductosRoutes);
router.use('/api/mercadopago', mercadoPagoRoutes);
router.use('/api/horarios',horariosRoute);
router.use('/api/local',localRoute);
router.use('/api/horarioDias',horarioDiasRoutes);
router.use('/api/guarnicion',guarnicionRoutes);
router.use('/api/guarnicionesxproducto',guarnicionesXProductoRoutes);
router.use('/api/tam',tamRoutes);

module.exports = router;