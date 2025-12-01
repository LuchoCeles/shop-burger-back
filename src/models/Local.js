module.exports = (sequelize, DataTypes) => {
  const Local = sequelize.define(
    "Local",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      direccion: {
        type: DataTypes.STRING(60),
        allowNull: false,
      },
      estado: {
        type: DataTypes.TINYINT,
        defaultValue: 1,
      },
    },
    {
      tableName: "Local",
      timestamps: true,
    }
  );

  Local.associate = function (models) {
    Local.hasMany(models.Horario, {
      foreignKey: "idLocal",
      as: "horarios", 
    });
  };

  return Local;
};
