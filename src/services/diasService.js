const { Dias, Horarios, HorariosXDias } = require("../models");
const { sequelize } = require("../config/db")

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
  try {
    // 1. Eliminar relaciones anteriores
    await HorariosXDias.destroy({
      where: { idDia: id },
    });

    // 2. Crear horarios nuevos
    await Horarios.bulkCreate(rangos); // SIN returning

    // 3. Buscar los horarios recién creados (según rangos enviados)
    const horarios = await Horarios.findAll({
      where: {
        horarioApertura: rangos.map(r => r.horarioApertura),
        horarioCierre: rangos.map(r => r.horarioCierre),
      },
      order: [["id", "DESC"]], // por si ya había otros horarios iguales
      limit: rangos.length,
    });

    // 4. Crear relaciones nuevas
    const relaciones = horarios.map(h => ({
      idHorarios: h.id,
      idDia: id,
    }));

    await HorariosXDias.bulkCreate(relaciones);

    // 5. Obtener el día con sus horarios actualizados
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
    throw new Error(`Error al actualizar los horarios del día: ${error.message}`);
  }
}

}

module.exports = new DiasService();
