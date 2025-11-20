const express = require('express');
const router = express.Router();
const guarnicionesController = require('../controllers/guarnicionesController');
const authAdmin = require('../middlewares/authAdmin'); 
const validateRequest = require('../middlewares/validateRequest'); 


router.get('/', guarnicionesController.getAll);


router.post('/', authAdmin, [], validateRequest, guarnicionesController.create);


router.patch('/:id', authAdmin, [], validateRequest, guarnicionesController.update);


router.patch('/:id/estado', authAdmin, guarnicionesController.updateEstado);


module.exports = router;