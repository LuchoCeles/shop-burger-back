const { Guarniciones, Tam, TamXGuarnicion } = require("../models");

class GuarnicionesService {
  async getAll() {
    try {
      const guarniciones = await Guarniciones.findAll({
        attributes: ["id", "nombre"],
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
        where: [guarnicion.id],
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
      const guarnicion = await Guarniciones.findByPk(id);
      await guarnicion.update(data);
      return guarnicion;
    } catch (error) {
      throw new Error(`Error al mosificar guarnicion ${error.message}`);
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
