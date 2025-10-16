module.exports = (sequelize, DataTypes) => {
  const Adicionales = sequelize.define('Adicionales', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    precio: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    maxCantidad: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    estado: {
      type: DataTypes.TINYINT,
      defaultValue: 1
    }
  }, {
    tableName: 'adicionales',
    timestamps: true
  });

  return Adicionales;
}