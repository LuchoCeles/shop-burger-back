module.exports = (sequelize, DataTypes) => {
  const Producto = sequelize.define(
    "Producto",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      descuento: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0,
      },
      precioFinal: {
        type: DataTypes.VIRTUAL,
        get() {
          const descuento = this.getDataValue("descuento") || 0;
          const precio = parseFloat(this.getDataValue("precio"));
          return precio * (1 - descuento / 100);
        },
      },
      stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      isPromocion: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      url_imagen: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      idCategoria: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "categorias",
          key: "id",
        },
      },
      nombrecategoria: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.categoria ? this.categoria.nombre : null;
        },
      },
    },
    {
      tableName: "productos",
      timestamps: true,
    }
  );

  Producto.associate = function (models) {
    Producto.belongsTo(models.Categoria, {
      foreignKey: "idCategoria",
      as: "categoria",
    });
    Producto.belongsToMany(models.Pedido, {
      through: models.ProductosXPedido,
      foreignKey: "idProducto",
      as: "pedidos",
    });
    Producto.hasMany(models.ProductosXPedido, {
      foreignKey: "idProducto",
      as: "productosXPedido",
    });
    Producto.hasMany(models.AdicionalesXProducto, {
      foreignKey: "idProducto",
      as: "adicionalesXProducto",
    });

    Producto.belongsToMany(models.Adicionales, {
      through: models.AdicionalesXProducto,
      foreignKey: "idProducto",
      otherKey: "idAdicional",
      as: "adicionales",
    });

    Producto.belongsToMany(models.Guarniciones, {
      through: models.GuarnicionesXProducto,
      foreignKey: 'idProducto',
      otherKey: 'idGuarnicion',
      as: 'guarniciones',
    });

  };

  return Producto;
};
