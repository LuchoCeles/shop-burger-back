const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sequelize } = require('../config/db');

class AuthAdminService {
  async login(nombre, password) {
    const [admin] = await sequelize.query("CALL login(:nombre);", {
      replacements: { nombre }
    });

    if (!admin) {
      throw new Error('Credenciales inválidas');
    }

    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      throw new Error('Credenciales inválidas');
    }

    const token = jwt.sign(
      {
        id: admin.id,
        nombre: admin.nombre
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return {
      token
    };
  }

  async register(nombre, password) {

    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await sequelize.query("CALL createAdmin(:nombre, :password);", {
      replacements: { nombre, password: hashedPassword }
    });

    const token = jwt.sign(
      {
        id: admin.id,
        nombre: admin.nombre
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return {
      token
    };
  }
}

module.exports = new AuthAdminService();