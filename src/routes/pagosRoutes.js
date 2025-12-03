const express = require('express');
const authAdmin = require('../middlewares/authAdmin');
const router = express.Router();
const PagosController = require('../controllers/pagosController');
const { BOOLEAN } = require('sequelize');
const { body } = require('express-validator');

router.patch('/:id/estado',authAdmin,validateRequest,[
    body('id').isInt().withMessage('El ID debe ser un número entero.'),
    body('estado').isBoolean().withMessage('El estado debe ser un valor booleano.')
], PagosController.updateMp);

module.exports = router;




