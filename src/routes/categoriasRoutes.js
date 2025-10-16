const express = require('express');
const { body,param } = require('express-validator');
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

router.patch('/:id/estado',[
  authAdmin,
  param("id").isInt({min:1}).withMessage("ID invalido"),
  body("estado").isInt({min:0, max:1}).withMessage("Estado debe ser 0 o 1"),
],validateRequest, categoriasController.updateEstate);

module.exports = router;