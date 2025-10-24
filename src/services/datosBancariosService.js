const bcrypt = require("bcrypt");
const { sequelize } = require("../config/db");

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

  async login(cuit, password) {
    try {
      const datos = await sequelize.query("CALL loginBanco(:cuit);", {
        replacements: { cuit }
      });

      if (!datos[0]) throw new Error(`Usuario no encontrado`);

      const match = await bcrypt.compare(password, datos[0].password);

      if (!match) throw new Error(`Contraseña incorrecta`);

      return datos[0];
    } catch (error) {
      throw new Error(`Error al autenticar los Datos: ${error.message}`);
    }
  }


  async get() {
    try {
      const datosbancarios = await sequelize.query("CALL getBanco();");
      return datosbancarios[0];
    } catch (error) {
      throw new Error(`Error al obtener los datos bancarios: ${error.message}`);
    }
  }

  async updatePassword(id, password, newPassword) {
    try {
      if (password === newPassword) {
        throw new Error(`La nueva contraseña no puede ser igual a la anterior`);
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);

      await sequelize.query("CALL updatePassworBanco(:id, :password);", {
        replacements: { id, hashedPassword }
      });

      return;
    } catch (error) {
      throw new Error(`Error al actualizar la contraseña: ${error.message}`);
    }
  }

  async update(id, datosActualizados) {
    try {
      const datos = await sequelize.query("CALL updateDatosBancarios(:id, :cuit, :alias, :cbu, :apellido, :nombre);", {
        replacements: {
          id,
          cuit: datosActualizados.cuit,
          alias: datosActualizados.alias,
          cbu: datosActualizados.cbu,
          apellido: datosActualizados.apellido,
          nombre: datosActualizados.nombre
        }
      });

      return datos[0];
    } catch (error) {
      throw new Error(`Error al actualizar datos bancarios: ${error.message}`);
    }
  }
}

module.exports = new DatosBancariosService();