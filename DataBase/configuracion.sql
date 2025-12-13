-- Usar la base de datos
USE shopdb;

-- Eliminar tablas si existen (para facilitar la re-ejecución)
DROP TABLE IF EXISTS Telefonos;
DROP TABLE IF EXISTS Direcciones;
DROP TABLE IF EXISTS OtrasPaginas;
DROP TABLE IF EXISTS ConfiguracionPagina;

---
-- 1. TABLA: ConfiguracionPagina
-- ---
CREATE TABLE ConfiguracionPagina (
    id INT PRIMARY KEY AUTO_INCREMENT,
    metaTitulo VARCHAR(255),
    nombreLocal VARCHAR(255),
    url_logo VARCHAR(255),
    favicon VARCHAR(255),
    slogan VARCHAR(255),
    whatsapp VARCHAR(255),
    email VARCHAR(255),
    copyright VARCHAR(255),
    modoMantenimiento TINYINT NOT NULL DEFAULT 0,
    estado TINYINT NOT NULL DEFAULT 1,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Inserción de datos predeterminados en ConfiguracionPagina
INSERT INTO ConfiguracionPagina (
    metaTitulo,
    nombreLocal,
    url_logo,
    favicon,
    slogan,
    whatsapp,
    email,
    copyright,
    modoMantenimiento,
    estado
) VALUES (
    'Gourmet',
    'Gourmet',
    NULL,
    NULL,
    'Productos Premium',
    'https://wa.me/5492231112233', -- Controlar que sean siempre MeLinks de wsp
    'alimentosgourmet@desarrollo.com',
    '© 2025 Gourmet. Todos los derechos reservados.',
    0,
    1
);


---
-- 2. TABLA: OtrasPaginas
-- ---
CREATE TABLE OtrasPaginas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    idConfiguracionPagina INT NOT NULL,
    nombre VARCHAR(255),
    url VARCHAR(255),
    estado TINYINT NOT NULL DEFAULT 1,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (idConfiguracionPagina) REFERENCES ConfiguracionPagina(id)
);

-- Inserción de datos predeterminados en OtrasPaginas
INSERT INTO OtrasPaginas (idConfiguracionPagina, nombre, url) VALUES
(1, 'Facebook', 'https://www.facebook.com/'),
(1, 'Instagram', 'https://www.instagram.com/');


---
-- 3. TABLA: Direcciones
-- ---
CREATE TABLE Direcciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    idConfiguracionPagina INT NOT NULL,
    direccion VARCHAR(255) UNIQUE, -- No se puede repetir la misma direccion
    estado TINYINT NOT NULL DEFAULT 1,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (idConfiguracionPagina) REFERENCES ConfiguracionPagina(id)
);

-- Inserción de datos predeterminados en Direcciones
INSERT INTO Direcciones (idConfiguracionPagina, direccion) VALUES
(1, 'Calle del Sabor 550, C.P. 7600, Mar del Plata');


---
-- 4. TABLA: Telefonos
-- ---
CREATE TABLE Telefonos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    idConfiguracionPagina INT NOT NULL,
    telefono VARCHAR(255),
    estado TINYINT NOT NULL DEFAULT 1,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (idConfiguracionPagina) REFERENCES ConfiguracionPagina(id)
);

-- Inserción de datos predeterminados en Telefonos
INSERT INTO Telefonos (idConfiguracionPagina, telefono) VALUES
(1, '+54 223 475-8000'),
(1, '+54 9 223 605-9000');