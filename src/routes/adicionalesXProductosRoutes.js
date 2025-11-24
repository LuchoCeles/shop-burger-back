const express = require("express");
const router = express.Router();
const adicionalesXProductoController = require("../controllers/adicionalesXProductosController");
const authAdmin = require("../middlewares/authAdmin");
const { body } = require("express-validator");
const validateRequest = require("../middlewares/validateRequest");


router.post("/create", authAdmin, validateRequest, [
    body("idProducto"),
    body("idAdicional"),
], adicionalesXProductoController.create);

router.delete("/:id", authAdmin, validateRequest, [
], adicionalesXProductoController.delete);

router.patch("/:id/update", authAdmin, validateRequest, [
    body("idProducto"),
    body("idAdicional"),
], adicionalesXProductoController.update);

module.exports = router;