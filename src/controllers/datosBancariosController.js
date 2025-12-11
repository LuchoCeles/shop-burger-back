const datosBancariosService = require("../services/datosBancariosService");
const jwt = require("jsonwebtoken");

class DatosBancariosController {
  async create(req, res) {
    try {
      const { id, banco } = req.body;

      const datos = await datosBancariosService.create(id, { banco });

      return res.status(201).json({
        success: true,
        message: "Datos creados exitosamente",
        data: {
          id: datos.id,
          cuit: datos.cuit,
          alias: datos.alias,
          cbu: datos.cbu,
          apellido: datos.apellido,
          nombre: datos.nombre
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async get(req, res) {
    try {
      const datos = await datosBancariosService.get();
      res.status(200).json({
        success: true,
        data: datos,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getPublic(req, res) {
    try {
      const datos = await datosBancariosService.get();
      res.status(200).json({
        success: true,
        message: "Acceso autorizado",
        data: {
          id: datos.id,
          cuit: datos.cuit,
          alias: datos.alias,
          cbu: datos.cbu,
          apellido: datos.apellido,
          nombre: datos.nombre
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async login(req, res) {
    try {
      const { cuit, password } = req.body;
      const datos = await datosBancariosService.login(cuit, password);

      const token = jwt.sign(
        {
          id: datos.id
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_BANK_EXPIRES_IN }
      );

      res.status(200).json({
        success: true,
        message: "Acceso autorizado",
        token,
        data: {
          id: datos.id,
          cuit: datos.cuit,
          alias: datos.alias,
          cbu: datos.cbu,
          apellido: datos.apellido,
          nombre: datos.nombre,
          mpEstado: datos.mpEstado,
          mercadoPagoAccessToken: datos.mercadoPagoAccessToken
        },
      });
    } catch (error) {
      res.status(403).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updatePassword(req, res) {
    try {
      const { id } = req.params;
      const { password, newPassword } = req.body;

      const rsp = await datosBancariosService.updatePassword(id, password, newPassword);

      if (rsp) res.status(200).json({ success: true, message: "Contraseña actualizada"});
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { banco } = req.body;

      const datos = await datosBancariosService.update(id, banco);
      res.status(200).json({
        success: true,
        message: "Datos bancarios actualizados",
        data: datos,
      });
    } catch (error) {
      res.status(403).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateMPState(req, res) {
    try {
      const { id } = req.params;
      const { mpEstado, mpAccessToken } = req.body;

      const datos = await datosBancariosService.updateMPState(id, mpEstado, mpAccessToken);
      res.status(200).json({
        success: true,
        message: "Estado de Mercado Pago actualizado",
        data: datos,
      });
    } catch (error) {
      res.status(403).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new DatosBancariosController();
