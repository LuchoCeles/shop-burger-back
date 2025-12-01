module.exports = (sequelize, DataTypes) => {
  const Dias = sequelize.define(
    "Dias",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombreDia: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      estado: {
        type: DataTypes.TINYINT,
        defaultValue: 1,
      },
    },
    {
      tableName: "dias",
      timestamps: true,
    }
  );

Dias.associate = function(models) {
  Dias.belongsToMany(models.Horario, {
    through: 'horarioDias',
    foreignKey: 'idDia',
    otherKey: 'idHorario',
    as: 'horarios'
  });
};

  return Dias;
};
