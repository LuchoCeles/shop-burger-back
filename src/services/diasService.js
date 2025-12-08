const { Dias, Horarios, HorariosXDias } = require("../models");
const { sequelize } = require("../config/db");

class DiasService {
  async getAll() {
    try {
      const dias = await Dias.findAll({
        attributes: ["id", "nombre", "estado"],
        include: [
          {
            association: "horarios",
            attributes: ["id", "horarioApertura", "horarioCierre", "estado"],
          },
        ],
        order: [["id", "ASC"]],
      });
      return dias;
    } catch (error) {
      throw new Error(`Error al obtener los días ${error.message}`);
    }
  }

  async create(idDia, rangos) {
    try {
      const horarios = await Horarios.bulkCreate(rangos, { returning: true });

      const relaciones = horarios.map((horario) => ({
        idHorarios: horario.id,
        idDia: idDia,
      }));

      await HorariosXDias.bulkCreate(relaciones);
      const diaConHorarios = await Dias.findByPk(idDia, {
        attributes: ["id", "nombre", "estado"],
        include: [
          {
            association: "horarios",
            attributes: ["id", "horarioApertura", "horarioCierre", "estado"],
          },
        ],
      });

      return diaConHorarios;
    } catch (error) {
      throw new Error(`Error al crear horarios: ${error.message}`);
    }
  }

  
 async update(id, rangos) {
  const t = await sequelize.transaction();
  try {
    await HorariosXDias.destroy({ where: { idDia: id }, transaction: t });

    const horarios = await Horarios.bulkCreate(rangos, {
      transaction: t,
      individualHooks: true
    });

    const relaciones = horarios.map(h => ({
      idHorario: h.id,
      idDia: id,
    }));

    await HorariosXDias.bulkCreate(relaciones, { transaction: t });

    await t.commit();

    return await Dias.findByPk(id, {
      attributes: ["id", "nombre", "estado"],
      include: [
        {
          association: "horarios",
          attributes: ["id", "horarioApertura", "horarioCierre", "estado"],
        },
      ],
    });

  } catch (error) {
    await t.rollback();
    throw new Error(
      `Error al actualizar los horarios del día: ${error.message}`
    );
  }
}



}

module.exports = new DiasService();
