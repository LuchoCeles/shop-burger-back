
const express = require('express');
const router = express.Router();
const DiasController = require('../controllers/diasController');
const validateRequest = require('../middlewares/validateRequest');
const authAdmin = require('../middlewares/authAdmin');
const { body } = require('express-validator');

router.get('/', DiasController.getAll);

router.patch('/:id', authAdmin, validateRequest, [
  body("rangos").isArray({ min: 1 }).withMessage("Debe proporcionar al menos un rango de horario"),
], DiasController.update);

module.exports = router;