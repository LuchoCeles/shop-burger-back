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
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =======================
-- TABLA: Pagos
-- =======================
CREATE TABLE Pagos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idPedido INT,
    idDatosBancarios INT,
    estado VARCHAR(50) DEFAULT 'pendiente',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_pago_pedido FOREIGN KEY (idPedido) REFERENCES Pedidos(id),
    CONSTRAINT fk_pago_datos FOREIGN KEY (idDatosBancarios) REFERENCES DatosBancarios(id)
);

-- =======================
-- TABLA: Local
-- =======================
CREATE TABLE Local (
    id INT AUTO_INCREMENT PRIMARY KEY,
    telefono VARCHAR(20),
    direccion VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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