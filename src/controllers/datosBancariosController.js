const datosBancariosService = require("../services/datosBancariosService");

class DatosBancariosController {
  async create(req, res) {
    try {
      const { banco } = req.body;

      if (!banco.password) {
        return res.status(400).json({
          success: false,
          message: "La contraseña es obligatoria",
        });
      }

      const datos = await datosBancariosService.create({ banco });

      return res.status(201).json({
        message: "Datos creados exitosamente",
        data: {
          id: datos.id,
          cuit: datos.cuit,
          alias: datos.alias,
          cbu: datos.cbu,
          apellido: datos.apellido,
          nombre: datos.nombre,
        },
      });
    } catch (error) {
      return res.status(500).json({
        error: error.message,
      });
    }
  }

  async get(req, res, next) {
    try {
      const datos = await datosBancariosService.get();
      res.status(200).json({
        success: true,
        data: {
          id: datos.id,
          cuit: datos.cuit,
          alias: datos.alias,
          cbu: datos.cbu,
          apellido: datos.apellido,
          nombre: datos.nombre,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async access(req, res) {
    const { password } = req.body;
    try {
      const datos = await datosBancariosService.validateAccess(password);
      res.status(200).json({
        success: true,
        message: "Acceso autorizado",
        data: {
          id: datos.id,
          cuit: datos.cuit,
          alias: datos.alias,
          cbu: datos.cbu,
          apellido: datos.apellido,
          nombre: datos.nombre,
        },
      });
    } catch (error) {
      res.status(403).json({
        success: false,
        message: error.message,
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { cuit, alias, nombre, apellido, cbu } = req.body;

      console.log({ cuit, alias, nombre, apellido, cbu });

      const datos = await datosBancariosService.update(id, { cuit, alias, nombre, apellido, cbu });
      res.status(200).json({
        success: true,
        message: "Datos bancarios actualizados",
        data: {
          id: datos.id,
          cuit: datos.cuit,
          alias: datos.alias,
          cbu: datos.cbu,
          apellido: datos.apellido,
          nombre: datos.nombre,
        },
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
