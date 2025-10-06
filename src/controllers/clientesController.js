const { Cliente } = require("../models");
const clientesService = require("../services/clientesService");

class ClientesController {
  async crear(req, res) {
    try {
      const { idPedido, direccion, descripcion, telefono } = req.body;

      if (!direccion || !idPedido) {
        return res.status(400).json({
          error: "Ingrese una dirección",
        });
      }

      const cliente = await clientesService.createCliente({
        idPedido,
        direccion,
        descripcion,
        telefono,
      });

      return res.status(401).json({
        mensaje: "Cliente cargado",
        data: cliente,
      });

    } catch (error) {
      console.error("Error al cargar el cliente", error);
      return res.status(500).json({
        error: error.mensage,
      });
    }
  }

  async getClientes(req, res, next) {
    try {
      const cliente = await clientesService.getClientes();
      res.status(200).json({
        success: true,
        data: cliente,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCliente(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const cliente = await clientesService.updateCliente(id, updateData);
      res.json({
        success: true,
        message: "Cliente actualizada exitosamente",
        data: cliente,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteClientes(req,res,next){
    try {
          const { id } = req.params;
          const cliente = await clientesService.deleteCliente(id);
          res.json({
            success: true,
            message: "Cliente eliminada exitosamente",
            data: cliente,
          });
        } catch (error) {
          next(error);
        }
  } 
}

module.exports = new ClientesController();
