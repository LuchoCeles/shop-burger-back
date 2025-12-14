const express = require('express');
const { body } = require('express-validator');
const ConfiguracionController = require('../controllers/configuracionesController'); 
const authAdmin = require('../middlewares/authAdmin'); 
const validateRequest = require('../middlewares/validateRequest'); 
const handleUpload = require('../middlewares/multerMiddleware');

const router = express.Router();

// --- Función de Validación Común para Sub-Recursos (Array de Objetos) ---
const validateSubResourceArray = (fieldName, requiredFields) => 
  body(fieldName)
    .optional({ checkFalsy: true }) 
    .trim()
    .custom((value, { req }) => {
      if (!value) return true;

      let subArray;
      try {
        subArray = JSON.parse(value);
      } catch (e) {
        throw new Error(`El campo '${fieldName}' debe ser un array de objetos en formato JSON válido.`);
      }

      if (!Array.isArray(subArray)) {
        throw new Error(`El campo '${fieldName}' debe ser un array.`);
      }

      for (const [index, item] of subArray.entries()) {
        for (const { key, type, message } of requiredFields) {
          if (item[key] === undefined) {
            throw new Error(`Objeto #${index + 1} en '${fieldName}': falta el campo '${key}'.`);
          }

          if (type === 'url' && !item[key].startsWith('http')) {
            throw new Error(`Objeto #${index + 1} en '${fieldName}': '${key}' debe ser una URL válida.`);
          }
        }
      }
      
      req.body[fieldName] = subArray;
      return true;
    });

// 1. OBTENER CONFIGURACIÓN (Ruta Pública)
// GET /api/configuracion
router.get('/', ConfiguracionController.getConfiguracion);


// 2. CONFIGURACIÓN (Ruta Privada, requiere AuthAdmin)
// handleUpload.fields() para aceptar logo y favicon en la misma petición.
router.put('/', 
    authAdmin, 
    // Multer espera 0 o 1 archivo en el campo 'logoFile' y 0 o 1 archivo en 'faviconFile'
    handleUpload.fields([
        { name: 'logoFile', maxCount: 1 },
        { name: 'faviconFile', maxCount: 1 }
    ]), 
    validateRequest, 
    [
        // --- Validaciones de Campos Principales (ConfiguracionPagina) ---
        body('metaTitulo').optional().trim().isLength({ max: 70 }).withMessage('El título es muy largo.'),
        body('nombreLocal').optional().trim().isLength({ max: 255 }).withMessage('El nombre es muy largo.'),
        
        // **IMPORTANTE:** Cuando se usa Multer, el campo puede llegar vacío si no se sube un archivo.
        // Solo validamos la URL si el campo no es vacío y no hay archivo. Si hay archivo, 
        // la URL será procesada por el Controller/Service.
        body('url_logo')
            .optional({ checkFalsy: true })
            .custom((value, { req }) => {
                // Si hay un archivo, omitir la validación de URL en el body, 
                // ya que la nueva URL vendrá de Cloudinary.
                if (req.files && req.files.logoFile) {
                    return true;
                }
                // Si NO hay archivo, el valor debe ser una URL válida si se envía.
                if (value && !/(http|https):\/\/[a-zA-Z0-9-.]+\.[a-zA-Z]{2,}(\/\S*)?/.test(value)) {
                    throw new Error('La URL del logo no es válida.');
                }
                return true;
            }),
            
        body('favicon')
            .optional({ checkFalsy: true })
            .custom((value, { req }) => {
                if (req.files && req.files.faviconFile) {
                    return true;
                }
                if (value && !/(http|https):\/\/[a-zA-Z0-9-.]+\.[a-zA-Z]{2,}(\/\S*)?/.test(value)) {
                    throw new Error('La URL del favicon no es válida.');
                }
                return true;
            }),

        body('slogan').optional().trim().isLength({ max: 255 }).withMessage('El slogan es muy largo.'),
        
        body('whatsapp').optional().trim().isLength({ max: 255 }).withMessage('El WhatsApp es muy largo.'),
        
        body('email').optional().trim().isEmail().withMessage('El email no tiene formato válido.'),
        body('copyright').optional().trim().isLength({ max: 255 }).withMessage('El Copyright es muy largo.'),
        
        body('modoMantenimiento').optional().isIn(['true', 'false', '1', '0']).withMessage('ModoMantenimiento debe ser un booleano.'),
        body('estado').optional().isIn(['true', 'false', '1', '0']).withMessage('Estado debe ser un booleano.'),

        // --- Validaciones de Sub-Recursos (JSON Arrays) ---
        validateSubResourceArray('otrasPaginas', [
            { key: 'nombre', type: 'string', message: 'Falta el nombre de la página.' },
            { key: 'url', type: 'url', message: 'Falta la URL de la página o es inválida.' }
        ]),
        
        validateSubResourceArray('direcciones', [
            { key: 'direccion', type: 'string', message: 'Falta la dirección.' }
        ]),
        
        validateSubResourceArray('telefonos', [
            { key: 'telefono', type: 'string', message: 'Falta el número de teléfono.' }
        ]),

    ], 
    ConfiguracionController.updateConfiguracion
);


module.exports = router;