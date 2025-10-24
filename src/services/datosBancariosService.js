const bcrypt = require("bcrypt");
const { sequelize } = require("../config/db");
const { Admin } = require("../models");


class DatosBancariosService {
  async create(adminId, datosBancarios) {
    try {
      const adminData = await Admin.findByPk(adminId);
      const hashedPassword = await bcrypt.hash(datosBancarios.password, 12);
      const match = await bcrypt.compare(datosBancarios.password, adminData.password);
      if (match) {
        throw new Error('La Contraseña no puede ser igual a la de su Cuenta');
      }
      
      const datos = await sequelize.query("CALL createBanco(:cuit, :alias, :cbu, :apellido, :nombre, :password);",
        {
          replacements: {
            cuit: datosBancarios.cuit,
            alias: datosBancarios.alias,
            cbu: datosBancarios.cbu,
            apellido: datosBancarios.apellido,
            nombre: datosBancarios.nombre,
            password: hashedPassword
          }
        });

      return datos[0];
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