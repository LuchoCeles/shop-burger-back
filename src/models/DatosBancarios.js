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
    cuit: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    apellido: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    nombre: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'DatosBancarios',
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