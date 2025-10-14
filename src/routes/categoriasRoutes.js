const express = require('express');
const { body } = require('express-validator');
const categoriasController = require('../controllers/categoriasController');
const authAdmin = require('../middlewares/authAdmin');
const validateRequest = require('../middlewares/validateRequest');

const router = express.Router();

router.get('/categoria/',categoriasController.getCategories);

router.post('/categoria', [
  authAdmin,
  body('nombre').notEmpty().trim()
], validateRequest, categoriasController.createCategorie);

router.put('/categoria/:id', [
  authAdmin,
  body('nombre').notEmpty().trim(),
  body('estado').isBoolean().optional()
], validateRequest, categoriasController.updateCategorie);

router.delete('/categoria/:id',authAdmin,categoriasController.deleteCategorie);

module.exports = router;