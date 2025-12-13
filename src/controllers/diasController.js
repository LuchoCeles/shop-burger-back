const  diasService  = require("../services/diasService")
const { getDiasCached } = require("../cache/diasCache")


class DiasController {
  async getAll(req, res) {
    try {
      const dias = await getDiasCached();

      const diasFormateados = dias.map(dia => ({
        id: dia.id,
        nombre: dia.nombre,
        estado: dia.estado,
        rangos: dia.horarios.map(horario => ({
          id: horario.id,
          inicio: horario.horarioApertura.substring(0, 5),
          fin: horario.horarioCierre.substring(0, 5),
          estado: horario.estado
        }))
      }));

      return res.status(200).json({
        success: true,
        data: diasFormateados,
        message: "Días obtenidos correctamente",
      });
    } catch (error) {
      console.error("Error getAll dias:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { rangos } = req.body;
      
      const diaActualizado = await diasService.update(id, rangos);
      return res.status(200).json({
        success: true,
        data: diaActualizado,
        message: "Día actualizado correctamente",
      });
    } catch (error) {
      return res.status(500).json({ 
        message: error.message, 
        success: false 
      });
    }
  }
}

module.exports = new DiasController();
