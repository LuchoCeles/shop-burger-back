const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const datosBancariosController = require("../controllers/datosBancariosController");
const authAdmin = require("../middlewares/authAdmin");
const validateRequest = require("../middlewares/validateRequest");

router.post(
  "/datosbancarios",
  [
    authAdmin,
    body("banco.cuit")
      .notEmpty()
      .withMessage("El CUIT es obligatorio")
      .isString()
      .withMessage("El CUIT debe ser un texto"),
    body("banco.alias").notEmpty().withMessage("El alias es obligatorio"),
    body("banco.cbu").notEmpty().withMessage("El CBU es obligatorio"),
    body("banco.apellido").notEmpty().withMessage("El apellido es obligatorio"),
    body("banco.nombre").notEmpty().withMessage("El nombre es obligatorio"),
    body("banco.password").notEmpty().withMessage("La password es obligatorio"),
    validateRequest, // ✅ Valida todos los campos antes de ejecutar el controlador
  ],
  datosBancariosController.create
);

// Acceder a los datos (requiere contraseña guardada)
router.post(
  "/datosbancarios/acceder",
  authAdmin,
  body("password").notEmpty().withMessage("La contraseña es obligatoria"),
  validateRequest,
  datosBancariosController.access
);
router.get(
  "/datosbancarios",
  authAdmin, // puedes quitarlo si no quieres auth
  datosBancariosController.get
);
router.put(
  "/datosbancarios/:id",
  authAdmin,
  [
    body("passwordActual").notEmpty().withMessage("La contraseña actual es obligatoria"),
    body("banco.cuit").optional().isString(),
    body("banco.alias").optional().isString(),
    body("banco.cbu").optional().isString(),
    body("banco.apellido").optional().isString(),
    body("banco.nombre").optional().isString(),
    validateRequest,
  ],
  datosBancariosController.update
);

module.exports = router;
