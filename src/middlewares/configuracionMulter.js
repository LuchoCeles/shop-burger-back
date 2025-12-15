// src/middlewares/configuracionMulter.js

const multer = require('multer');
const path = require('path');

// 1. Instancia de Multer específica para la Configuración
const configuracionUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  
  // El fileFilter es el mismo, pero agregaremos 'ico' por si acaso, ya que son logos y favicons.
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp|ico/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Solo se permiten imágenes (JPEG, JPG, PNG, WEBP, ICO) para logos/favicons.'));
  }
});

// 2. Exportamos la instancia base.
// Esto permite llamar a: configuracionUpload.fields([...]) en la ruta.
module.exports = configuracionUpload;