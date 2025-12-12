const diasService = require("../services/diasService");

module.exports = async function validateHour(req, res, next) {
  try {
    // Obtener días y horarios desde tu servicio
    const dias = await diasService.getAll();

    const now = new Date();
    const currentTime = now.toTimeString().split(" ")[0]; // HH:MM:SS
    const currentDay = now.getDay(); // 0 = Domingo ... 6 = Sábado

    const diaBD = currentDay === 0 ? 7 : currentDay;

    const diaActual = dias.find((d) => d.id === diaBD);

    // Si el día está apagado → cerrado
    if (!diaActual || diaActual.estado !== 1) {
      return res.status(403).json({
        success: false,
        message: "Hoy el negocio está cerrado",
      });
    }

    // Filtrar horarios activos
    const horarios = diaActual.horarios.filter((h) => h.estado === 1);

    if (horarios.length === 0) {
      return res.status(403).json({
        success: false,
        message: "No hay horarios configurados para hoy",
      });
    }

    // Comprobar si la hora actual cae en alguno de los rangos válidos
    const abierto = horarios.some((h) => {
      const apertura = h.horarioApertura;
      const cierre = h.horarioCierre;

      //Soporte para horarios nocturnos (Ej: 20:00 → 03:00)
      if (apertura > cierre) {
        return (
          currentTime >= apertura || currentTime <= cierre
        );
      }

      // Normal
      return currentTime >= apertura && currentTime <= cierre;
    });

    if (!abierto) {
      return res.status(403).json({
        success: false,
        message: "El negocio está cerrado en este horario",
      });
    }

    // Todo ok → continuar
    next();
  } catch (error) {
    console.error("Error en validateHour:", error);
    res.status(500).json({
      success: false,
      message: "Error interno validando el horario",
    });
  }
};
