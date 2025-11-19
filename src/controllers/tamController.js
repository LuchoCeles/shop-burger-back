const tamService = require("../services/tamService");

class TamController {
    
    get = async (req, res, next) => {
        try {
            const tam = await tamService.get(); 
            return res.status(200).json({
                success: true,
                message: "Tamaños de combos obtenidos",
                data: tam
            });
        } catch (error) {
            next(error);
        }
    }

    create = async (req, res, next) => {
        try {
            const data = req.body;
            const tam = await tamService.create(data);
            return res.status(201).json({
                success: true,
                message: "Tamaño de 'combo' creado correctamente",
                data: tam
            });
        } catch (error) {
            next(error);
        }
    }

    update = async (req,res,next) => {
        try {
            const {id} = req.params;

            const tam =  await tamService.update(id);

            return res.status(200).json({
                success: true,
                message: "Tamaño de combro modificado",
                data: tam,
            });
        } catch (error) {
            next(error);
        }
    }
 }

module.exports = new TamController();