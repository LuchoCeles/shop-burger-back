module.exports = (sequelize, DataTypes) => {
  const ProductosXPedido = sequelize.define('ProductosXPedido', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    idPedido: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'pedidos',
        key: 'id'
      }
    },
    idProducto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'productos',
        key: 'id'
      }
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    tableName: 'productos_x_pedido',
    timestamps: false
  });

  ProductosXPedido.associate = function(models) {
    ProductosXPedido.belongsTo(models.Pedido, {
      foreignKey: 'idPedido',
      as: 'pedido'
    });
    ProductosXPedido.belongsTo(models.Producto, {
      foreignKey: 'idProducto',
      as: 'producto'
    });
  };

  return ProductosXPedido;
};