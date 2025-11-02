const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const mercadoPagoController = require("../controllers/mercadoPagoController");
const validateRequest = require("../middlewares/validateRequest");

router.post("/", [
  body("items").isArray({ min: 1 }).withMessage("items debe ser un array con al menos un elemento"),
  body("payer").isObject().withMessage("payer debe ser un objeto"),
], validateRequest, mercadoPagoController.create);

router.get("/:payment_id", mercadoPagoController.get);

module.exports = router;