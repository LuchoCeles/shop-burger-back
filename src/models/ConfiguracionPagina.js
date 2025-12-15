module.exports = (sequelize, DataTypes) => {
  const ConfiguracionPagina = sequelize.define('ConfiguracionPagina', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    metaTitulo: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    nombreLocal: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    url_logo: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    favicon: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    slogan: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    whatsapp: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    copyright: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    modoMantenimiento: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0
    },
    estado: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    tableName: 'ConfiguracionPagina',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  });

  ConfiguracionPagina.associate = function (models) {
    // Una configuración de página puede tener varias páginas/enlaces secundarios
    ConfiguracionPagina.hasMany(models.OtrasPaginas, {
      foreignKey: 'idConfiguracionPagina',
      as: 'otrasPaginas'
    });
    // Una configuración de página puede tener múltiples direcciones
    ConfiguracionPagina.hasMany(models.Direcciones, {
      foreignKey: 'idConfiguracionPagina',
      as: 'direcciones'
    });
    // Una configuración de página puede tener múltiples teléfonos
    ConfiguracionPagina.hasMany(models.Telefonos, {
      foreignKey: 'idConfiguracionPagina',
      as: 'telefonos'
    });
  };

  return ConfiguracionPagina;
};