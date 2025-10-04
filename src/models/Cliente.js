module.exports = (sequelize, DataTypes) => {
  const Cliente = sequelize.define('Cliente', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    descripcion: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    telefono: {
      type: DataTypes.STRING(40),
      allowNull: false
    },
    direccion: {
      type: DataTypes.TEXT,
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
