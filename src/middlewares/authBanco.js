const { sequelize } = require("../config/db");
const bcrypt = require("bcrypt");

// middleware banco cuit + password
const authBanco = async (req, res, next) => {
  try {
    const { cuit, password } = req.body;

    const datos = await sequelize.query("CALL loginBanco(:cuit);", {
      replacements: { cuit }
    });

    if (!datos[0]) throw new Error(`Usuario no encontrado`);
    
    const match = await bcrypt.compare(password, datos[0].password);
    
    if (!match) throw new Error(`Contraseña incorrecta`);
    
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: `Error al autenticar los Datos: ${error.message}`
    });
  }
};

module.exports = authBanco;

