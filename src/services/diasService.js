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
  try {

    // 1. Eliminar relaciones viejas del día
    await HorariosXDias.destroy({
      where: { idDia: id },
    });

    // 2. Actualizar cada horario por ID (NO bulkCreate)
    for (const rango of rangos) {
      await Horarios.update(
        {
          horarioApertura: rango.inicio,
          horarioCierre: rango.fin,
          estado: rango.estado
        },
        {
          where: { id: rango.id }
        }
      );
    }

    // 3. Crear nuevas relaciones usando los mismos IDs
    const relaciones = rangos.map(r => ({
      idHorario: r.id,
      idDia: id,
    }));

    await HorariosXDias.bulkCreate(relaciones);

    // 4. Devolver resultado final
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
