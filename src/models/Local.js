module.exports = (sequelize, DataTypes) => {
  const Local = sequelize.define('Local', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    direccion: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    horario: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    coordenadas: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  }, {
    tableName: 'local',
    timestamps: true
  });

  return Local;
};