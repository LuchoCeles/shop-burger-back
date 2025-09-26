-- Crear la base de datos
CREATE DATABASE shopdb;
USE shopdb;

-- =======================
-- TABLA: Categorias
-- =======================
CREATE TABLE Categorias (
    idCategoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    estado TINYINT DEFAULT 1,
    createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updateAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =======================
-- TABLA: Productos
-- =======================
CREATE TABLE Productos (
    idProducto INT AUTO_INCREMENT PRIMARY KEY,
    idCategoria INT,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    stock INT DEFAULT 0,
    precio DECIMAL(10,2) NOT NULL,
    descuento DECIMAL(5,2) DEFAULT 0,
    estado TINYINT DEFAULT 1,
    isPromocion BOOLEAN DEFAULT 0,
    url_imagen VARCHAR(500),
    createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updateAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_producto_categoria FOREIGN KEY (idCategoria) REFERENCES Categorias(idCategoria)
);

-- =======================
-- TABLA: Pedidos
-- =======================
CREATE TABLE Pedidos (
    idPedido INT AUTO_INCREMENT PRIMARY KEY,
    precioTotal DECIMAL(10,2) DEFAULT 0,
    descripcion TEXT,
    estado VARCHAR(50) DEFAULT 'pendiente',
    createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updateAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =======================
-- TABLA: Clientes
-- =======================
CREATE TABLE Clientes (
    idCliente INT AUTO_INCREMENT PRIMARY KEY,
    idPedido INT,
    direccion VARCHAR(255) NOT NULL,
    descripcion TEXT,
    telefono VARCHAR(40) NOT NULL,
    CONSTRAINT fk_cliente_pedido FOREIGN KEY (idPedido) REFERENCES Pedidos(idPedido)
);

-- =======================
-- TABLA: Productos x Pedidos
-- =======================
CREATE TABLE ProductosXPedidos (
    idPxP INT AUTO_INCREMENT PRIMARY KEY,
    idProducto INT,
    idPedido INT,
    cantidad INT DEFAULT 1,
    createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updateAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_pxp_producto FOREIGN KEY (idProducto) REFERENCES Productos(idProducto),
    CONSTRAINT fk_pxp_pedido FOREIGN KEY (idPedido) REFERENCES Pedidos(idPedido)
);

-- =======================
-- TABLA: Datos Bancarios
-- =======================
CREATE TABLE DatosBancarios (
    idDatosBancarios INT AUTO_INCREMENT PRIMARY KEY,
    cuit VARCHAR(20) NOT NULL,
    alias VARCHAR(100) NOT NULL,
    cbu VARCHAR(50) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updateAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =======================
-- TABLA: Pagos
-- =======================
CREATE TABLE Pagos (
    idPago INT AUTO_INCREMENT PRIMARY KEY,
    idPedido INT,
    idDatosBancarios INT,
    estado VARCHAR(50) DEFAULT 'pendiente',
    createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updateAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_pago_pedido FOREIGN KEY (idPedido) REFERENCES Pedidos(idPedido),
    CONSTRAINT fk_pago_datos FOREIGN KEY (idDatosBancarios) REFERENCES DatosBancarios(idDatosBancarios)
);

-- =======================
-- TABLA: Local
-- =======================
CREATE TABLE Local (
    idContacto INT AUTO_INCREMENT PRIMARY KEY,
    telefono VARCHAR(20),
    direccion VARCHAR(255),
    createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updateAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =======================
-- TABLA: Admin
-- =======================
CREATE TABLE Admin (
    idCategoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updateAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
