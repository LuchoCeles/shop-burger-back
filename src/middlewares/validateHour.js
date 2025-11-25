const { Horario } = require("../models");

async function valiteHour(req, res) {
  try {
    const horario = await Horario.finOne();

    if (!horario) {
      return res
        .status(400)
        .json({ message: "No se ha establecido un horario" });
    }

    const apertura = horario.apertura;
    const cierre = horario.cierre;

    const ahora = new Date();
    const horaActual = ahora.getHours();
    if (horaActual >= apertura && horaActual < cierre) {
      return res.status(200).json({ message: "Abierto" });
    }

    return res.status(400).json({ message: "Cerrado" });
  } catch (error) {
    return res.status(500).json({ message: "Error al verifiacar el horario" });
  }
}

module.exports = valiteHour;
