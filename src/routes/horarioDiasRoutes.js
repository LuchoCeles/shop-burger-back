const express = require('express');
const router = express.Router();
const horarioDiasController = require('../controllers/horarioDiasController');
const authAdmin = require('../middlewares/authAdmin'); 
const validateRequest = require('../middlewares/validateRequest');

router.post('/', authAdmin, horarioDiasController.create);

router.get('/',horarioDiasController.getAll);

router.delete('/:id', authAdmin, horarioDiasController.delete);

module.exports = router;