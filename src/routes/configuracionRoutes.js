const express = require('express');
const { body } = require('express-validator');
const ConfiguracionController = require('../controllers/configuracionesController'); 
const authAdmin = require('../middlewares/authAdmin'); 
const validateRequest = require('../middlewares/validateRequest'); 

// Importación del NUEVO middleware (reemplaza la importación anterior de handleUpload/uploadInstance)
const configuracionUpload = require('../middlewares/configuracionMulter'); 

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
router.put('/', 
    authAdmin, 
    // Usamos el nuevo middleware configuracionUpload
    configuracionUpload.fields([ 
      { name: 'logoFile', maxCount: 1 },
      { name: 'faviconFile', maxCount: 1 }
    ]), 
    
    // Corregimos el error [object Object] agrupando validaciones y validador final
    [
        // --- Validaciones de Campos Principales (ConfiguracionPagina) ---
        body('metaTitulo').optional().trim().isLength({ max: 70 }).withMessage('El título es muy largo.'),
        body('nombreLocal').optional().trim().isLength({ max: 255 }).withMessage('El nombre es muy largo.'),
        
        body('url_logo')
            .optional({ checkFalsy: true })
            .custom((value, { req }) => {
                if (req.files && req.files.logoFile) {
                    return true;
                }
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
        
        // validateRequest DEBE ser el último elemento del array de validaciones.
        validateRequest 
    ], 
    ConfiguracionController.updateConfiguracion
);


module.exports = router;