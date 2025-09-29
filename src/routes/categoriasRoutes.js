const express = require('express');
const { body } = require('express-validator');
const categoriasController = require('../controllers/categoriasController');
const authAdmin = require('../middlewares/authAdmin');
const validateRequest = require('../middlewares/validateRequest');

const router = express.Router();

router.post('/categorias', [
  authAdmin,
  body('nombre').notEmpty().trim()
], validateRequest, categoriasController.createCategoria);

router.put('/categorias/:id', [
  authAdmin,
  body('nombre').notEmpty().trim(),
  body('estado').isBoolean().optional()
], validateRequest, categoriasController.updateCategoria);

module.exports = router;