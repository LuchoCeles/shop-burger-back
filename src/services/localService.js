
const { Local, Horario, Dias } = require('../models');

class LocalService {

  async getAll() {
    try {
      const locales = await Local.findAll({
        attributes: ['id', 'direccion', 'estado'], 
        order: [['id', 'ASC']], 
        include: [
          {
            model: Horario,
            as: 'horarios', 
            attributes: ['id', 'horarioApertura', 'horarioCierre', 'estado'],
            where: { estado: 1 },
            required: false,
            include: [
              {
                model: Dias,
                as: 'dias', 
                attributes: ['nombreDia'],
                where: { estado: 1 },
                through: { attributes: [] },
                required: false,
              },
            ],
          },
        ],
      });

      if (!locales || locales.length === 0) {
        return [];
      }

      const formattedLocales = locales.map(localInstance => {
        const local = localInstance.get({ plain: true });

        const formattedHorarios = (local.horarios || []).map(horario => {
          return {
            idHorario: horario.id,
            horarioApertura: horario.horarioApertura,
            horarioCierre: horario.horarioCierre,
            estado: horario.estado,
            dias: (horario.dias || []).map(dia => dia.nombreDia)
          };
        });
        
        return {
          id: local.id,
          direccion: local.direccion,
          estado: local.estado,
          horarios: formattedHorarios,
        };
      });

      return formattedLocales;

    } catch (error) {
      throw new Error(`Error al obtener la lista de locales: ${error.message}`);
    }
  }
}

module.exports = new LocalService();