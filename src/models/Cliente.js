module.exports = (sequelize, DataTypes) => {
  const Cliente = sequelize.define('Cliente', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    direccion: {
      type: DataTypes.STRING(60),
      allowNull: true
    }
  }, {
    tableName: 'clientes',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  });

  Cliente.associate = function (models) {
    // Un cliente puede tener muchos pedidos
    Cliente.hasMany(models.Pedido, {
      foreignKey: 'idCliente',
      as: 'pedidos'
    });
  };

  return Cliente;
};
