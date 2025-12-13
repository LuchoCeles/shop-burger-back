const { Dias, Horarios, HorariosXDias } = require("../models");
const { Op } = require("sequelize");
const { sequelize } = require("../config/db");
const { clearDiasCache } = require("../middlewares/validateHour");

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

  async crearHorario(idDia, rango, transaction) {
    const nuevoHorario = await Horarios.create(
      {
        horarioApertura: rango.horarioApertura,
        horarioCierre: rango.horarioCierre,
        estado: rango.estado,
      },
      { transaction }
    );

    await HorariosXDias.create(
      {
        idHorarios: nuevoHorario.id,
        idDia,
      },
      { transaction }
    );
  }

  async actualizarHorario(rango, transaction) {
    await Horarios.update(
      {
        horarioApertura: rango.horarioApertura,
        horarioCierre: rango.horarioCierre,
        estado: rango.estado,
      },
      {
        where: { id: rango.idHorario },
        transaction,
      }
    );
    clearDiasCache();
  }

  async obtenerDiaConHorarios(idDia) {
    return await Dias.findByPk(idDia, {
      attributes: ["id", "nombre", "estado"],
      include: [
        {
          association: "horarios",
          attributes: ["id", "horarioApertura", "horarioCierre", "estado"],
        },
      ],
    });
  }

  async rangoExisteEnDia(idDia, rango) {
  // Construir el where correctamente
  const whereCondition = {
    horarioApertura: rango.horarioApertura,
    horarioCierre: rango.horarioCierre,
  };

  // Si es update, ignorar su propio ID
  if (rango.idHorario) {
    whereCondition.id = { [Op.ne]: rango.idHorario };
  }

  return await Horarios.findOne({
    where: whereCondition,
    include: [
      {
        model: HorariosXDias,
        as: "horariosxdias",
        where: {
          idDia,
        },
        required:true
      },
    ],
  });
}

  async update(idDia, rangos) {
    const transaction = await sequelize.transaction();
    try {
      for (const rango of rangos) {
        // Validación de duplicados
        const existe = await this.rangoExisteEnDia(idDia, rango, transaction);
        if (existe)
          throw new Error(
            `El rango ${rango.horarioApertura} - ${rango.horarioCierre} ya existe en este día`
          );

        if (!rango.idHorario) {
          await this.crearHorario(idDia, rango, transaction);
        } else {
          await this.actualizarHorario(rango, transaction);
        }
      }

      await transaction.commit();
      return this.obtenerDiaConHorarios(idDia);
    } catch (error) {
      await transaction.rollback();
      throw new Error(
        `Error al actualizar los horarios del día: ${error.message}`
      );
    }
  }
}

module.exports = new DiasService();
