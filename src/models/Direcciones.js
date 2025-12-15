module.exports = (sequelize, DataTypes) => {
  const Direcciones = sequelize.define('Direcciones', {
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
    direccion: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true // Asegurando que la dirección sea única
    },
    estado: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    tableName: 'Direcciones',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  });

  Direcciones.associate = function (models) {
    // Una dirección pertenece a una única configuración de página
    Direcciones.belongsTo(models.ConfiguracionPagina, {
      foreignKey: 'idConfiguracionPagina',
      as: 'configuracion'
    });
  };

  return Direcciones;
};