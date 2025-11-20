module.exports = (sequelize, DataTypes) => {
  const Admin = sequelize.define('Admin', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(40),
      allowNull: false
    },
    password: {
      type: DataTypes.STRING(70),
      allowNull: false
    }
  }, {
    tableName: 'admin',
    timestamps: true
  });

  return Admin;
};