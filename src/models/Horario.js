module.exports = (sequelize, DataTypes) => {
  const Horario = sequelize.define(
    "Horario",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      idLocal: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Local',
        key: 'id'
      }
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
      tableName: "horario",
      timestamps: true,
    }
  );


  Horario.associate = function(models) {
  Horario.belongsTo(models.Local, { foreignKey: 'idLocal' });
  Horario.belongsToMany(models.Dias, {
    through: 'horarioDias', 
    foreignKey: 'idHorario',
    otherKey: 'idDia',
    as: 'dias'
  });
};

  return Horario;
};
