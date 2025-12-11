const express = require('express');
const TamController = require('../controllers/tamController');
const authAdmin = require('../middlewares/authAdmin');
const validateRequest = require('../middlewares/validateRequest');
const { body } = require('express-validator');

const router = express.Router();

router.get('/', TamController.get);

router.post('/', authAdmin, validateRequest, [
  body('nombre').notEmpty().withMessage('El nombre es obligatorio').isLength({ max: 25 }).withMessage('El nombre no puede tener más de 25 caracteres'),
  body('idCategoria').notEmpty().isInt({ min: 1 }).withMessage('La categoría es obligatoria'),
], TamController.create);

router.patch('/:id', [
  body('nombre').optional().notEmpty(),
  body('idCategoria').optional().notEmpty()
], authAdmin, TamController.updateTam);

router.patch('/:id/estado', authAdmin, TamController.updateEstado);

router.delete('/:id', authAdmin, TamController.delete);


module.exports = router;