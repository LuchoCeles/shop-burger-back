
module.exports = (sequelize, DataTypes) => {
  const ProductosXTam = sequelize.define(
    "ProductosXTam",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      idProducto: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Producto", key: "id" },
      },
      idTam: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Tam", key: "id" },
      },
      precio: {
        type: DataTypes.DECIMAL(10, 0),
        allowNull: false,
      },
      estado: {
        type: DataTypes.TINYINT,
        default: 0,
      },
    },
    {
      tableName: "ProductosXTam",
      timestamps: true,
    }
  );

  ProductosXTam.associate = function (models) {
    ProductosXTam.belongsTo(models.Producto, {
      foreignKey: "idProducto",
      as: "producto",
    });
    ProductosXTam.belongsTo(models.Tam, {
      foreignKey: "idTam",
      as: "tam",
    });
  };
  
  return ProductosXTam;
};
