const { Dias, Horarios, HorariosXDias } = require("../models");
const { sequelize } = require("../config/db");
const { where } = require("sequelize");

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

  async update(id, rangos) {
    const t = await sequelize.transaction();
    try {
      // Recorremos todos los rangos recibidos
      for (const rango of rangos) {
        // SI NO TIENE ID → SE CREA

        if (!rango.idHorario) {
          const nuevoHorario = await Horarios.create(
            {
              horarioApertura: rango.horarioApertura,
              horarioCierre: rango.horarioCierre,
              estado: rango.estado,
            },
            { transaction: t }
          );

          await HorariosXDias.create(
            {
              idHorarios: nuevoHorario.id,
              idDia: id,
            },
            { transaction: t }
          );
        } else {
          // SI TIENE ID → SE ACTUALIZA
          await Horarios.update(
            {
              horarioApertura: rango.horarioApertura,
              horarioCierre: rango.horarioCierre,
              estado: rango.estado,
            },
            {
              where: { id: rango.idHorario },
              transaction: t,
            }
          );
        }
      }

      await t.commit();

      // Retornamos el día actualizado con sus horarios
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

  async delete(id, horarios) {
    const transaction  = await sequelize.transaction();
    try {
      await HorariosXDias.delete({
        where: {
          idDia: id,
          idHorario: horarios.idHorario,
        },
      },{transaction});

      await Horarios.delete(horarios.idHorario);
      await transaction.commit();
    } catch (error) {
      throw new Error(`Error al eliminar Horario ${error.message}`);
    }
  }
}

module.exports = new DiasService();
