
const express = require('express');
const router = express.Router();
const DiasController = require('../controllers/diasController');
const validateRequest = require('../middlewares/validateRequest');
const authAdmin = require('../middlewares/authAdmin'); 
const { body } = require('express-validator');


router.get('/', DiasController.getAll);

router.post('/',authAdmin,validateRequest,[
  body("idDia").notEmpty().withMessage("El id del día es obligatorio"),
  body("rangos").isArray({ min: 1 }).withMessage("Debe proporcionar al menos un rango de horario"),
], DiasController.create);


router.patch('/:id',authAdmin,validateRequest,[
  body("rangos").isArray({ min: 1 }).withMessage("Debe proporcionar al menos un rango de horario"),
], DiasController.update);

router.delete('/:id',authAdmin,validateRequest,[
body("horarios").isArray({ min: 1 }).withMessage("Debe proporcionar al menos un rango de horario"),
],DiasController.delete);


module.exports = router;