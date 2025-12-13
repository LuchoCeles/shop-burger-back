const diasService = require("../services/diasService");

// =====================
// Cache en memoria
// =====================
let cacheDias = null;
let cacheExpiration = 0;
const CACHE_TTL = 60 * 1000; // 1 minuto

async function getDiasCached(force = false) {
  const ahora = Date.now();

  // Cache válido
  if (!force && cacheDias && ahora < cacheExpiration) {
    return cacheDias;
  }

  // Recargar desde BD
  const dias = await diasService.getAll();

  cacheDias = dias;
  cacheExpiration = ahora + CACHE_TTL;

  return dias;
}

// Se usa cuando se actualizan horarios/días
function clearDiasCache() {
  cacheDias = null;
  cacheExpiration = 0;
}

// =====================
// Middleware
// =====================
async function validateHour(req, res, next) {
  try {
    const dias = await getDiasCached();

    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 8); // HH:mm:ss
    const currentDay = now.getDay(); // 0 = Domingo

    const idDia = currentDay === 0 ? 7 : currentDay;
    const diaActual = dias.find(d => d.id === idDia);

    // Día cerrado
    if (!diaActual || diaActual.estado !== 1) {
      return res.status(403).json({
        success: false,
        message: "Hoy el negocio está cerrado",
      });
    }

    const horarios = diaActual.horarios?.filter(h => h.estado === 1) || [];

    if (horarios.length === 0) {
      return res.status(403).json({
        success: false,
        message: "No hay horarios configurados para hoy",
      });
    }

    const abierto = horarios.some(h => {
      const apertura = h.horarioApertura;
      const cierre = h.horarioCierre;

      // Horario que cruza medianoche
      if (apertura > cierre) {
        return currentTime >= apertura || currentTime <= cierre;
      }

      // Horario normal
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
    return res.status(500).json({
      success: false,
      message: "Error interno validando el horario",
    });
  }
}

// =====================
// Exports
// =====================
module.exports = {
  validateHour,
  getDiasCached,
  clearDiasCache,
};
