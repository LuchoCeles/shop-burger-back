module.exports = (sequelize, DataTypes) => {
  const Pedido = sequelize.define('Pedido', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    estado: {
      type: DataTypes.ENUM('pendiente', 'confirmado', 'preparando', 'en_camino', 'entregado', 'cancelado'),
      defaultValue: 'pendiente'
    },
    precioTotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
  }, {
    tableName: 'pedidos',
    timestamps: true
  });

  Pedido.associate = function (models) {
    Pedido.belongsTo(models.Cliente, {
      foreignKey: 'idCliente',
      as: 'cliente'
    });
    Pedido.belongsToMany(models.Producto, {
      through: models.ProductosXPedido,
      foreignKey: 'idPedido',
      as: 'productos'
    });
    Pedido.hasOne(models.Pago, {
      foreignKey: 'idPedido',
      as: 'pago'
    });
  };

  return Pedido;
};