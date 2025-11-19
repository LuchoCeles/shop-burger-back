const express = require('express');
const router = express.Router();
const guarnicionXProductosController = require('../controllers/guarnicionXProductosController');
const authAdmin = require('../middlewares/authAdmin'); 
const validateRequest = require('../middlewares/validateRequest'); 


router.post('/', authAdmin, [], validateRequest, guarnicionXProductosController.create);


module.exports = router;