const express = require('express');
const { body } = require('express-validator');
const adicionalesController = require('../controllers/adicionalesController');
const validateRequest = require('../middlewares/validateRequest');
const authAdmin = require('../middlewares/authAdmin');

const router = express.Router();

router.get('/', adicionalesController.getAll);

router.post('/create', authAdmin, [
  body('nombre').notEmpty(),
  body('precio').notEmpty(),
  body('stock').notEmpty(),
  body('maxCantidad').notEmpty(),
], validateRequest, adicionalesController.create);

router.patch('/:id', authAdmin, [
  body('nombre').notEmpty(),
  body('precio').notEmpty(),
  body('stock').notEmpty(),
  body('maxCantidad').notEmpty(),
], validateRequest, adicionalesController.update);

router.delete('/:id', authAdmin, adicionalesController.delete);

router.patch('/:id/state', authAdmin, adicionalesController.changeState);

module.exports = router;