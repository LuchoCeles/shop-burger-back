const { DatosBancarios,sequelize } = require("../models");


class DatosBancariosService {
  async create(datosBancarios) {
    const transaction = await sequelize.transaction();
    try {
      const { banco } = datosBancarios;

      const b = await DatosBancarios.create(
        {
          cuit: banco.cuit,
          alias: banco.alias,
          cbu: banco.cbu,
          apellido: banco.apellido,
          nombre: banco.nombre,
        },
        { transaction }
      );
      await transaction.commit();
      return b;
    } catch (error) {
      if (!transaction.finished) {
        await transaction.rollback();
      }
      throw new Error (`Error al cargar los datos: ${error.message}`);
    }
  }

  async get (){
    try {
        const datosbancarios = await DatosBancarios.findAll({
            atribute: ["id","cuit","alias","cbu","apellido","nombre"],
            order : [["id","DESC"]],
        });
        return datosbancarios
    } catch (error) {
        throw new Error(`Error al obtener los datos bancarios${error.message}`);
    }
  }
}

module.exports = new DatosBancariosService();
