const express = require('express');
const router = express.Router();
const envioController = require('../controllers/envioController');
const authAdmin = require('../middlewares/authAdmin');
const validateRequest = require('../middlewares/validateRequest');
const { body } = require('express-validator');

router.get('/', envioController.get);

router.patch('/:id', authAdmin, [
  body('precio').notEmpty().withMessage('El precio de envio es obligatorio'),
  body('estado').notEmpty().withMessage('El estado de envio es obligatorio')
], validateRequest, envioController.update);

module.exports = router;