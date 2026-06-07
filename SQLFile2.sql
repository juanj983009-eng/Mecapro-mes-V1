-- 1. Creamos la base de datos
CREATE DATABASE MecaProDB;
GO

USE MecaProDB;
GO

-- 2. ÁREAS: Define quién es dueño de qué información (SIG, Almacén, RH)
CREATE TABLE Areas (
    id_area INT PRIMARY KEY IDENTITY(1,1),
    nombre_area VARCHAR(50) NOT NULL
);

-- 3. USUARIOS: Información del personal. El DNI será nuestra llave principal (PK)
CREATE TABLE Usuarios (
    dni VARCHAR(15) PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    id_area INT FOREIGN KEY REFERENCES Areas(id_area),
    puesto VARCHAR(50)
);

-- 4. HPS: Las Órdenes de Trabajo que vienen de programación (Infotech)
CREATE TABLE Hps_Programadas (
    id_hp VARCHAR(20) PRIMARY KEY,
    descripcion TEXT,
    estado VARCHAR(20) DEFAULT 'PENDIENTE' -- PENDIENTE, EN PROCESO, TERMINADA
);

-- 5. CATÁLOGO: Tus EPPs y Herramientas específicas
CREATE TABLE Catalogo_Recursos (
    id_recurso INT PRIMARY KEY IDENTITY(1,1),
    tipo_recurso VARCHAR(20), -- 'EPP' o 'HERRAMIENTA'
    categoria VARCHAR(50),    -- Guantes, Insertos, Brocas
    nombre_especifico VARCHAR(100),
    stock_actual INT DEFAULT 0
);

-- 6. REGISTRO DE TIEMPOS: El "Escudo" contra RH. Controla tus 30 min.
CREATE TABLE Registro_Tiempos (
    id_registro INT PRIMARY KEY IDENTITY(1,1),
    dni_operario VARCHAR(15) FOREIGN KEY REFERENCES Usuarios(dni),
    id_hp VARCHAR(20) FOREIGN KEY REFERENCES Hps_Programadas(id_hp),
    tipo_actividad VARCHAR(50), -- PRODUCCION, REFRIGERIO, APOYO, FALLA_TECNICA
    hora_inicio DATETIME DEFAULT GETDATE(),
    hora_fin DATETIME NULL,
    justificacion_exceso TEXT NULL
);

-- 7. SOLICITUDES: La conexión en tiempo real con SIG y Almacén
CREATE TABLE Solicitudes (
    id_solicitud INT PRIMARY KEY IDENTITY(1,1),
    dni_operario VARCHAR(15) FOREIGN KEY REFERENCES Usuarios(dni),
    id_recurso INT FOREIGN KEY REFERENCES Catalogo_Recursos(id_recurso),
    estado_solicitud VARCHAR(20) DEFAULT 'PENDIENTE', -- PENDIENTE, PREPARANDO, LISTO
    fecha_solicitud DATETIME DEFAULT GETDATE()
);


SELECT * FROM Catalogo_Recursos;