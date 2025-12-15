const { ConfiguracionPagina, OtrasPaginas, Direcciones, Telefonos } = require("../models");
const { sequelize } = require("../config/db");
const cloudinaryService = require("./cloudinaryService");

class ConfiguracionService {


  async getConfiguracionCompleta() {
    const configuracion = await ConfiguracionPagina.findByPk(1, {
        include: [
          { model: OtrasPaginas, as: "otrasPaginas" },
          { model: Direcciones, as: "direcciones" },
          { model: Telefonos, as: "telefonos" },
        ],
    });
    if (!configuracion) throw new Error("Registro de Configuración no encontrado.");
    return configuracion;
  }

  async updateConfiguracionPrincipal(data) {
    const [filas] = await ConfiguracionPagina.update(data, { where: { id: 1 } });
    return filas; 
  }

  /**
   * Sube imagen y devuelve la URL. Borra la anterior si existe en ese campo.
   * @param {Buffer} imageBuffer 
   * @param {string} dbField - 'url_logo' o 'favicon'
   */
  async updateImage(imageBuffer, dbField) {
    try {
      // 1. Buscamos la configuración actual para ver si hay imagen vieja
      const configuracion = await ConfiguracionPagina.findByPk(1);
      
      if (configuracion) {
        // Obtenemos la URL actual
        const antiguaUrl = configuracion[dbField];

        // Si hay una URL vieja, la borramos de Cloudinary para que no se llene el almacenamiento
        if (antiguaUrl) {
           const publicId = cloudinaryService.getPublicIdFromUrl(antiguaUrl);
           if (publicId) {
             await cloudinaryService.deleteImage(publicId);
           }
        }
      }

      // 2. Subimos la nueva imagen
      const uploadResult = await cloudinaryService.uploadImage(imageBuffer);
      
      // 3. Retornamos solo la URL (el controlador la guarda en la BDD junto con el resto de datos)
      return uploadResult.secure_url;

    } catch (error) {
      throw new Error(`Error al procesar imagen (${dbField}): ${error.message}`);
    }
  }

  // --- Métodos para sub-recursos ---
  
  async updateOtrasPaginas(dataArray) {
     const transaction = await sequelize.transaction();
     try {
       await OtrasPaginas.destroy({ where: { idConfiguracionPagina: 1 }, transaction });
       if(dataArray.length > 0) {
          const dataConId = dataArray.map(d => ({ ...d, idConfiguracionPagina: 1 }));
          await OtrasPaginas.bulkCreate(dataConId, { transaction });
       }
       await transaction.commit();
     } catch (e) {
       await transaction.rollback();
       throw e;
     }
  }

  async updateDirecciones(dataArray) {
     const transaction = await sequelize.transaction();
     try {
       await Direcciones.destroy({ where: { idConfiguracionPagina: 1 }, transaction });
       if(dataArray.length > 0) {
          const dataConId = dataArray.map(d => ({ ...d, idConfiguracionPagina: 1 }));
          await Direcciones.bulkCreate(dataConId, { transaction });
       }
       await transaction.commit();
     } catch (e) { await transaction.rollback(); throw e; }
  }

  async updateTelefonos(dataArray) {
     const transaction = await sequelize.transaction();
     try {
       await Telefonos.destroy({ where: { idConfiguracionPagina: 1 }, transaction });
       if(dataArray.length > 0) {
          const dataConId = dataArray.map(d => ({ ...d, idConfiguracionPagina: 1 }));
          await Telefonos.bulkCreate(dataConId, { transaction });
       }
       await transaction.commit();
     } catch (e) { await transaction.rollback(); throw e; }
  }
}

module.exports = new ConfiguracionService();