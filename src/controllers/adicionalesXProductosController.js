const { clearParserCache } = require("mysql2");
const { sequelize, AdicionalesXProducto } = require("../models");
const adicionalesXProductosService = require("../services/adicionalesXProductosService");

class AdicionalesXProductosController {
  async create(req, res, next) {
    try {
      const registro = await adicionalesXProductosService.create(req.body);
      res.status(201).json({
        success: true,
        message: "Adicional agregado",
        data: registro,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const registro = await adicionalesXProductosService.getAll();
      res.status(200).json({
        success: true,
        data: registro,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const registro = await adicionalesXProductosService.update(id, req.body);
      res.json({
        success: true,
        data: registro,
      });
    } catch (error) {
      res.status({
        success: false,
        message: error.message,
      });
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const resultado = await adicionalesXProductosService.delete(id);
      res.json({
        success: true,
        data: resultado,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new AdicionalesXProductosController();
