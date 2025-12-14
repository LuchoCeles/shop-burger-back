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
   * Recibe la configuración principal, arrays de sub-recursos y opcionalmente un archivo.
   * RUTA: PUT /api/configuracion
   */
  async updateConfiguracion(req, res) {
    try {
      const {
        metaTitulo,
        nombreLocal,
        url_logo, // Se mantiene en body, pero solo se usa si NO hay file
        favicon, // Se mantiene en body, pero solo se usa si NO hay file
        slogan,
        whatsapp,
        email,
        copyright,
        modoMantenimiento,
        estado,
        fileType, // Campo nuevo para indicar si es 'url_logo' o 'favicon'
        // Sub-recursos que vienen como strings JSON o arrays
        otrasPaginas: otrasPaginasJson,
        direcciones: direccionesJson,
        telefonos: telefonosJson,
      } = req.body;

      const fileBuffer = req.file ? req.file.buffer : null;
      let urlActualizacion = {}; // Objeto para guardar la nueva URL si se sube un archivo

      // --- 1. Subida y Gestión de Archivos ---
      if (fileBuffer) {
        // La validación de fileType ('url_logo' o 'favicon') debe hacerse en el middleware/validator
        if (!fileType || (fileType !== 'url_logo' && fileType !== 'favicon')) {
          return res.status(400).json({
            success: false,
            message: "El archivo subido debe especificar si es 'url_logo' o 'favicon' en el campo 'fileType'."
          });
        }

        // El servicio se encarga de subir la imagen, eliminar la antigua, y devolver la nueva URL
        const newUrl = await configuracionService.updateImage(fileBuffer, fileType);
        
        // Asignar la nueva URL al campo correspondiente
        urlActualizacion[fileType] = newUrl;
      }

      // 2. Datos para la tabla principal (ConfiguracionPagina)
      // Usamos el body (para campos de texto) y sobrescribimos con la URL subida (si existe)
      const dataPrincipal = {
        metaTitulo,
        nombreLocal,
        slogan,
        whatsapp,
        email,
        copyright,
        modoMantenimiento: modoMantenimiento !== undefined ? (modoMantenimiento === "true" || modoMantenimiento === true) : undefined,
        estado: estado !== undefined ? (estado === "true" || estado === true) : undefined,
        
        // Se incluyen los campos originales por si se están actualizando a NULL o a una URL manual.
        // Pero si se subió un archivo, `urlActualizacion` lo sobrescribe.
        url_logo,
        favicon,

        // Sobrescribir los campos con la URL de Cloudinary si hubo subida
        ...urlActualizacion, 
      };

      // Limpieza final de undefined/nulls
      Object.keys(dataPrincipal).forEach(
        (key) => (dataPrincipal[key] === undefined || dataPrincipal[key] === null) && delete dataPrincipal[key]
      );
      
      // 3. Parsear arrays de sub-recursos
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

      // 4. Llamar al servicio para actualizar la configuración principal (con la nueva URL si aplica)
      await configuracionService.updateConfiguracionPrincipal(dataPrincipal);

      // 5. Llamar a los servicios para actualizar los sub-recursos
      await configuracionService.updateOtrasPaginas(otrasPaginas);
      await configuracionService.updateDirecciones(direcciones);
      await configuracionService.updateTelefonos(telefonos);

      // 6. Devolver la configuración completa actualizada
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