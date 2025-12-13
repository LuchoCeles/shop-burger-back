const configuracionService = require("../services/ConfiguracionService");

class ConfiguracionController {
  /**
   * Obtiene toda la configuración de la página (principal, enlaces, direcciones, teléfonos)
   * Asume que el ID de la configuración siempre es 1.
   * RUTA: GET /api/configuracion
   */
  async getConfiguracion(req, res) {
    try {
      const configuracion = await configuracionService.getConfiguracionCompleta();

      res.status(200).json({
        success: true,
        data: configuracion,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Actualiza la configuración de la página.
   * Recibe la configuración principal y arrays separados para sub-recursos.
   * RUTA: PUT /api/configuracion
   */
  async updateConfiguracion(req, res) {
    try {
      const {
        metaTitulo,
        nombreLocal,
        url_logo,
        favicon,
        slogan,
        whatsapp,
        email,
        copyright,
        modoMantenimiento,
        estado,
        // Sub-recursos que vienen como strings JSON o arrays
        otrasPaginas: otrasPaginasJson,
        direcciones: direccionesJson,
        telefonos: telefonosJson,
      } = req.body;

      // 1. Datos para la tabla principal (ConfiguracionPagina)
      const dataPrincipal = {
        metaTitulo,
        nombreLocal,
        url_logo,
        favicon,
        slogan,
        whatsapp,
        email,
        copyright,
        modoMantenimiento: modoMantenimiento !== undefined ? (modoMantenimiento === "true" || modoMantenimiento === true) : undefined,
        estado: estado !== undefined ? (estado === "true" || estado === true) : undefined,
      };

      // Eliminar campos undefined para evitar sobrescribir con null si no se enviaron
      Object.keys(dataPrincipal).forEach(
        (key) => dataPrincipal[key] === undefined && delete dataPrincipal[key]
      );

      // 2. Parsear arrays de sub-recursos
      let otrasPaginas = [];
      let direcciones = [];
      let telefonos = [];

      try {
        if (otrasPaginasJson) otrasPaginas = JSON.parse(otrasPaginasJson);
        if (direccionesJson) direcciones = JSON.parse(direccionesJson);
        if (telefonosJson) telefonos = JSON.parse(telefonosJson);
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: "Error de formato: Los arrays 'otrasPaginas', 'direcciones' o 'telefonos' deben ser JSON válidos.",
        });
      }

      // 3. Llamar al servicio para actualizar la configuración principal
      await configuracionService.updateConfiguracionPrincipal(dataPrincipal);

      // 4. Llamar a los servicios para actualizar los sub-recursos
      // (Asumiendo que los métodos del service manejan la lógica de Destruir/Crear)
      await configuracionService.updateOtrasPaginas(otrasPaginas);
      await configuracionService.updateDirecciones(direcciones);
      await configuracionService.updateTelefonos(telefonos);

      // 5. Devolver la configuración completa actualizada
      const configuracionActualizada = await configuracionService.getConfiguracionCompleta();

      return res.status(200).json({
        success: true,
        message: "Configuración actualizada exitosamente.",
        data: configuracionActualizada,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: `Error al actualizar la configuración: ${error.message}`,
      });
    }
  }
}

module.exports = new ConfiguracionController();