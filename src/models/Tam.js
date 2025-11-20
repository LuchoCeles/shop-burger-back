
module.exports = (sequelize, DataTypes) => {
  const Tam = sequelize.define(
    "Tam",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      estado: {
        type: DataTypes.TINYINT,
        default: 0,
      },
    },
    {
      tableName: "Tam",
      timestamps: true,
    }
  );

  Tam.associate = function (models) {
    Tam.belongsToMany(models.Guarniciones, {
      through: models.TamXGuarnicion,
      foreignKey: "idTam",
      otherKey: "idGuarnicion",
      as: "guarniciones",
    });
  };
  return Tam;
};
