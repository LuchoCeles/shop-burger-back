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
    body("banco.alias")
      .notEmpty()
      .withMessage("El alias es obligatorio"),
    body("banco.cbu")
      .notEmpty()
      .withMessage("El CBU es obligatorio"),
    body("banco.apellido")
      .notEmpty()
      .withMessage("El apellido es obligatorio"),
    body("banco.nombre")
      .notEmpty()
      .withMessage("El nombre es obligatorio"),
    validateRequest, // ✅ Valida todos los campos antes de ejecutar el controlador
  ],
  datosBancariosController.create
);

module.exports = router;
