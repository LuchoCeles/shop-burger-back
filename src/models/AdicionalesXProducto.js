module.exports = (sequelize, DataTypes) => {
  const AdicionalesXProducto = sequelize.define('AdicionalesXProductos', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    idProducto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'productos',
        key: 'id'
      }
    },
    idAdicional: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'adicionales',
        key: 'id'
      }
    }
  }, {
    tableName: 'adicionalesxproductos',
    timestamps: false
  });
  
  AdicionalesXProducto.associate = function (models) {
    AdicionalesXProducto.belongsTo(models.Producto, {
      foreignKey: 'idProducto',
      as: 'producto'
    });
    AdicionalesXProducto.belongsTo(models.Adicionales, {
      foreignKey: 'idAdicional',
      as: 'adicional'
    });
  };

  return AdicionalesXProducto;
};