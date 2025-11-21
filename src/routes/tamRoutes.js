const express = require('express');
const TamController = require('../controllers/tamController');
const authAdmin = require('../middlewares/authAdmin');
const validateRequest = require('../middlewares/validateRequest');
const { body } = require('express-validator');

const router = express.Router();

router.get('/', TamController.get);

router.post('/', authAdmin, validateRequest, [
  body('nombre').notEmpty().withMessage('El nombre es obligatorio').isLength({ max: 25 }).withMessage('El nombre no puede tener más de 25 caracteres')
], TamController.create);

router.patch('/:id/estado', authAdmin, TamController.update);

router.patch('/:id', authAdmin, TamController.updateCategoria);

router.delete('/:id', authAdmin, TamController.delete);


module.exports = router;