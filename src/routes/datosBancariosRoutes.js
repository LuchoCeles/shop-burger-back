const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const datosBancariosController = require("../controllers/datosBancariosController");
const authAdmin = require("../middlewares/authAdmin");
const validateRequest = require("../middlewares/validateRequest");

router.post("/", [
  authAdmin,
  body("banco.cuit")
    .notEmpty()
    .isString(),
  body("banco.alias").notEmpty().withMessage("El alias es obligatorio"),
  body("banco.cbu").notEmpty().withMessage("El CBU es obligatorio"),
  body("banco.apellido").notEmpty().withMessage("El apellido es obligatorio"),
  body("banco.nombre").notEmpty().withMessage("El nombre es obligatorio"),
  body("banco.password").notEmpty().withMessage("La password es obligatorio"),
  validateRequest, // ✅ Valida todos los campos antes de ejecutar el controlador
], datosBancariosController.create);

// Acceder a los datos (requiere contraseña guardada)
router.post("/acceder",
  authAdmin,
  body("password").notEmpty(),
  validateRequest, datosBancariosController.access);

router.get("/",
  authAdmin, datosBancariosController.get);

router.put("/:id",
  authAdmin, [
  body("passwordActual").notEmpty().withMessage("La contraseña actual es obligatoria"),
  body("banco.cuit").optional().isString(),
  body("banco.alias").optional().isString(),
  body("banco.cbu").optional().isString(),
  body("banco.apellido").optional().isString(),
  body("banco.nombre").optional().isString(),
  validateRequest,
], datosBancariosController.update);

module.exports = router;
