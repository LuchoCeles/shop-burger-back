module.exports = (sequelize, DataTypes) => {
  const Cliente = sequelize.define('Cliente', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    direccion: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'clientes',
    timestamps: true
  });

  Cliente.associate = function(models) {
    Cliente.hasMany(models.Pedido, {
      foreignKey: 'idCliente',
      as: 'pedidos'
    });
  };

  return Cliente;
};