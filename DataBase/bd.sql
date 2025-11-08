-- Crear la base de datos
CREATE DATABASE shopdb;
USE shopdb;

-- =======================
-- TABLA: Categorias
-- =======================
CREATE TABLE Categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
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
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    stock INT DEFAULT 0,
    precio DECIMAL(10,2) NOT NULL,
    descuento DECIMAL(5,2) DEFAULT 0,
    estado TINYINT DEFAULT 1,
    isPromocion BOOLEAN DEFAULT 0,
    url_imagen VARCHAR(500),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_producto_categoria FOREIGN KEY (idCategoria) REFERENCES Categorias(id)
);

-- =======================
-- TABLA: Adicionales
-- =======================
CREATE TABLE Adicionales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    stock INT DEFAULT 0,
    precio DECIMAL(10,2) NOT NULL,
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
    direccion VARCHAR(255) NOT NULL,
    telefono VARCHAR(40) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =======================
-- TABLA: Pedidos
-- =======================
CREATE TABLE Pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idCliente INT,
    precioTotal DECIMAL(10,2) DEFAULT 0,
    descripcion TEXT,
    estado VARCHAR(50) DEFAULT 'pendiente',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_pedido_cliente FOREIGN KEY (idCliente) REFERENCES Clientes(id)
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
    precio DECIMAL(10,2) DEFAULT 0,
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
    alias VARCHAR(100) NOT NULL,
    cbu VARCHAR(50) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    mpEstado TINYINT DEFAULT 0 NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


-- =======================
-- TABLA: Metodos de Pago
-- =======================
CREATE TABLE MetodosDePago (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
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
    CONSTRAINT fk_pago_datos FOREIGN KEY (idMetodoDePago) REFERENCES idMetodoDePago(id)
);

-- =======================
-- TABLA: Admin
-- =======================
CREATE TABLE Admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


INSERT INTO `admin` (`id`, `nombre`, `password`, `createdAt`, `updatedAt`) VALUES (NULL, 'admin', '$2a$12$UxAIzdbWGJq9sctMi7942uTnYzRhMJg1VV65/L2VQdQ0w9vKhKana', current_timestamp(), current_timestamp());

INSERT INTO `DatosBancarios` (`cuit`, `alias`, `cbu`, `apellido`, `nombre`, `password`, `createdAt`, `updatedAt`) 
    VALUES ('20-12345678-9', 'mi_alias_bancario', '1234567890123456789012', 'Perez', 'Juan', '$2a$12$UnGu/sK.zOLy9La4VuMGBeYCrHLw8gzblkYt6/HgjcPbblXgjrfiW', current_timestamp(), current_timestamp());

INSERT INTO `MetodosDePago` (`nombre`, `createdAt`, `updatedAt`) VALUES ('Efectivo', current_timestamp(), current_timestamp());
INSERT INTO `MetodosDePago` (`nombre`, `createdAt`, `updatedAt`) VALUES ('Trasferencia', current_timestamp(), current_timestamp());
INSERT INTO `MetodosDePago` (`nombre`, `createdAt`, `updatedAt`) VALUES ('Mercado Pago', current_timestamp(), current_timestamp());
