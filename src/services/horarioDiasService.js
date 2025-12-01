const { HorarioDias, Horario, Dias } = require("../models");

class HorarioDiasService {
  async create(data) {
    const { idHorario, idDia } = data;

    const existing = await HorarioDias.findOne({ where: { idHorario, idDia } });
    if (existing) {
      throw new Error(
        `El horario ${idHorario} ya está asignado al día ${idDia}.`
      );
    }
    const newAssociation = await HorarioDias.create({ idHorario, idDia });
    return newAssociation;
  }

  async getAll() {
    try {
      const horariosDias = await HorarioDias.findAll({
        include: [
          { model: Horario, as: "horario" },
          { model: Dias, as: "dia" },
        ],
        order: [["id", "ASC"]],
      });
      return horariosDias;
    } catch (error) {
        throw new Error(`Error al obtener horaios y dias ${error.message}`);
    }
  }

  async delete(id) {
    const association = await HorarioDias.findByPk(id);
    if (!association) {
      throw new Error(`No se encontró la asignación con el ID ${id}.`);
    }
    await association.destroy();
    return { message: "Asignación eliminada correctamente." };
  }
}

module.exports = new HorarioDiasService();
