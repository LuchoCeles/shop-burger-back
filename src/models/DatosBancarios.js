module.exports = (sequelize, DataTypes) => {
  const DatosBancarios = sequelize.define('DatosBancarios', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    alias: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    cbu: {
      type: DataTypes.STRING(22),
      allowNull: false,
      unique: true
    },
    titular: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'datos_bancarios',
    timestamps: true
  });

  DatosBancarios.associate = function(models) {
    DatosBancarios.hasMany(models.Pago, {
      foreignKey: 'idDatosBancarios',
      as: 'pagos'
    });
  };

  return DatosBancarios;
};