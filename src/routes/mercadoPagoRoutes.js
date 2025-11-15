const express = require('express');
const router = express.Router();
const mercadoPagoController = require('../controllers/mercadoPagoController');

router.post('/webhooks', mercadoPagoController.webHooksMercadoPago.bind(mercadoPagoController));

module.exports = router;