const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const datosBancariosController = require("../controllers/datosBancariosController");
const authAdmin = require("../middlewares/authAdmin");
const authBanco = require("../middlewares/authBanco");
const validateRequest = require("../middlewares/validateRequest");

router.post("/", authAdmin,validateRequest, [
  body("id").notEmpty().withMessage("El ID es obligatorio"),
  body("banco.cuit").notEmpty().isString().withMessage("El CUIT es obligatorio"),
  body("banco.alias").notEmpty().withMessage("El alias es obligatorio"),
  body("banco.cbu").notEmpty().withMessage("El CBU es obligatorio"),
  body("banco.apellido").notEmpty().withMessage("El apellido es obligatorio"),
  body("banco.nombre").notEmpty().withMessage("El nombre es obligatorio"),
  body("banco.password").notEmpty().withMessage("La password es obligatorio"),
],  datosBancariosController.create);

router.get("/", datosBancariosController.get);

// Acceder a los datos (requiere contraseña guardada)
router.post("/login", authAdmin, validateRequest,[
  body("cuit").notEmpty().withMessage("El CUIT es obligatorio"),
  body("password").notEmpty().withMessage("La Contraseña es obligatoria")
],  datosBancariosController.login);

router.patch("/:id",
  authAdmin, authBanco,validateRequest, [
  body("banco.cuit").notEmpty().isString().withMessage("El CUIT no puede estar vacío"),
  body("banco.alias").notEmpty().isString().withMessage("El alias no puede estar vacío"),
  body("banco.cbu").notEmpty().isString().withMessage("El CBU no puede estar vacío"),
  body("banco.apellido").notEmpty().isString().withMessage("El apellido no puede estar vacío"),
  body("banco.nombre").notEmpty().isString().withMessage("El nombre no puede estar vacío"),
],  datosBancariosController.update);

router.patch("/:id/stateMP", authAdmin, authBanco, validateRequest,[
  body("mpEstado").notEmpty().toBoolean().isBoolean().withMessage("El estado de MP es obligatorio"),
  body("mpAccessToken").optional().isString(),
],  datosBancariosController.updateMPState);

router.patch("/password/:id", authAdmin, authBanco,validateRequest, [
  body("password").notEmpty().withMessage("Contraseña actual requerida"),
  body("newPassword").notEmpty().isLength({ min: 6 }).withMessage("Contraseña nueva requerida y Minimo debe tener 6 caracteres"),
],  datosBancariosController.updatePassword);

module.exports = router;
