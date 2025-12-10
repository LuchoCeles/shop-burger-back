const { Producto, Categoria, ProductosXTam, Tam } = require("../models");
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
        if (field && typeof field === "string") {
          try {
            return JSON.parse(field);
          } catch (e) {
            console.error("Error al parsear campo JSON de primer nivel:", e);
            return [];
          }
        }
        return [];
      };
      const adicionales = parseJsonField(p.adicionales);
      let guarniciones = parseJsonField(p.guarniciones);
      let tam = parseJsonField(p.tam);

      return {
        ...p,
        adicionales: adicionales,
        guarniciones: guarniciones,
        categoria: JSON.parse(p.categoria),
        tam: tam,
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
        {
          model: Tam,
          as: "tam",
          attributes: ["id", "nombre"],
          through: { attributes: ["precio"] },
        },
      ],
    });

    if (!producto) {
      throw new Error("Producto no encontrado");
    }

    return producto;
  }

  async createProduct(productoData, tamData, imageBuffer) {
    let imageUrl = null;

    if (imageBuffer) {
      try {
        const uploadResult = await cloudinaryService.uploadImage(imageBuffer);
        imageUrl = uploadResult.secure_url;
      } catch (uploadError) {
        throw new Error("Error al subir la imagen: " + uploadError.message);
      }
    }

    const dataForProcedure = {
      ...productoData,
      url_imagen: imageUrl,
      tam: tamData,
    };

    const [result] = await sequelize.query("CALL createProducts(:data);", {
      replacements: { data: JSON.stringify(dataForProcedure) },
    });

    const newProductId = result[0].id;

    return await this.getProductById(newProductId);
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

  async updateImage(imageBuffer, url_imagen) {
    try {
      if (url_imagen) {
        const publicId = cloudinaryService.getPublicIdFromUrl(url_imagen);
        if (publicId) await cloudinaryService.deleteImage(publicId);
      }
      const uploadResult = await cloudinaryService.uploadImage(imageBuffer);
      imageUrl = uploadResult.secure_url;
      return imageUrl;
    } catch (error) {
      throw new Error("Error al actualizar la imagen: " + error.message);
    }
  }

  async updateProduct(id, productoData, tamData, imageBuffer) {
    const transaction = await sequelize.transaction();

    try {

      const producto = await Producto.findByPk(id, { transaction });

      if (!producto) {
        throw new Error("Producto no encontrado");
      }

      const antiguaCategoria = await producto.idCategoria;

      if (imageBuffer) {
        productoData.url_imagen = await this.updateImage(imageBuffer, producto.url_imagen);
      }

      await producto.update(productoData, { transaction });

      // asociaciones de tamaños y precios
      if (tamData && Array.isArray(tamData) && tamData.length > 0) {
        
        if (productoData.idCategoria !== antiguaCategoria) {
          //eliminar todas las asociaciones antiguas
          await ProductosXTam.destroy({
            where: { idProducto: id },
            transaction,
          });

          // Crear las nuevas asociaciones con los tamaños de la nueva categoría
          const nuevasAsociaciones = tamData.map((t) => ({
            idProducto: id,
            idTam: t.idTam,
            precio: t.precio,
          }));
          await ProductosXTam.bulkCreate(nuevasAsociaciones, { transaction });
        } else {
          for (const tam of tamData) {
            await ProductosXTam.update(
              { precio: tam.precio },
              {
                where: {
                  idProducto: id,
                  idTam: tam.idTam
                },
                transaction
              }
            );
          }
        }
      }

      await transaction.commit();
      return await this.getProductById(id);
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al actualizar el producto: ${error.message}`);
    }
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
