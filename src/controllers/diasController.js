const  diasService  = require("../services/diasService")

class DiasController {
  async getAll(req, res) {
    try {
      const dias = await diasService.getAll();     

      const diasFormateados = dias.map(dia => ({
        id: dia.id,
        nombre: dia.nombre,
        estado: dia.estado,
        rangos: dia.horarios.map(horario => ({
          id: horario.id,
          inicio: horario.horarioApertura,
          fin: horario.horarioCierre,
          estado: horario.estado
        }))
      }));

      return res.status(200).json({
        success: true,
        data: diasFormateados, // Retorna el array completo
        message: "Días obtenidos correctamente",
      });
    } catch (error) {
      return res.status(500).json({ 
        message: error.message, 
        success: false 
      });
    }
  }

  async create(req, res) {
    try {
      const { idDia, rangos } = req.body;
      const nuevoDia = await diasService.create(idDia, rangos);
      return res.status(201).json({
        success: true,
        data: nuevoDia,
        message: "Día creado correctamente",
      });
    } catch (error) {
      return res.status(500).json({ 
        message: error.message, 
        success: false 
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
