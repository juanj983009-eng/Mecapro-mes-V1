-- Insertar Áreas base
INSERT INTO Areas (nombre_area) VALUES ('PRODUCCION'), ('SIG'), ('ALMACEN'), ('RH');

-- Insertar tus 5 tipos de guantes para el catálogo de SIG
INSERT INTO Catalogo_Recursos (tipo_recurso, categoria, nombre_especifico, stock_actual)
VALUES 
('EPP', 'Guantes', 'Nitrilo', 50),
('EPP', 'Guantes', 'Anticorte', 30),
('EPP', 'Guantes', 'Badana', 100),
('EPP', 'Guantes', 'Poliuretano', 40),
('EPP', 'Guantes', 'Cuero', 20);

-- Insertar Herramientas para Almacén
INSERT INTO Catalogo_Recursos (tipo_recurso, categoria, nombre_especifico, stock_actual)
VALUES 
('HERRAMIENTA', 'Brocas', 'Broca HSS 10mm', 15),
('HERRAMIENTA', 'Fresas', 'Fresa de Extremo 12mm', 10),
('HERRAMIENTA', 'Insertos', 'Inserto CNMG 120408', 100);