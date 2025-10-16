const { sequelize } = require('../config/db');
const { DataTypes } = require('sequelize');

// Importar modelos
const Categoria = require('./Categoria');
const Producto = require('./Producto');
const Cliente = require('./Cliente');
const Pedido = require('./Pedido');
const ProductosXPedido = require('./ProductosXPedido');
const DatosBancarios = require('./DatosBancarios');
const Pago = require('./Pago');
const Local = require('./Local');
const Admin = require('./Admin');
const Adicionales = require('./Adicionales');
const AdicionalesXProducto = require('./AdicionalesXProducto');

// Inicializar modelos
const models = {
  Categoria: Categoria(sequelize, DataTypes),
  Producto: Producto(sequelize, DataTypes),
  Adicionales: Adicionales(sequelize, DataTypes),
  Cliente: Cliente(sequelize, DataTypes),
  Pedido: Pedido(sequelize, DataTypes),
  ProductosXPedido: ProductosXPedido(sequelize, DataTypes),
  DatosBancarios: DatosBancarios(sequelize, DataTypes),
  Pago: Pago(sequelize, DataTypes),
  Local: Local(sequelize, DataTypes),
  Admin: Admin(sequelize, DataTypes),
  AdicionalesXProducto: AdicionalesXProducto(sequelize, DataTypes)
};

// Definir relaciones
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

models.sequelize = sequelize;
models.Sequelize = sequelize;

module.exports = models;