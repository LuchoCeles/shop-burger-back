const express = require('express');
const router = express.Router();
const guarnicionesController = require('../controllers/guarnicionesController');
const authAdmin = require('../middlewares/authAdmin'); 
const validateRequest = require('../middlewares/validateRequest'); 
const { body } = require('express-validator');


router.get('/', guarnicionesController.getAll);


router.post('/', authAdmin, [
  body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
  body('stock').notEmpty().isInt({ min: 0 }).withMessage('El stock debe ser un número entero mayor o igual a 0')
], validateRequest, guarnicionesController.create);


router.patch('/:id', authAdmin, [], validateRequest, guarnicionesController.update);


router.patch('/:id/estado', authAdmin, guarnicionesController.updateEstado);


module.exports = router;