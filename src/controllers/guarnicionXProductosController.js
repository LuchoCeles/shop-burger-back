const GuarnicionesXProductoService = require("../services/guarnicionesXProductoService");

class GuarnicionesXProductoController {
    async create(req,res,next){
        try {
            const {idProducto, idGuarnicion} = req.body;

            if (!idGuarnicion || !idProducto){
                return res.status(400).json({
                    success : true,
                    message: "Se necesita la guarnicion y el producto",
                });
            }

            const prod  = await GuarnicionesXProductoService.create({idProducto,idGuarnicion});
            return res.status(201).json({
                success: true,
                message: "Asociacion guarnicion producto creada",
                data: prod,
            });
        } catch (error) {   
            next(error);
        }
    }
}

module.exports = new GuarnicionesXProductoController();