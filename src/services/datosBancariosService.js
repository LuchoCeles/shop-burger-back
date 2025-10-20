const bcrypt = require("bcrypt");
const { DatosBancarios, sequelize, Admin } = require("../models");

class DatosBancariosService {
  async create(datosBancarios) {
    const transaction = await sequelize.transaction();
    try {
      const { banco } = datosBancarios;

      if (!banco.password) throw new Error("La contraseña es obligatoria");

      const admins = await Admin.findAll({ attributes: ["password"] });
      for (const admin of admins) {
        const match = await bcrypt.compare(banco.password, admin.password);
        if (match) {
          throw new Error("La contraseña no puede ser igual a la del Admin");
        }
      }

      const hashedPassword = await bcrypt.hash(banco.password, 12);

      const b = await DatosBancarios.create(
        {
          cuit: banco.cuit,
          alias: banco.alias,
          cbu: banco.cbu,
          apellido: banco.apellido,
          nombre: banco.nombre,
          password: hashedPassword,
        },
        { transaction }
      );

      await transaction.commit();
      return b;
    } catch (error) {
      if (!transaction.finished) {
        await transaction.rollback();
      }
      throw new Error(`Error al cargar los datos: ${error.message}`);
    }
  }

  async validateAccess(password) {
    try {
      const datos = await DatosBancarios.findOne({
        order: [["id", "DESC"]],
      });

      if (!datos.password) throw new Error(`Contraseña invalida`);

      const match = await bcrypt.compare(password, datos.password);

      if (!match) throw new Error(`Contraseña incorrecta`);

      return datos;
    } catch (error) {
      throw new Error(`Error al validar acceso: ${error.message}`);
    }
  }

  async get() {
    try {
      const datosbancarios = await DatosBancarios.findAll({
        attributes: ["id", "cuit", "alias", "cbu", "apellido", "nombre"],
      });
      return datosbancarios;
    } catch (error) {
      throw new Error(`Error al obtener los datos bancarios${error.message}`);
    }
  }

  async updatePassword(id, password, newPassword) {
    const transaction = await sequelize.transaction();

    try {
      const datos = await DatosBancarios.findByPk(id);
      if (!datos) throw new Error(`Usuario no encontrado`);

      const match = await bcrypt.compare(password, datos.password);
      if (!match) throw new Error(`Contraseña incorrecta`);

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await datos.update({ password: hashedPassword });

      await transaction.commit();

      return "Contraseña actualizada";
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al actualizar la contraseña: ${error.message}`);
    }
  }

  async update(id, datosActualizados) {
    const transaction = await sequelize.transaction();
    try {
      const datos = await DatosBancarios.findByPk(id);
      if (!datos) throw new Error(`Id no encontrada`);

      console.log(datosActualizados);
      await datos.update(datosActualizados, { transaction });
      await transaction.commit();
      return datos;
    } catch (error) {
      if (!transaction.finished) await transaction.rollback();
      throw new Error(`Error al actualizar datos bancarios: ${error.message}`);
    }
  }
}

module.exports = new DatosBancariosService();
