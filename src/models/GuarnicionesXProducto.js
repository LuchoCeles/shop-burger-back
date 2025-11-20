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
  return GuarnicionesXProducto;
};
