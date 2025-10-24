const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const datosBancariosController = require("../controllers/datosBancariosController");
const authAdmin = require("../middlewares/authAdmin");
const validateRequest = require("../middlewares/validateRequest");

router.post("/", authAdmin, [
  body("banco.cuit")
    .notEmpty()
    .isString(),
  body("banco.alias").notEmpty().withMessage("El alias es obligatorio"),
  body("banco.cbu").notEmpty().withMessage("El CBU es obligatorio"),
  body("banco.apellido").notEmpty().withMessage("El apellido es obligatorio"),
  body("banco.nombre").notEmpty().withMessage("El nombre es obligatorio"),
  body("banco.password").notEmpty().withMessage("La password es obligatorio"),
], validateRequest, datosBancariosController.create);

// Acceder a los datos (requiere contraseña guardada)
router.post("/login", authAdmin, [
  body("cuit").notEmpty().withMessage("El CUIT es obligatorio"),
  body("password").notEmpty().withMessage("La Contraseña es obligatoria")
], validateRequest, datosBancariosController.access);

router.get("/", datosBancariosController.get);

router.patch("/:id",
  authAdmin, [
  body("banco.cuit").optional().isString().notEmpty().withMessage("El CUIT no puede estar vacío"),
  body("banco.alias").optional().isString().notEmpty().withMessage("El alias no puede estar vacío"),
  body("banco.cbu").optional().isString().notEmpty().withMessage("El CBU no puede estar vacío"),
  body("banco.apellido").optional().isString().notEmpty().withMessage("El apellido no puede estar vacío"),
  body("banco.nombre").optional().isString().notEmpty().withMessage("El nombre no puede estar vacío"),
], validateRequest, datosBancariosController.update);

router.patch("/password/:id", authAdmin, [
  body("password").notEmpty().withMessage("Contraseña actual requerida"),
  body("newPassword").isLength({ min: 6 }).withMessage("Minimo debe tener 6 caracteres"),
], validateRequest, datosBancariosController.updatePassword);

module.exports = router;
