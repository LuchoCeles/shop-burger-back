const diasService = require("../services/diasService");

// Cache en memoria
let cacheDias = null;
let cacheExpiration = 0;
const CACHE_TTL = 60 * 1000; // 1 minuto

async function getDiasCached() {
  const ahora = Date.now();

  // Si el cache existe y no expiró → devolver cache
  if (cacheDias && ahora < cacheExpiration) {
    return cacheDias;
  }

  // Si no existe o expiró → cargar desde BD
  const dias = await diasService.getAll();

  // Guardar en cache
  cacheDias = dias;
  cacheExpiration = ahora + CACHE_TTL;

  return dias;
}

module.exports = async function validateHour(req, res, next) {
  try {
    const dias = await getDiasCached();

    const now = new Date();
    const currentTime = now.toTimeString().split(" ")[0];
    const currentDay = now.getDay();

    const idDia = currentDay === 0 ? 7 : currentDay; 
    const diaActual = dias.find((d) => d.id === idDia);

    if (!diaActual || diaActual.estado !== 1) {
      return res.status(403).json({
        success: false,
        message: "Hoy el negocio está cerrado",
      });
    }

    const horarios = diaActual.horarios.filter(h => h.estado === 1);

    if (horarios.length === 0) {
      return res.status(403).json({
        success: false,
        message: "No hay horarios configurados para hoy",
      });
    }

    const abierto = horarios.some(h => {
      const apertura = h.horarioApertura;
      const cierre = h.horarioCierre;

      if (apertura > cierre) {
        return currentTime >= apertura || currentTime <= cierre;
      }

      return currentTime >= apertura && currentTime <= cierre;
    });

    if (!abierto) {
      return res.status(403).json({
        success: false,
        message: "El negocio está cerrado en este horario",
      });
    }

    next();
  } catch (error) {
    console.error("Error en validateHour:", error);
    res.status(500).json({
      success: false,
      message: "Error interno validando el horario",
    });
  }
};
