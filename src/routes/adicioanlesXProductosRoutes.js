const express = require("express");
const router = express.Router();
const adicionalesXProductoController = require("../controllers/adicionalesXProductosController");
const authAdmin = require("../middlewares/authAdmin");
const { body } = require("express-validator");
const validateRequest = require("../middlewares/validateRequest");

router.get("/",adicionalesXProductoController.getAll);

router.post("/create", authAdmin,[
    body("idProducto"),
    body("idAdicional"),
], validateRequest, adicionalesXProductoController.create);

router.delete("/:id", authAdmin,[
], validateRequest, adicionalesXProductoController.delete);

router.patch("/:id/update",authAdmin,[
    body("idProducto"),
    body("idAdicional"),
],validateRequest,adicionalesXProductoController.update);

module.exports = router;