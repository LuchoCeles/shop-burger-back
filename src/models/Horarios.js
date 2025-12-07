module.exports = (sequelize, DataTypes) => {
  const Horarios = sequelize.define(
    "Horarios",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      horarioApertura: {
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
      tableName: "horarios",
      timestamps: true,
    }
  );


  Horarios.associate = function(models) {

  Horarios.belongsToMany(models.Dias, {
    through: 'horarioDias', 
    foreignKey: 'idHorarios',
    otherKey: 'idDia',
    as: 'dias'
  });
};

  return Horarios;
};
