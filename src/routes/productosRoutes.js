const express = require('express');
const { body, param } = require('express-validator');
const productosController = require('../controllers/productosController');
const authAdmin = require('../middlewares/authAdmin');
const validateRequest = require('../middlewares/validateRequest');
const handleUpload = require('../middlewares/multerMiddleware');

const router = express.Router();

router.get('/', productosController.getProducts);


router.post('/', authAdmin, handleUpload, [
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio'),
  body('descripcion').optional({ checkFalsy: true }).trim(), // checkFalsy permite strings vacíos
  
  // Para campos numéricos, primero verificamos si es un string que parece número
  body('stock').optional({ checkFalsy: true }).isNumeric().withMessage('El stock debe ser un número'),
  body('idCategoria').notEmpty().withMessage('La categoría es obligatoria').isNumeric().withMessage('idCategoria debe ser un número'),
  body('descuento').optional({ checkFalsy: true }).isNumeric().withMessage('El descuento debe ser un número'),

  body('isPromocion').optional().isIn(['true', 'false']).withMessage('isPromocion debe ser "true" o "false"').toBoolean(), 

  body('tam')
    .trim()
    .notEmpty().withMessage("Debe proporcionar al menos un tamaño y precio.")
    .custom((value, { req }) => {
      let tamArray;
      try {
        tamArray = JSON.parse(value);
      } catch (e) {
        throw new Error("El campo 'tam' debe ser un array de objetos en formato JSON válido.");
      }
      if (!Array.isArray(tamArray) || tamArray.length === 0) {
        throw new Error("El campo 'tam' debe contener al menos un objeto de tamaño y precio.");
      }
      for (const item of tamArray) {
        if (item.idTam === undefined || isNaN(parseInt(item.idTam))) {
          throw new Error("Cada objeto en 'tam' debe tener un 'idTam' numérico y válido.");
        }
        if (item.precio === undefined || isNaN(parseFloat(item.precio)) || item.precio < 0) {
          throw new Error("Cada objeto en 'tam' debe tener un 'precio' numérico y positivo.");
        }
      }
      // Sanitización: Modificamos req.body para el controlador
      req.body.tam = tamArray;
      return true;
    }),
    
], validateRequest, productosController.createProduct);

router.patch('/:id', authAdmin, handleUpload, [
  body('precio').optional().isDecimal({ min: 0 }),
  body('stock').optional().isInt({ min: 0 })
], validateRequest, productosController.updateProduct);

router.delete('/:id', authAdmin, productosController.deleteProduct);

router.patch("/:id/estado", authAdmin, [
  param("id").isInt({ min: 1 }).withMessage("ID de producto inválido"),
  body("estado").isBoolean().withMessage("Estado debe ser 0 o 1"),
], validateRequest, productosController.updateState);

module.exports = router;