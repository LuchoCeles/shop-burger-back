module.exports = (sequelize, DataTypes) => {
  const Cliente = sequelize.define('Cliente', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    idCliente: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'clientes',
        key: 'idCliente'
      }
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
    timestamps: true
  });

  Cliente.associate = function (models) {
    Cliente.hasMany(models.Pedido, {
      foreignKey: 'idCliente',
      as: 'pedidos'
    });
  };

  return Cliente;
};