const {
  ConfiguracionPagina,
  OtrasPaginas,
  Direcciones,
  Telefonos,
} = require("../models"); // Un Servicio que integra los 4 Models
const { sequelize } = require("../config/db"); // Sequelize para transacciones

class ConfiguracionService {
  /**
   * Obtiene la configuración principal de la página con todas sus relaciones anidadas.
   * Asumiendo que solo existe un registro de configuración (ID = 1).
   * @returns {Promise<ConfiguracionPagina>} El objeto de configuración completo.
   */
  async getConfiguracionCompleta() {
    try {
      const configuracion = await ConfiguracionPagina.findByPk(1, {
        include: [
          { model: OtrasPaginas, as: "otrasPaginas" },
          { model: Direcciones, as: "direcciones" },
          { model: Telefonos, as: "telefonos" },
        ],
      });

      if (!configuracion) {
        // inicializar si no existe, o lanzar un error
        throw new Error("Registro de Configuración Principal no encontrado (ID 1).");
      }

      return configuracion;
    } catch (error) {
      throw new Error(`Error al obtener la configuración: ${error.message}`);
    }
  }

  /**
   * Esto actualiza los campos de la tabla principal 'ConfiguracionPagina'.
   * @param {Object} data - Datos a actualizar (ej: metaTitulo, slogan, email, etc.).
   * @returns {Promise<ConfiguracionPagina>} El objeto actualizado.
   */
  async updateConfiguracionPrincipal(data) {
    const transaction = await sequelize.transaction();
    try {
      const [filasAfectadas] = await ConfiguracionPagina.update(data, {
        where: { id: 1 },
        transaction,
      });

      if (filasAfectadas === 0) {
        throw new Error("Configuración principal no encontrada para actualizar.");
      }

      await transaction.commit();
      return this.getConfiguracionCompleta();
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al actualizar la configuración principal: ${error.message}`);
    }
  }

  // --- MÉTODOS PARA GESTIONAR SUB-RECURSOS (UNO A MUCHOS) ---

  /**
   * Actualiza completamente los enlaces de OtrasPaginas (destruye y recrea).
   * Útil para sincronizar un array completo de enlaces desde un formulario.
   * @param {Array<Object>} paginasData - Array de objetos { nombre, url }.
   */
  async updateOtrasPaginas(paginasData) {
    const idConfiguracion = 1; // Siempre apunta a la configuración principal
    const transaction = await sequelize.transaction();
    try {
      // 1. Eliminar todos los enlaces existentes para la configuración
      await OtrasPaginas.destroy({
        where: { idConfiguracionPagina: idConfiguracion },
        transaction,
      });

      // 2. Recrear todos los nuevos enlaces
      if (paginasData && paginasData.length > 0) {
        const nuevosEnlaces = paginasData.map((p) => ({
          ...p,
          idConfiguracionPagina: idConfiguracion,
        }));
        await OtrasPaginas.bulkCreate(nuevosEnlaces, { transaction });
      }

      await transaction.commit();
      return await OtrasPaginas.findAll({ where: { idConfiguracionPagina: idConfiguracion } });
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al actualizar OtrasPaginas: ${error.message}`);
    }
  }

  /**
   * Actualiza completamente las Direcciones (destruye y recrea).
   * @param {Array<Object>} direccionesData - Array de objetos { direccion, estado? }.
   */
  async updateDirecciones(direccionesData) {
    const idConfiguracion = 1;
    const transaction = await sequelize.transaction();
    try {
      // 1. Eliminar todas las direcciones existentes
      await Direcciones.destroy({
        where: { idConfiguracionPagina: idConfiguracion },
        transaction,
      });

      // 2. Recrear todas las nuevas direcciones
      if (direccionesData && direccionesData.length > 0) {
        const nuevasDirecciones = direccionesData.map((d) => ({
          ...d,
          idConfiguracionPagina: idConfiguracion,
        }));
        await Direcciones.bulkCreate(nuevasDirecciones, { transaction });
      }

      await transaction.commit();
      return await Direcciones.findAll({ where: { idConfiguracionPagina: idConfiguracion } });
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al actualizar Direcciones: ${error.message}`);
    }
  }

  /**
   * Actualiza completamente los Telefonos (destruye y recrea).
   * @param {Array<Object>} telefonosData - Array de objetos { telefono, estado? }.
   */
  async updateTelefonos(telefonosData) {
    const idConfiguracion = 1;
    const transaction = await sequelize.transaction();
    try {
      // 1. Eliminar todos los teléfonos existentes
      await Telefonos.destroy({
        where: { idConfiguracionPagina: idConfiguracion },
        transaction,
      });

      // 2. Recrear todos los nuevos teléfonos
      if (telefonosData && telefonosData.length > 0) {
        const nuevosTelefonos = telefonosData.map((t) => ({
          ...t,
          idConfiguracionPagina: idConfiguracion,
        }));
        await Telefonos.bulkCreate(nuevosTelefonos, { transaction });
      }

      await transaction.commit();
      return await Telefonos.findAll({ where: { idConfiguracionPagina: idConfiguracion } });
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al actualizar Telefonos: ${error.message}`);
    }
  }
}

module.exports = new ConfiguracionService();