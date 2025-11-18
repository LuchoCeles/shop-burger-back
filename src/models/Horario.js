module.exports = (sequelize, DataTypes) => {
  const Horario = sequelize.define(
    "Horario",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      horarioApertuda: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      horarioCierre: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      estado: {
        type: DataTypes.TINYINT,
        defaultValue: 1,
      },
    },
    {
      tableName: "Horario",
      timestamps: true,
    }
  );

  return Horario;
};
