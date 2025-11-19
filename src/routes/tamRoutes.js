const express = require('express');
const TamController = require('../controllers/tamController');
const authAdmin = require('../middlewares/authAdmin');
const validateRequest = require('../middlewares/validateRequest');

const router = express.Router();

router.get('/', TamController.get);

router.post('/', authAdmin, [
], validateRequest, TamController.create);

router.patch('/:id/estado', authAdmin, TamController.update);


module.exports = router;