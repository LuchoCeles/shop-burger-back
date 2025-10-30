const { sequelize } = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

// middleware banco cuit + password
const authBanco = async (req, res, next) => {
  try {
    const bancoToken = req.header('Authorization-Second')?.replace('Bearer ', '');

    if (!bancoToken) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticación bancario requerido'
      });
    }

    const decoded = jwt.verify(bancoToken, process.env.JWT_SECRET);

    const hora = Math.floor(Date.now() / 1000);
    if (decoded.exp < hora) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticación bancario vencido'
      });
    }


    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: `Error al autenticar los Datos: ${error.message}`
    });
  }
};

module.exports = authBanco;

