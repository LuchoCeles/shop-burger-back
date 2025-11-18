module.exports = (sequelize, DataTypes) => {
  const Local = sequelize.define(
    "Local",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
       idDia: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "dia",
          key: "id",
        },
      },
      direccion: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
    },
    {
      tableName: "local",
      timestamps: true,
    }
  );

  return Local;
};
