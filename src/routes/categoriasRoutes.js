const express = require('express');
const { body } = require('express-validator');
const categoriasController = require('../controllers/categoriasController');
const authAdmin = require('../middlewares/authAdmin');
const validateRequest = require('../middlewares/validateRequest');

const router = express.Router();

router.get('/',categoriasController.getCategories);

router.post('/', [
  authAdmin,
  body('nombre').notEmpty().trim()
], validateRequest, categoriasController.createCategorie);

router.put('/:id', [
  authAdmin,
  body('nombre').notEmpty().trim(),
  body('estado').isBoolean().optional()
], validateRequest, categoriasController.updateCategorie);

router.delete('/:id',authAdmin,categoriasController.deleteCategorie);

module.exports = router;