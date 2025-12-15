const configuracionService = require("../services/ConfiguracionService");

class ConfiguracionController {

  async getConfiguracion(req, res) {
    // Get simple devuelve todo
    try {
      const configuracion = await configuracionService.getConfiguracionCompleta();
      res.status(200).json({ success: true, data: configuracion });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateConfiguracion(req, res) {
    try {
      // 1. Extraer campos de texto
      const {
        metaTitulo, nombreLocal, slogan, whatsapp, email, copyright,
        modoMantenimiento, estado,
        url_logo, favicon, // URLs manuales si no se sube archivo
        otrasPaginas: otrasPaginasJson,
        direcciones: direccionesJson,
        telefonos: telefonosJson,
      } = req.body;

      // 2. Manejo de Archivos (req.files con PLURAL porque usamos upload.fields)
      const files = req.files || {};
      let urlActualizacion = {}; 

      // --- LOGO ---
      if (files['logoFile'] && files['logoFile'].length > 0) {
        const logoBuffer = files['logoFile'][0].buffer;
        // Llamamos al servicio 'url_logo'
        const newLogoUrl = await configuracionService.updateImage(logoBuffer, 'url_logo');
        urlActualizacion['url_logo'] = newLogoUrl;
      }

      // --- FAVICON ---
      if (files['faviconFile'] && files['faviconFile'].length > 0) {
        const faviconBuffer = files['faviconFile'][0].buffer;
        // Llamamos al servicio especificando que es 'favicon'
        const newFaviconUrl = await configuracionService.updateImage(faviconBuffer, 'favicon');
        urlActualizacion['favicon'] = newFaviconUrl;
      }

      // 3. Preparar objeto principal
      const dataPrincipal = {
        metaTitulo,
        nombreLocal,
        slogan,
        whatsapp,
        email,
        copyright,
        modoMantenimiento: modoMantenimiento !== undefined ? (modoMantenimiento === "true" || modoMantenimiento === true) : undefined,
        estado: estado !== undefined ? (estado === "true" || estado === true) : undefined,
        
        // Asignamos lo que venga del body (texto)
        url_logo, 
        favicon,

        // Sobrescribimos con las URLs nuevas si hubo subida de archivos
        ...urlActualizacion, 
      };

      // Limpieza de undefined
      Object.keys(dataPrincipal).forEach(
        (key) => (dataPrincipal[key] === undefined || dataPrincipal[key] === null) && delete dataPrincipal[key]
      );

      // 4. Parseo de Arrays (JSON)
      let otrasPaginas = [], direcciones = [], telefonos = [];
      try {
        if (otrasPaginasJson) otrasPaginas = JSON.parse(otrasPaginasJson);
        if (direccionesJson) direcciones = JSON.parse(direccionesJson);
        if (telefonosJson) telefonos = JSON.parse(telefonosJson);
      } catch (e) {
        return res.status(400).json({ success: false, message: "Error de formato JSON en arrays." });
      }

      // 5. Actualizaciones en BDD
      await configuracionService.updateConfiguracionPrincipal(dataPrincipal);
      await configuracionService.updateOtrasPaginas(otrasPaginas);
      await configuracionService.updateDirecciones(direcciones);
      await configuracionService.updateTelefonos(telefonos);

      // 6. Respuesta final
      const configuracionActualizada = await configuracionService.getConfiguracionCompleta();

      return res.status(200).json({
        success: true,
        message: "Configuración actualizada exitosamente.",
        data: configuracionActualizada,
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: `Error al actualizar la configuración: ${error.message}`,
      });
    }
  }
}

module.exports = new ConfiguracionController();