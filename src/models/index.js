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
const AdicionalesXProductosXPedidos = require('./AdicionalesXProductosXPedidos');
const MetodosDePago = require('./MetodosDePago');
const Envio = require('./Envio');
const Horario = require('./Horario');
const Dias = require("./Dias");
const HorarioDias = require('./horarioDias');
const Guarniciones = require('./Guarniciones');
const Tam = require('./Tam');
const GuarnicionesXProducto = require('./GuarnicionesXProducto');
const ProductosXTam = require('./ProductosXTam');


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
  AdicionalesXProducto: AdicionalesXProducto(sequelize, DataTypes),
  AdicionalesXProductosXPedidos: AdicionalesXProductosXPedidos(sequelize, DataTypes),
  MetodosDePago: MetodosDePago(sequelize, DataTypes),
  Envio: Envio(sequelize, DataTypes),
  Horario: Horario(sequelize, DataTypes),
  Dias: Dias(sequelize, DataTypes),
  HorarioDias: HorarioDias(sequelize, DataTypes),
  Guarniciones: Guarniciones(sequelize, DataTypes),
  Tam: Tam(sequelize, DataTypes),
  GuarnicionesXProducto: GuarnicionesXProducto(sequelize, DataTypes),
  ProductosXTam: ProductosXTam(sequelize, DataTypes),
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