-- Crear la base de datos
CREATE DATABASE shopdb;
USE shopdb;

-- =======================
-- TABLA: Categorias
-- =======================
CREATE TABLE Categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(30) NOT NULL,
    estado TINYINT DEFAULT 1,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =======================
-- TABLA: Productos
-- =======================
CREATE TABLE Productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idCategoria INT,
    idGuarnicionesXProducto INT,
    nombre VARCHAR(50) NOT NULL,
    descripcion VARCHAR(255),
    stock INT DEFAULT 0,
    precio DECIMAL(10,0) NOT NULL,
    descuento INT DEFAULT 0,
    estado TINYINT DEFAULT 1,
    isPromocion BOOLEAN DEFAULT 0,
    url_imagen VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_producto_categoria FOREIGN KEY (idCategoria) REFERENCES Categorias(id)
    );

    CREATE TABLE Guarniciones(
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(25) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    );

-- =======================
-- TABLA: Tam
-- =======================
    CREATE TABLE Tam (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(25),
        estado TINYINT DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

-- =======================
-- TABLA: TamXGuarnicion
-- =======================
    CREATE TABLE TamXGuarnicion (
        id INT AUTO_INCREMENT PRIMARY KEY,
        idTam INT ,  
        idGuarnicion INT , 
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        CONSTRAINT fk_txg_tam FOREIGN KEY (idTam) REFERENCES Tam(id),
        CONSTRAINT fk_txg_guar FOREIGN KEY (idGuarnicion) REFERENCES Guarniciones(id),

        UNIQUE KEY uq_guar_tam (idGuarnicion, idTam)
    );

-- =======================
-- TABLA: GuarnicionesXProducto
-- =======================
CREATE TABLE GuarnicionesXProducto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idProducto INT ,  
    idGuarnicion INT , 
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_gxp_producto FOREIGN KEY (idProducto) REFERENCES Productos(id),
    CONSTRAINT fk_gxp_guarnicion FOREIGN KEY (idGuarnicion) REFERENCES Guarniciones(id),

    UNIQUE KEY uq_producto_guarnicion (idProducto, idGuarnicion)
);


-- =======================
-- TABLA: Adicionales
-- =======================
CREATE TABLE Adicionales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(25) NOT NULL,
    stock INT DEFAULT 0,
    precio DECIMAL(10,0) NOT NULL,
    maxCantidad INT DEFAULT 1,
    estado TINYINT DEFAULT 1,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


-- =======================
-- TABLA: Adicionales x Productos
-- =======================

CREATE TABLE AdicionalesXProductos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idProducto INT,
    idAdicional INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_axp_producto FOREIGN KEY (idProducto) REFERENCES Productos(id),
    CONSTRAINT fk_axp_adicional FOREIGN KEY (idAdicional) REFERENCES Adicionales(id)
);

-- =======================
-- TABLA: Clientes
-- =======================
CREATE TABLE Clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    direccion VARCHAR(60) NOT NULL,
    telefono VARCHAR(20) NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =======================
-- TABLA: Envios
-- =======================
CREATE TABLE Envios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    precio DECIMAL(10,0) NOT NULL,
    estado TINYINT DEFAULT 0 NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
);


-- =======================
-- TABLA: Pedidos
-- =======================
CREATE TABLE Pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idCliente INT,
    idEnvio INT,
    precioTotal DECIMAL(10,0) DEFAULT 0,
    descripcion TEXT,
    estado VARCHAR(30) DEFAULT 'Pendiente',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_pedido_cliente FOREIGN KEY (idCliente) REFERENCES Clientes(id),
    CONSTRAINT fk_pedido_envio FOREIGN KEY (idEnvio) REFERENCES Envios(id)
);

-- =======================
-- TABLA: Productos x Pedidos
-- =======================
CREATE TABLE ProductosXPedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idProducto INT,
    idPedido INT,
    cantidad INT DEFAULT 1,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_pxp_producto FOREIGN KEY (idProducto) REFERENCES Productos(id),
    CONSTRAINT fk_pxp_pedido FOREIGN KEY (idPedido) REFERENCES Pedidos(id)
);

-- =======================
-- TABLA: Adicionales x Productos x Pedidos
-- =======================
CREATE TABLE AdicionalesXProductosXPedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idProductoXPedido INT,
    idAdicional INT,
    cantidad INT DEFAULT 1,
    precio DECIMAL(10,0) DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_axpxp_producto_pedido FOREIGN KEY (idProductoXPedido) REFERENCES ProductosXPedidos(id),
    CONSTRAINT fk_axpxp_adicional FOREIGN KEY (idAdicional) REFERENCES Adicionales(id)
);
-- =======================
-- TABLA: Datos Bancarios
-- =======================
CREATE TABLE DatosBancarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cuit VARCHAR(20) NOT NULL,
    alias VARCHAR(50) NOT NULL,
    cbu VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    password VARCHAR(70) NOT NULL,
    mpEstado TINYINT DEFAULT 0 NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


-- =======================
-- TABLA: Metodos de Pago
-- =======================
CREATE TABLE MetodosDePago (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(30) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =======================
-- TABLA: Pagos
-- =======================
CREATE TABLE Pagos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idPedido INT,
    idMetodoDePago INT,
    estado VARCHAR(50) DEFAULT 'Pendiente',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_pago_pedido FOREIGN KEY (idPedido) REFERENCES Pedidos(id),
    CONSTRAINT fk_pago_datos FOREIGN KEY (idMetodoDePago) REFERENCES MetodosDePago(id)
);

-- =======================
-- TABLA: Admin
-- =======================
CREATE TABLE Admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(40) NOT NULL,
    password VARCHAR(70) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =======================
-- TABLA: Dias
-- =======================

CREATE TABLE Dias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombreDia VARCHAR(10) NOT NULL,
    estado TINYINT(1) DEFAULT 1
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =======================
-- TABLA: Local
-- =======================
CREATE TABLE Local (
    id INT AUTO_INCREMENT PRIMARY KEY,
    direccion VARCHAR(60) NOT NULL,
    estado TINYINT(1) DEFAULT 1,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =======================
-- TABLA: Horarios
-- =======================
CREATE TABLE horario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idLocal INT ,
    horarioApertura TIME NOT NULL,
    horarioCierre TIME NOT NULL,
    estado TINYINT(1) DEFAULT 1,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_horario_local FOREIGN KEY (idLocal) REFERENCES Local(id)
);

CREATE TABLE horarioDias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idHorario INT,
    idDia INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_HD_horario FOREIGN KEY (idHorario) REFERENCES Horario(id),
    CONSTRAINT fk_HD_dia FOREIGN KEY (idDia) REFERENCES Dias(id)
);


INSERT INTO `admin` (`id`, `nombre`, `password`, `createdAt`, `updatedAt`) VALUES (NULL, 'admin', '$2a$12$UxAIzdbWGJq9sctMi7942uTnYzRhMJg1VV65/L2VQdQ0w9vKhKana', current_timestamp(), current_timestamp());

INSERT INTO `DatosBancarios` (`cuit`, `alias`, `cbu`, `apellido`, `nombre`, `password`, `createdAt`, `updatedAt`) 
    VALUES ('20-12345678-9', 'mi_alias_bancario', '1234567890123456789012', 'Perez', 'Juan', '$2a$12$UnGu/sK.zOLy9La4VuMGBeYCrHLw8gzblkYt6/HgjcPbblXgjrfiW', current_timestamp(), current_timestamp());

INSERT INTO `MetodosDePago` (`nombre`, `createdAt`, `updatedAt`) VALUES ('Efectivo', current_timestamp(), current_timestamp());
INSERT INTO `MetodosDePago` (`nombre`, `createdAt`, `updatedAt`) VALUES ('Trasferencia', current_timestamp(), current_timestamp());
INSERT INTO `MetodosDePago` (`nombre`, `createdAt`, `updatedAt`) VALUES ('Mercado Pago', current_timestamp(), current_timestamp());

INSERT INTO Dias (idHorario, nombreDia, estado)
VALUES
  (NULL, 'Lunes', 0),
  (NULL, 'Martes', 0),
  (NULL, 'Miércoles', 0),
  (NULL, 'Jueves', 0),
  (NULL, 'Viernes', 0),
  (NULL, 'Sábado', 0),
  (NULL, 'Domingo', 0);


INSERT INTO Tam (nombre,estado)
VALUES
("Chico",0),
("Mediano",0),
("Grande",0);