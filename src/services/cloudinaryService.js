const cloudinary = require('../config/cloudinary');
const stream = require('stream');

class CloudinaryService {
  async uploadImage(buffer, folder = 'burger-shop') {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'auto',
          quality: 'auto',
          fetch_format: 'auto'
        },
        (error, result) => {
          if (error) {
            reject(new Error('Error al subir imagen a Cloudinary'));
          } else {
            resolve(result);
          }
        }
      );

      // Crear un stream desde el buffer
      const bufferStream = new stream.PassThrough();
      bufferStream.end(buffer);
      bufferStream.pipe(uploadStream);
    });
  }

  async deleteImage(publicId) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } catch (error) {
      console.error('Error eliminando imagen de Cloudinary:', error);
      throw new Error('Error al eliminar la imagen');
    }
  }

  // Extraer public_id desde la URL de Cloudinary
  getPublicIdFromUrl(url) {
    const matches = url.match(/burger-shop\/([^\.]+)/);
    return matches ? `burger-shop/${matches[1]}` : null;
  }
}

module.exports = new CloudinaryService();