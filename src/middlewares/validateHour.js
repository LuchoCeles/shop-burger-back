const { Dias, Horarios } = require("../models");
const { Op } = require("sequelize");

async function validateHour(req, res, next) {
  try {
    // Obtener el día actual (0 = Domingo, 1 = Lunes, ..., 6 = Sábado)
    const ahora = new Date();
    const diaActual = ahora.getDay();
    
    // Convertir a formato de tu BD (si usas 1 = Lunes, ..., 7 = Domingo)
    const idDia = diaActual === 0 ? 7 : diaActual;

    // Obtener el día con sus horarios
    const dia = await Dias.findByPk(idDia, {
      include: [
        {
          association: "horarios",
          where: { estado: 1 }, // Solo horarios activos
          required: false,
        },
      ],
    });

    // Verificar si el día existe y está activo
    if (!dia || dia.estado === 0) {
      return res.status(400).json({ 
        message: "El local está cerrado hoy",
        success: false 
      });
    }

    // Verificar si hay horarios configurados
    if (!dia.horarios || dia.horarios.length === 0) {
      return res.status(400).json({ 
        message: "No hay horarios configurados para hoy",
        success: false 
      });
    }

    // Obtener hora actual en formato HH:MM:SS
    const horaActual = ahora.toTimeString().split(' ')[0]; // "15:30:45"

    // Verificar si la hora actual está dentro de algún rango
    const estaAbierto = dia.horarios.some(horario => {
      return horaActual >= horario.horarioApertura && 
             horaActual <= horario.horarioCierre;
    });

    if (!estaAbierto) {
      // Opcional: devolver los horarios disponibles
      const horariosDisponibles = dia.horarios.map(h => 
        `${h.horarioApertura.slice(0, 5)} - ${h.horarioCierre.slice(0, 5)}`
      );

      return res.status(400).json({ 
        message: "El local está cerrado en este momento",
        horarios: horariosDisponibles,
        success: false 
      });
    }

    // Si está abierto, continuar con la siguiente función
    next();

  } catch (error) {
    console.error("Error al verificar el horario:", error);
    return res.status(500).json({ 
      message: "Error al verificar el horario",
      success: false 
    });
  }
}

module.exports = validateHour;