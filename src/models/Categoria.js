module.exports = (sequelize, DataTypes) => {
  const Categoria = sequelize.define('Categoria', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    estado: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'categorias',
    timestamps: true
  });

  Categoria.associate = function(models) {
    Categoria.hasMany(models.Producto, {
      foreignKey: 'idCategoria',
      as: 'productos'
    });
  };

  return Categoria;
};