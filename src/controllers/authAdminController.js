const authAdminService = require('../services/authAdminService');

class AuthAdminController {
  async login(req, res) {
    try {
      const { nombre, password } = req.body;
      const result = await authAdminService.login(nombre, password);

      return res.status(201).json({
        success: true,
        message: 'Login exitoso',
        data: result
      });
    } catch (error) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }
  }

  async register(req, res) {
    try {
      const { nombre, password } = req.body;
      const result = await authAdminService.register(nombre, password);

      return res.status(201).json({
        success: true,
        message: 'Administrador registrado exitosamente',
        data: result
      });
    } catch (error) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new AuthAdminController();