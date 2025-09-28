const jwt = require('jsonwebtoken');
const { Admin } = require('../models');

const authAdmin = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticación requerido'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findByPk(decoded.id);
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Administrador no válido'
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

module.exports = authAdmin;