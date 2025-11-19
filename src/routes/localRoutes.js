const express = require('express');
const authAdmin = require('../middlewares/authAdmin');
const validateRequest = require('../middlewares/validateRequest');
const router = express.Router();
const localController = require('../controllers/localController');

router.get('/', localController.getAll);

router.post('/', authAdmin, [
], validateRequest, localController.createLocal);

router.patch('/:id/estado',authAdmin,[
], validateRequest,localController.deleteLocal);

router.patch('/:id/direccion',authAdmin,[
], validateRequest,localController.updateDireccion);

module.exports = router;