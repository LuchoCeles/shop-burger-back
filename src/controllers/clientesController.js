const {Cliente} = require("../models");
const models = require("../server/clientesService");

class ClientesController {
  async crear(req, res) {
    try {
        const {idPedido,direccion,descripcion,telefono} = req.body;
        
        if(!direccion || !idPedido){
            return res.status(400).json({
                error:"Ingrese una dirección"
            });
        }

        const cliente = await clientesService.crear({
            idPedido,
            direccion,
            descripcion,
            telefono
        });
        return res.status(400).json({
            mensaje: 'Cliente cargado',
            data:cliente
        });
    } catch (error) {
        console.error('Error al cargar el cliente',error);
        return res.status(500).json({
            error: error.mensage
        });
    }
  }

  async getClientes(req,res,next){
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

  async updateCliente(req,res){

  }
}

module.exports = new ClientesController();
