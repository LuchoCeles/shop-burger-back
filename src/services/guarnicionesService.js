const { Guarniciones, Tam, TamXGuarnicion } = require("../models");

class GuarnicionesService {
  async getAll() {
    try {
      const guarniciones = await Guarniciones.findAll({
        attributes: ["id", "nombre", "estado"],
        include: [
          {
            model: Tam,
            as : "tam",
            attributes : ["id","nombre","estado"],
            through :{
              attributes:[]
            }
          },
        ],
        order: [["id", "DESC"]],
      });
      return guarniciones;
    } catch (error) {
      throw new Error(`Error al obtener guarniciones ${error.message}`);
    }
  }

 async createGuarnicion(data) {
    try {
      const { nombre, tamId } = data;

      const nuevaGuarnicion = await Guarniciones.create({ nombre });

      const asociacionesParaCrear = tamId.map(tamId => {
        return {
          idGuarnicion: nuevaGuarnicion.id,
          idTam: tamId,
        };
      });

      await TamXGuarnicion.bulkCreate(asociacionesParaCrear);

      const guarnicionCompleta = await Guarniciones.findByPk(nuevaGuarnicion.id, {
        include: {
          model: Tam,
          as: 'tam',
          through: { attributes: [] }
        }
      });
      
      return guarnicionCompleta;

    } catch (error) {
      throw new Error(`ERROR al crear guarnicion: ${error.message}`);
    }
  }
  async update(id, data) {
    try {
      const { nombre, tamId } = data;

      const guarnicion = await Guarniciones.findByPk(id);
   
      guarnicion.nombre = nombre;
      await guarnicion.save();
      
      if (tamId && Array.isArray(tamId)) {
        await guarnicion.setTam(tamId);
      }

      const guarnicionActualizada = await Guarniciones.findByPk(id, {
        include: {
          model: Tam,
          as: 'tam',
          through: { attributes: [] }
        }
      });

      return guarnicionActualizada;

    } catch (error) {
      throw new Error(`Error al modificar la guarnición: ${error.message}`);
    }
  }

  async updateEstado(id) {
    try {
      const guarnicion = await Guarniciones.findByPk(id);
      guarnicion.estado = guarnicion.estado === 1 ? 0 : 1;

      await guarnicion.save();

      return guarnicion;
    } catch (error) {
      throw new Error(`Error al eliminar guarnicion ${error.message}`);
    }
  }
}

module.exports = new GuarnicionesService();
