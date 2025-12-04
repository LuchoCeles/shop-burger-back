
'use strict';

module.exports = (sequelize, DataTypes) => {
  const HorarioDias = sequelize.define(
    'HorarioXDias',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      idHorario: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Horario',
          key: 'id',
        },
      },
      idDia: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Dias', 
          key: 'id',
        },
      },
    },
    {
      tableName: 'HorarioXDias', 
    }
  );

  HorarioDias.associate = function (models) {
    HorarioDias.belongsTo(models.Horario, {
      foreignKey: 'idHorario',
      as: 'horario', 
    });

    HorarioDias.belongsTo(models.Dias, {
      foreignKey: 'idDia',
      as: 'dia', 
    });
  };

  return HorarioDias;
};