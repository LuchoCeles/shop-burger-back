module.exports = (sequelize, DataTypes) => {
  const Telefonos = sequelize.define('Telefonos', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    idConfiguracionPagina: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ConfiguracionPagina',
        key: 'id'
      }
    },
    telefono: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    estado: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    tableName: 'Telefonos',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  });

  Telefonos.associate = function (models) {
    // Un teléfono pertenece a una única configuración de página
    Telefonos.belongsTo(models.ConfiguracionPagina, {
      foreignKey: 'idConfiguracionPagina',
      as: 'configuracion'
    });
  };

  return Telefonos;
};