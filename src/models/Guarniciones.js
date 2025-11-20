
module.exports = (sequelize, DataTypes) => {
  const Guarniciones = sequelize.define('Guarniciones', {
        id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      estado: {
        type:DataTypes.TINYINT,
        default: 0,
      }
  }, {
    tableName: 'Guarniciones',
    timestamps: true,
  });

  Guarniciones.associate = function(models) {
    
    Guarniciones.belongsToMany(models.Producto, {
      through: 'GuarnicionesXProducto', 
      foreignKey: 'idGuarnicion',
      otherKey: 'idProducto',
      as: 'productos',
    });
  };

  return Guarniciones;
};