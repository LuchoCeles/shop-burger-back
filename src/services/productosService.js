const { Producto, Categoria, ProductosXTam, Tam } = require("../models");
const cloudinaryService = require("./cloudinaryService");
const { sequelize } = require("../config/db");

class ProductosService {
  async getProducts(soloActivos = true) {
    try {

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
    } catch (error) {
      throw new Error(`Error al obtener productos: ${error.message}`);
    }
  }

  async getProductById(id) {
    try {
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
            as: "tamanos",
            attributes: ["id", "nombre"],
            through: { attributes: ["precio"] },
          },
        ],
      });

      if (!producto) throw new Error("Producto no encontrado");

      return producto;
    } catch (error) {
      throw new Error(`Error al obtener el producto: ${error.message}`);
    }
  }

  async createProduct(productoData, tamData, imageBuffer) {
    try {
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
    } catch (error) {
      throw new Error(`Error al crear el producto: ${error.message}`);
    }
  }

  async updateState(id, nuevoEstado) {
    try {
      const transaction = await sequelize.transaction();
      const producto = await Producto.update(
        { estado: nuevoEstado },
        { where: { id }, transaction }
      );

      if (!producto) throw new Error('Producto no encontrado');

      await transaction.commit();

      return producto;
    } catch (error) {
      await transaction.rollback();
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
      return uploadResult.secure_url;
    } catch (error) {
      throw new Error("Error al actualizar la imagen: " + error.message);
    }
  }

  async updateRelationProductTam(id, tamData, transaction) {
    try {
      await ProductosXTam.destroy({
        where: { idProducto: id },
        transaction,
      });

      if (tamData && tamData.length > 0) {
        const nuevasAsociaciones = tamData.map((t) => ({
          idProducto: id,
          idTam: t.idTam,
          precio: t.precio,
        }));
        await ProductosXTam.bulkCreate(nuevasAsociaciones, { transaction });
      }
    } catch (error) {
      throw new Error(`Error al actualizar las asociaciones: ${error.message}`);
    }
  }

  async createRelationProductTam(id, tamData, transaction) {
    try {
      // Obtener los tamaños actuales
      const tamañosActuales = await ProductosXTam.findAll({
        where: { idProducto: id },
        transaction
      });

      const idsActuales = tamañosActuales.map(t => t.idTam);
      const idsNuevos = tamData.map(t => t.idTam);

      // Eliminar los que ya no están en tamData
      const idsAEliminar = idsActuales.filter(id => !idsNuevos.includes(id));
      if (idsAEliminar.length > 0) {
        await ProductosXTam.destroy({
          where: {
            idProducto: id,
            idTam: idsAEliminar
          },
          transaction
        });
      }

      // Actualizar o crear los demás
      await Promise.all(
        tamData.map((t) =>
          ProductosXTam.upsert(
            {
              idProducto: id,
              idTam: t.idTam,
              precio: t.precio
            },
            { transaction }
          )
        )
      );
    } catch (error) {
      throw new Error(`Error al actualizar las asociaciones: ${error.message}`);
    }
  }

  async updateProduct(id, productoData, tamData, imageBuffer) {
    try {
      const transaction = await sequelize.transaction();
      const producto = await Producto.findByPk(id, { transaction });

      if (!producto) throw new Error("Producto no encontrado");

      const antiguaCategoria = producto.idCategoria;

      if (imageBuffer) {
        productoData.url_imagen = await this.updateImage(imageBuffer, producto.url_imagen);
      }

      await producto.update(productoData, { transaction });

      // asociaciones de tamaños y precios
      if (tamData && Array.isArray(tamData) && tamData.length > 0) {
        // Si cambió la categoría, eliminar todo y recrear
        if (productoData.idCategoria !== antiguaCategoria) {
          await this.updateRelationProductTam(id, tamData, transaction);
        } else {
          // Si no cambió, hacer update/upsert inteligente
          await this.createRelationProductTam(id, tamData, transaction);
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
    try {
      const producto = await Producto.findByPk(id);

      if (!producto) throw new Error("Producto no encontrado");

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
          throw new Error("Error al eliminar la imagen de Cloudinary: " + error.message);
        }
      }

      await producto.update({ estado: false });

    } catch (error) {
      throw new Error(`Error al eliminar el producto: ${error.message}`);
    }
  }
}

module.exports = new ProductosService();
