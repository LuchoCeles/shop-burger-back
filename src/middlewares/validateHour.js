function valiteHour(req, res, next) {
  const apertura = 9;   // 09:00
  const cierre = 23;    // 23:00

  const ahora = new Date();
  const horaActual = ahora.getHours();

  if (horaActual < apertura || horaActual >= cierre) {
    return res.status(403).json({
      ok: false,
      message: "El comercio está cerrado por fuera del horario de atención."
    });
  }

  next();
}

module.exports = valiteHour;
