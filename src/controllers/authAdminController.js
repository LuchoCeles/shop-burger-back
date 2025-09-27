const authAdminService = require('../services/authAdminService');

class AuthAdminController {
  async login(req, res, next) {
    try {
      const { nombre, password } = req.body;
      const result = await authAdminService.login(nombre, password);

      res.json({
        success: true,
        message: 'Login exitoso',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async register(req, res, next) {
    try {
      const { nombre, password } = req.body;
      const result = await authAdminService.register(nombre, password);

      res.status(201).json({
        success: true,
        message: 'Administrador registrado exitosamente',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthAdminController();