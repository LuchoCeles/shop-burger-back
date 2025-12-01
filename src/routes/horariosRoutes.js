const express = require('express');
const HorariosController = require('../controllers/horariosController');
const authAdmin = require('../middlewares/authAdmin');
const validateRequest = require('../middlewares/validateRequest');

const router = express.Router();

router.get('/', HorariosController.getAll);

router.post('/', authAdmin,validateRequest, [
],  HorariosController.create);

router.patch('/:id', authAdmin,validateRequest, [
],  HorariosController.updateHorario);

router.delete('/:id', validateRequest,authAdmin, HorariosController.deleteHorario);


module.exports = router;