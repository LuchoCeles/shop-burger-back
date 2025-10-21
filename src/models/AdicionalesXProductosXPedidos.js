module.exports = (sequelize, DataTypes) => {
  const AdicionalesXProductosXPedidos = sequelize.define(
    "AdicionalesXProductosXPedidos",
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
      tableName: "AdicionalesXProductosXPedidos",
      timestamps: false,
    }
  );

  AdicionalesXProductosXPedidos.associate = function (models) {
    AdicionalesXProductosXPedidos.belongsTo(models.ProductosXPedido, {
      foreignKey: "idProductoXPedido",
      as: "productoXPedido",
    });
    AdicionalesXProductosXPedidos.belongsTo(models.Adicionales, {
      foreignKey: "idAdicional",
      as: "adicional",
    });
  };

  return AdicionalesXProductosXPedidos;
};
