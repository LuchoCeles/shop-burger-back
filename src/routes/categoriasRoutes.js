const express = require('express');
const { body, param } = require('express-validator');
const categoriasController = require('../controllers/categoriasController');
const authAdmin = require('../middlewares/authAdmin');
const validateRequest = require('../middlewares/validateRequest');

const router = express.Router();

router.get('/', categoriasController.getCategories);

router.post('/', authAdmin, validateRequest, [
  body('nombre').notEmpty().trim()
], categoriasController.createCategorie);

router.patch('/:id', authAdmin, validateRequest, [
  body('nombre').notEmpty().trim()
], categoriasController.updateCategorie);

router.delete('/:id', authAdmin, categoriasController.deleteCategory);

router.patch('/:id/estado', authAdmin, validateRequest, [
  param("id").isInt({ min: 1 }).withMessage("ID invalido"),
  body("estado").isBoolean().withMessage("El campo 'Estado' debe ser un valor booleano"),
], categoriasController.updateEstate);

module.exports = router;