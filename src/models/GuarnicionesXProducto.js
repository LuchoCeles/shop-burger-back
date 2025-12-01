"use strict";
module.exports = (sequelize, DataTypes) => {
  const GuarnicionesXProducto = sequelize.define(
    "GuarnicionesXProducto",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      idProducto: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Producto", key: "id" },
      },
      idGuarnicion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Guarnicion", key: "id" },
      },
    },
    {
      tableName: "GuarnicionesXProducto",
      timestamps: true,
    }
  );

  GuarnicionesXProducto.associate = function (models) {
    GuarnicionesXProducto.belongsTo(models.Producto, {
      foreignKey: "idProducto",
      as: "producto",
    });
    GuarnicionesXProducto.belongsTo(models.Guarniciones, {
      foreignKey: "idGuarnicion",
      as: "guarnicion",
    });
  };

  return GuarnicionesXProducto;
};
