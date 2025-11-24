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
      descuento: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
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
    Producto.hasMany(models.ProductosXTam, {
      foreignKey: "idProducto",
      as: "productosXTam",
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
    Producto.belongsToMany(models.Tam, {
      through: models.ProductosXTam,
      foreignKey: "idProducto",
      otherKey: "idTam",
      as: "tamanos",
    });
    Producto.hasMany(models.GuarnicionesXProducto, {
      foreignKey: 'idProducto',
      as: 'guarnicionesXProducto',
    });

  };

  return Producto;
};
