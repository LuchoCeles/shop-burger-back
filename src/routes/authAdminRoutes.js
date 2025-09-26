const express = require('express');
const { body } = require('express-validator');
const authAdminController = require('../controllers/authAdminController');
const validateRequest = require('../middlewares/validateRequest');

const router = express.Router();

router.post('/login', [
  body('nombre').notEmpty().trim(),
  body('password').isLength({ min: 6 })
], validateRequest, authAdminController.login);

router.post('/register', [
  body('nombre').notEmpty().trim(),
  body('password').isLength({ min: 6 })
], validateRequest, authAdminController.register);

module.exports = router;