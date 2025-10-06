module.exports = (sequelize, DataTypes) => {
  const Pedido = sequelize.define('Pedido', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    estado: {
      type: DataTypes.ENUM('pendiente','entregado', 'cancelado'),
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
    idCliente: {  // <-- columna para la relación con Cliente
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'clientes',
        key: 'id'
      }
    }
  }, {
    tableName: 'pedidos',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  });

  Pedido.associate = function (models) {
    // Un pedido pertenece a un cliente
    Pedido.belongsTo(models.Cliente, {
      foreignKey: 'idCliente',
      as: 'cliente'
    });

    // Relación muchos a muchos con productos
    Pedido.belongsToMany(models.Producto, {
      through: models.ProductosXPedido,
      foreignKey: 'idPedido',
      otherKey: 'idProducto',
      as: 'productos'
    });

    // Relación uno a uno con pago
    Pedido.hasOne(models.Pago, {
      foreignKey: 'idPedido',
      as: 'pago'
    });
  };

  return Pedido;
};
