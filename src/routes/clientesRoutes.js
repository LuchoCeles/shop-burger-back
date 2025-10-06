const express = require('express');
const { body } = require('express-validator');
const clientesController = require('../controllers/clientesController');
const authAdmin = require('../middlewares/authAdmin');
const validateRequest = require('../middlewares/validateRequest');

const router = express.Router();
router.get('/cliente', clientesController.getCliente);

module.exports = router;