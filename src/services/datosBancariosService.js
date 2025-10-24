const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
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

      const bancoToken = jwt.sign(
        {
          id: datos[0].id,
          cuit: datos[0].cuit,
          alias: datos[0].alias,
          cbu: datos[0].cbu,
          apellido: datos[0].apellido,
          nombre: datos[0].nombre
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_BANK_EXPIRES_IN }
      );

      return bancoToken;
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

      const match = await bcrypt.compare(password, datos.password);
      if (!match) throw new Error(`Contraseña incorrecta`);

      const hashedPassword = await bcrypt.hash(newPassword, 12);

      const datos = await sequelize.query("CALL updatePassworBanco(:id, :password);", {
        replacements: { id, hashedPassword }
      });

      return "Contraseña actualizada";
    } catch (error) {
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
