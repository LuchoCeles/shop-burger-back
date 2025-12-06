
const express = require('express');
const router = express.Router();
const DiasController = require('../controllers/diasController');

router.get('/', DiasController.getAll);

module.exports = router;