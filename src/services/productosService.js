const { where } = require('sequelize');
const { Producto, Categoria } = require('../models');
const cloudinaryService = require('./cloudinaryService');

class ProductosService {

  async getProductos(soloActivos = true) {
    const whereClause = soloActivos ? { estado: 1 } : {};
    const productos = await Producto.findAll({
      where: whereClause,
      include: [
        {
          model: Categoria,
          as: 'categoria',
          attributes: ['nombre'],
          where: { estado: 1 },
          required: true
        }
      ]
    });
    return productos.map(p => {
      const plain = p.get({ plain: true });
      return {
        ...plain,
        categoria: plain.categoria ? plain.categoria.nombre : null
      };
    });
  }

  async getProductoById(id) {
    const producto = await Producto.findOne({
      where: { id, estado: 1 },
      include: [{
        model: Categoria,
        as: 'categoria',
        attributes: ['id', 'nombre']
      }]
    });

    if (!producto) {
      throw new Error('Producto no encontrado');
    }

    return producto;
  }

  async createProducto(productoData, imageBuffer) {
    let imageUrl = null;

    // Subir imagen a Cloudinary si existe
    if (imageBuffer) {
      try {
        const uploadResult = await cloudinaryService.uploadImage(imageBuffer);
        imageUrl = uploadResult.secure_url;
      } catch (error) {
        throw new Error('Error al subir la imagen: ' + error.message);
      }
    }

    const producto = await Producto.create({
      ...productoData,
      url_imagen: imageUrl
    });

    return await this.getProductoById(producto.id);
  }


  async updateProducto(id, updateData, imageBuffer) {
    const producto = await Producto.findByPk(id);

    if (!producto) {
      throw new Error('Producto no encontrado');
    }

    let imageUrl = producto.url_imagen;

    // Si hay nueva imagen, subirla y eliminar la anterior si existe
    if (imageBuffer) {
      try {
        // Eliminar imagen anterior de Cloudinary
        if (producto.url_imagen) {
          const publicId = cloudinaryService.getPublicIdFromUrl(producto.url_imagen);
          if (publicId) {
            await cloudinaryService.deleteImage(publicId);
          }
        }

        // Subir nueva imagen
        const uploadResult = await cloudinaryService.uploadImage(imageBuffer);
        imageUrl = uploadResult.secure_url;
      } catch (error) {
        throw new Error('Error al actualizar la imagen: ' + error.message);
      }
    }

    await producto.update({
      ...updateData,
      url_imagen: imageUrl
    });

    return await this.getProductoById(id);
  }

  async deleteProducto(id) {
    const producto = await Producto.findByPk(id);

    if (!producto) {
      throw new Error('Producto no encontrado');
    }

    // Eliminar imagen de Cloudinary si existe
    if (producto.url_imagen) {
      try {
        const publicId = cloudinaryService.getPublicIdFromUrl(producto.url_imagen);
        if (publicId) {
          await cloudinaryService.deleteImage(publicId);
        }
      } catch (error) {
        console.error('Error eliminando imagen de Cloudinary:', error);
      }
    }

    await producto.update({ estado: false });
  }

}

module.exports = new ProductosService();