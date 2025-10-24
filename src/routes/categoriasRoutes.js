const express = require('express');
const { body, param } = require('express-validator');
const categoriasController = require('../controllers/categoriasController');
const authAdmin = require('../middlewares/authAdmin');
const validateRequest = require('../middlewares/validateRequest');

const router = express.Router();

router.get('/', categoriasController.getCategories);

router.post('/', authAdmin, [
  body('nombre').notEmpty().trim()
], validateRequest, categoriasController.createCategorie);

router.patch('/:id', authAdmin, [
  body('nombre').notEmpty().trim()
], validateRequest, categoriasController.updateCategorie);

router.delete('/:id', authAdmin, categoriasController.deleteCategory);

router.patch('/:id/estado', authAdmin, [
  param("id").isInt({ min: 1 }).withMessage("ID invalido"),
  body("estado").isBoolean().withMessage("El campo 'Estado' debe ser un valor booleano"),
], validateRequest, categoriasController.updateEstate);

module.exports = router;