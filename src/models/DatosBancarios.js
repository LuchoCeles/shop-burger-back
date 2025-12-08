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
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    cuit: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    apellido: {
      type: DataTypes.STRING(50),
      defaultValue: true
    },
    nombre: {
      type: DataTypes.STRING(50),
      defaultValue: true
    },
    password: {
      type: DataTypes.STRING(70),
      allowNull: false,
    },
    mercadoPagoAccessToken: {
      type: DataTypes.STRING(70),
      allowNull: true,
    }
  }, {
    tableName: 'datosBancarios',
    timestamps: true
  });

  DatosBancarios.associate = function (models) {
    DatosBancarios.hasMany(models.Pago, {
      foreignKey: 'idMetodoDePago',
      as: 'pagos'
    });
  };

  return DatosBancarios;
};