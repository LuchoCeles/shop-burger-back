module.exports = (sequelize, DataTypes) => {
  const Local = sequelize.define('Local', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    direccion: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: false
    }
  }, {
    tableName: 'local',
    timestamps: true
  });

  return Local;
};