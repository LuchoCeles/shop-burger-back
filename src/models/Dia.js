module.exports = (sequelize, DataTypes) => {
  const Dia = sequelize.define('Dia', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    idHorario: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "horario",
          key: "id",
        },
      },
   nombreDia: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
    estado: {
      type: DataTypes.TINYINT,
      defaultValue: 1
    }
  }, {
    tableName: 'dia',
    timestamps: true
  });

  return Dia;
}