const express = require('express');
const { body } = require('express-validator');
const categoriasController = require('../controllers/categoriasController');
const authAdmin = require('../middlewares/authAdmin');
const validateRequest = require('../middlewares/validateRequest');

const router = express.Router();

router.get('/categoria/',categoriasController.getCategoria);

router.post('/categoria', [
  authAdmin,
  body('nombre').notEmpty().trim()
], validateRequest, categoriasController.createCategoria);

router.put('/categoria/:id', [
  authAdmin,
  body('nombre').notEmpty().trim(),
  body('estado').isBoolean().optional()
], validateRequest, categoriasController.updateCategoria);

router.delete('/categoria/:id',authAdmin,categoriasController.deleteCategoria);

module.exports = router;