
module.exports = (sequelize, DataTypes) => {
  const Tam = sequelize.define(
    "Tam",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      idCategoria: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "Categoria", key: "id" },
      },
      nombre: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      estado: {
        type: DataTypes.TINYINT,
        default: 0,
      },
    },
    {
      tableName: "Tam",
      timestamps: true,
    }
  );

  Tam.associate = function (models) {
    Tam.hasMany(models.ProductosXTam, {
      foreignKey: "idTam",
      as: "productosXTam",
    });
    
    Tam.belongsTo(models.Categoria,{
      foreignKey : "idCategoria",
      as: 'categorias'
    });

  };
  
  return Tam;
};
