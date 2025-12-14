const express = require('express');
const authAdminRoutes = require('./authAdminRoutes');
const productosRoutes = require('./productosRoutes');
const categoriasRoutes = require('./categoriasRoutes');
const pedidosRoutes = require('./pedidosRoutes');
const datosBancariosRoutes = require('./datosBancariosRoutes');
const datosBancariosController = require("../controllers/datosBancariosController");
const adicionalesRoutes = require('./adicionalesRoutes');
const adicionalesXProductosRoutes = require('./adicionalesXProductosRoutes');
const mercadoPagoRoutes = require('./mercadoPagoRoutes');
const guarnicionRoutes = require('./guarnicionesRoutes');
const guarnicionesXProductoRoutes = require('./guarnicionesXProductoRoutes');
const tamRoutes = require('./tamRoutes');
const pagosRoutes = require('./pagosRoutes');
const diasRoutes = require('./diasRoutes');
const configuracionRoutes = require('./configuracionRoutes');

const router = express.Router();

router.use('/admin', authAdminRoutes);
router.use('/api/producto', productosRoutes);
router.use('/api/categoria', categoriasRoutes);
router.use('/admin/pedido', pedidosRoutes);
router.use('/admin/banco', datosBancariosRoutes);
router.use('/api/banco', router.get('/', datosBancariosController.getPublic));
router.use('/api/adicional', adicionalesRoutes);
router.use('/admin/adicionalxproducto', adicionalesXProductosRoutes);
router.use('/api/mercadopago', mercadoPagoRoutes);
router.use('/api/guarnicion', guarnicionRoutes);
router.use('/admin/guarnicionesxproducto', guarnicionesXProductoRoutes);
router.use('/api/tam', tamRoutes);
router.use('/admin/pago', pagosRoutes);
router.use('/api/dias', diasRoutes);
router.use('/api/configuracion', configuracionRoutes);

module.exports = router;