module.exports = (sequelize, DataTypes) => {
  const MetodosDePago = sequelize.define(
    "MetodosDePago",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      nombre: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
    },
    {
      tableName: "MetodosDePago",
      timestamps: true,
    }
  );

  MetodosDePago.associate = (models) => {
    MetodosDePago.hasMany(models.Pago, {
      as: "pagos",
      foreignKey: "idMetodoDePago",
    });
  };

  return MetodosDePago;
};
