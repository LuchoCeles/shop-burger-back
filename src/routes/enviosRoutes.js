const express = require('express');
const router = express.Router();
const {envioController} = require('../controllers/envioController');
const authAdmin = require('../middlewares/authAdmin'); 
const validateRequest = require('../middlewares/validateRequest'); 
const { body } = require('express-validator');


router.get('/', envioController.getAll);


router.post('/', authAdmin,validateRequest [
  body('precio').notEmpty().withMessage('El precio de envio es obligatorio')
], envioController.create);


router.patch('/:id', authAdmin, validateRequest,[] , envioController.update);


router.patch('/:id/estado', authAdmin, envioController.updateState);


module.exports = router;