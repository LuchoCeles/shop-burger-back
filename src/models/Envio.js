module.exports = (sequelize, DataTypes) => {
  const Envio = sequelize.define('Envio', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    precio: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    estado: {
      type: DataTypes.TINYINT,
      defaultValue: 1
    }
  }, {
    tableName: 'envios',
    timestamps: true
  });

  Envio.associate = (models) =>{
    Envio.hasMany(models.Pedido,{
        foreignKey: "idEnvio",
        as:"pedidos"
    });
  };

  return Envio;
}