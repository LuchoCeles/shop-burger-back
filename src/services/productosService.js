const { Producto, Categoria } = require("../models");
const cloudinaryService = require("./cloudinaryService");
const { sequelize } = require("../config/db");

class ProductosService {
 async getProducts(soloActivos = true) {
    const whereClause = soloActivos ? 1 : 0;
    const productos = await sequelize.query("CALL getProducts(:estado)", {
      replacements: { estado: whereClause },
    });
  
    const productosParseados = productos.map((p) => {
      const parseJsonField = (field) => {
        if (field && typeof field === 'string') {
          try {
            return JSON.parse(field);
          } catch (e) {
            console.error('Error al parsear campo JSON de primer nivel:', e);
            return [];
          }
        }
        return [];
      };
      const adicionales = parseJsonField(p.adicionales);
      let guarniciones = parseJsonField(p.guarniciones);

      if (Array.isArray(guarniciones)) {
        guarniciones = guarniciones.map(guarnicion => {
          return {
            ...guarnicion,
          };
        });
      }
    
      return {
        ...p,
        adicionales: adicionales,
        guarniciones: guarniciones,
        categoria: JSON.parse(p.categoria),
      };
    });

    return productosParseados;
  }

  async getProductById(id) {
    const producto = await Producto.findOne({
      where: { id, estado: 1 },
      include: [
        {
          model: Categoria,
          as: "categoria",
          attributes: ["id", "nombre"],
        },
      ],
    });

    if (!producto) {
      throw new Error("Producto no encontrado");
    }

    return producto;
  }

  async createProduct(productoData, imageBuffer) {
    let imageUrl = null;

    if (imageBuffer) {
      try {
        const uploadResult = await cloudinaryService.uploadImage(imageBuffer);
        imageUrl = uploadResult.secure_url;
      } catch (error) {
        throw new Error("Error al subir la imagen: " + error.message);
      }
    }

    const producto = await Producto.create({
      ...productoData,
      url_imagen: imageUrl,
    });

    return await this.getProductById(producto.id);
  }

  async updateState(id, nuevoEstado) {
    const transaction = await sequelize.transaction();
    try {
      const producto = await Producto.findByPk(id);

      if (!producto) {
        throw new Error(`Producto no encontrado`);
      }

      await producto.update({ estado: nuevoEstado }, { transaction });

      await transaction.commit();
      return producto;
    } catch (error) {
      if (!transaction.finished) await transaction.rollback();
      throw new Error(`Error al cambiar estado: ${error.message}`);
    }
  }

  async updateProduct(id, updateData, imageBuffer) {
    const producto = await Producto.findByPk(id);

    if (!producto) {
      throw new Error("Producto no encontrado");
    }

    let imageUrl = producto.url_imagen;

    // Si hay nueva imagen, subirla y eliminar la anterior si existe
    if (imageBuffer) {
      try {
        // Eliminar imagen anterior de Cloudinary
        if (producto.url_imagen) {
          const publicId = cloudinaryService.getPublicIdFromUrl(
            producto.url_imagen
          );
          if (publicId) {
            await cloudinaryService.deleteImage(publicId);
          }
        }

        // Subir nueva imagen
        const uploadResult = await cloudinaryService.uploadImage(imageBuffer);
        imageUrl = uploadResult.secure_url;
      } catch (error) {
        throw new Error("Error al actualizar la imagen: " + error.message);
      }
    }

    await producto.update({
      ...updateData,
      url_imagen: imageUrl,
    });

    return await this.getProductById(id);
  }

  async deleteProduct(id) {
    const producto = await Producto.findByPk(id);

    if (!producto) {
      throw new Error("Producto no encontrado");
    }

    // Eliminar imagen de Cloudinary si existe
    if (producto.url_imagen) {
      try {
        const publicId = cloudinaryService.getPublicIdFromUrl(
          producto.url_imagen
        );
        if (publicId) {
          await cloudinaryService.deleteImage(publicId);
        }
      } catch (error) {
        console.error("Error eliminando imagen de Cloudinary:", error);
      }
    }

    await producto.update({ estado: false });
  }
}

module.exports = new ProductosService();
