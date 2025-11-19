const { Local, Horario, Dias } = require("../models");

class LocalService {
  async getAll() {
    try {
      const localesConHorarios = await Local.findAll({
        attributes: ["id", "direccion", "estado"],
        order: [["id", "ASC"]],
        include: [
          {
            model: Horario,
            as: "horarios",
            attributes: ["id", "horarioApertura", "horarioCierre", "estado"],
            required: false,
            include: [
              {
                model: Dias,
                as: "dias",
                attributes: ["id", "nombreDia", "estado"],
                through: { attributes: [] },
                required: false,
              },
            ],
          },
        ],
      });

      // lista COMPLETA de los días
      const todosLosDias = await Dias.findAll({
        attributes: ["nombreDia"],
        order: [["id", "ASC"]],
      });
      const listaNombresDias = todosLosDias.map((d) => d.nombreDia);

      if (!localesConHorarios || localesConHorarios.length === 0) {
        return [];
      }

      // Estructuramos los datos
      const formattedLocales = localesConHorarios.map((localInstance) => {
        const local = localInstance.get({ plain: true });

        // Objeto con TODOS los días de la semana.
        const diasConHorarios = {};

        // Inicializamos todos los días con un array vacío.
        listaNombresDias.forEach((nombreDia) => {
          diasConHorarios[nombreDia] = [];
        });

        // Cargamos con horarios que SÍ existen.
        (local.horarios || []).forEach((horario) => {
          (horario.dias || []).forEach((dia) => {
            const nombreDia = dia.nombreDia;

            const turno = {
              idHorario: horario.id,
              horarioApertura: horario.horarioApertura,
              horarioCierre: horario.horarioCierre,
              estado: horario.estado,
            };

            if (diasConHorarios[nombreDia]) {
              diasConHorarios[nombreDia].push(turno);
            }
          });
        });

        return {
          id: local.id,
          direccion: local.direccion,
          estado: local.estado,
          dias: diasConHorarios,
        };
      });

      return formattedLocales;
    } catch (error) {
      throw new Error(`Error al obtener la lista de locales: ${error.message}`);
    }
  }

  async createLocal(dataLocal) {
    try {
      const local = await Local.create(dataLocal);
      return local;
    } catch (error) {
      throw new Error(`Error al crear local ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const local = await Local.findByPk(id);
      if (!local) {
        throw new Error(`No se encontro el local`);
      }

      local.estado = local.estado === 1 ? 0 : 1;
      await local.save();

      return local;
    } catch (error) {
      throw new Error(`Error al eliminar local ${error.message}`);
    }
  }

  async updateLocal(id, direccion) {
    try {
      const local = await Local.findByPk(id);
      if (!local) {
        throw new Error(`No se encontro el local`);
      }
      local.direccion = direccion;
      await local.save();

      return local;
    } catch (error) {
      throw new Error(`Error al actualizar la dirección del local: ${error.message}`);
    }
  }
}

module.exports = new LocalService();
