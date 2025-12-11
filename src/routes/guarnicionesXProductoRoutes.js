const express = require('express');
const router = express.Router();
const guarnicionXProductosController = require('../controllers/guarnicionXProductosController');
const authAdmin = require('../middlewares/authAdmin');
const validateRequest = require('../middlewares/validateRequest');
const { body } = require('express-validator');


router.post('/create', authAdmin, validateRequest, [
  body("idProducto").notEmpty().isInt({ min: 1 }),
  body("idGuarnicion").notEmpty().isInt({ min: 1 })
], guarnicionXProductosController.create);

router.delete("/:id", authAdmin, guarnicionXProductosController.delete);

module.exports = router;