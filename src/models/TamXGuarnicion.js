module.exports = (sequelize, DataTypes) => {
  const TamXGuarnicion = sequelize.define(
    "TamXGuarnicion",
    {
       id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      idTam: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Tam", key: "id" },
      },
      idGuarnicion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Guarniciones", key: "id" },
      },
    },
    {
      tableName: "TamXGuarnicion",
      timestamps: true,
    }
  );

  return TamXGuarnicion;
};
