module.exports = (sequelize, DataTypes) => {
  const AdicionalesXProductoXPedidos = sequelize.define(
    "AdicionalesXProductoXPedidos",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      idProductoXPedido: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "productos",
          key: "id",
        },
      },
      idAdicional: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "adicionales",
          key: "id",
        },
      },
      Cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      Precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      tableName: "adicionalesXProductoXPedidos",
      timestamps: false,
    }
  );

  AdicionalesXProductoXPedidos.associate = function (models) {
    AdicionalesXProductoXPedidos.belongsTo(models.ProductosXPedido, {
      foreignKey: "idProductoXPedido",
      as: "producto",
    });
    AdicionalesXProductoXPedidos.belongsTo(models.Adicionales, {
      foreignKey: "idAdicional",
      as: "adicional",
    });
  };

  return AdicionalesXProductoXPedidos;
};
