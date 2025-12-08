
'use strict';

module.exports = (sequelize, DataTypes) => {
  const HorariosXDias = sequelize.define(
    'HorariosXDias',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      idHorarios: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Horarios',
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
      tableName: 'HorariosXDias', 
    }
  );

  HorariosXDias.associate = function (models) {
    HorariosXDias.belongsTo(models.Horarios, {
      foreignKey: 'idHorarios',
      as: 'horarios', 
    });

    HorariosXDias.belongsTo(models.Dias, {
      foreignKey: 'idDia',
      as: 'dia', 
    });
  };

  return HorariosXDias;
};