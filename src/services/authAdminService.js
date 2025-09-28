const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Admin } = require('../models');

class AuthAdminService {
  async login(nombre, password) {
    const admin = await Admin.findOne({ where: { nombre } });

    if (!admin) {
      throw new Error('Credenciales inválidas');
    }

    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      throw new Error('Credenciales inválidas');
    }

    const token = jwt.sign(
      { id: admin.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return {
      token,
      admin: {
        id: admin.id,
        nombre: admin.nombre
      }
    };
  }

  async register(nombre, password) {

    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await Admin.create({
      nombre,
      password: hashedPassword
    });

    const token = jwt.sign(
      { id: admin.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return {
      token,
      admin: {
        id: admin.id,
        nombre: admin.nombre
      }
    };
  }
}

module.exports = new AuthAdminService();