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
    return await Horarios.findOne({
      where: {
        horarioApertura: rango.horarioApertura,
        horarioCierre: rango.horarioCierre,
      },
      include: [
        {
          model: HorariosXDias,
          as: "horariosxdias",
          where: {
            idDia,
          },
        },
      ],
      // Si es update, aseguramos que ignore su propio ID
      ...(rango.idHorario && {
        where: {
          id: { [Op.ne]: rango.idHorario },
          horarioApertura: rango.horarioApertura,
          horarioCierre: rango.horarioCierre,
        },
      }),
    });
  }

  async update(idDia, rangos) {
    const transaction = await sequelize.transaction();
    try {
      for (const rango of rangos) {
        // Validación de duplicados
        const existe = await this.rangoExisteEnDia(idDia, rango);
        if (existe) throw new Error(`El rango ${rango.horarioApertura} - ${rango.horarioCierre} ya existe en este día`);

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
      throw new Error(`Error al actualizar los horarios del día: ${error.message}`);
    }
  }
}

module.exports = new DiasService();
