module.exports = (sequelize, DataTypes) => {
  const OtrasPaginas = sequelize.define('OtrasPaginas', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    idConfiguracionPagina: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ConfiguracionPagina', // Nombre de la tabla
        key: 'id'
      }
    },
    nombre: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    url: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    estado: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    tableName: 'OtrasPaginas',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  });

  OtrasPaginas.associate = function (models) {
    // Un enlace pertenece a una única configuración de página
    OtrasPaginas.belongsTo(models.ConfiguracionPagina, {
      foreignKey: 'idConfiguracionPagina',
      as: 'configuracion'
    });
  };

  return OtrasPaginas;
};