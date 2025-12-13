const diasService = require("../services/diasService");
const { getDiasCached } = require("../cache/diasCache");

class DiasController {
  async getAll(req, res) {
    try {
      const dias = await diasService.getAll();

      const diasFormateados = dias.map((dia) => ({
        id: dia.id,
        nombre: dia.nombre,
        estado: dia.estado,
        rangos: dia.horarios.map((horario) => ({
          id: horario.id,
          inicio: horario.horarioApertura.substring(0, 5),
          fin: horario.horarioCierre.substring(0, 5),
          estado: horario.estado,
        })),
      }));

      return res.status(200).json({
        success: true,
        data: diasFormateados, // Retorna el array completo
        message: "Días obtenidos correctamente",
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message,
        success: false,
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { rangos } = req.body;

      const diaActualizado = await diasService.update(id, rangos);

      // 🔥 1. Invalidar cache
      clearDiasCache();

      // 🔄 2. Regenerar cache con datos actualizados
      await getDiasCached(true);

      return res.status(200).json({
        success: true,
        data: diaActualizado,
        message: "Día actualizado correctamente",
      });
    } catch (error) {
      console.error("Error update dia:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new DiasController();
