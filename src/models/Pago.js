module.exports = (sequelize, DataTypes) => {
  const Pago = sequelize.define('Pago', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    estado: {
      type: DataTypes.ENUM('pendiente', 'aprobado', 'rechazado'),
      defaultValue: 'pendiente'
    },
    idPedido: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'pedidos',
        key: 'id'
      }
    },
    idDatosBancarios: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'DatosBancarios',
        key: 'id'
      }
    }
  }, {
    tableName: 'pagos',
    timestamps: true
  });

  Pago.associate = function (models) {
    Pago.belongsTo(models.Pedido, {
      foreignKey: 'idPedido',
      as: 'pedido'
    });
    Pago.belongsTo(models.DatosBancarios, {
      foreignKey: 'idDatosBancarios',
      as: 'datosBancarios'
    });
  };

  return Pago;
};