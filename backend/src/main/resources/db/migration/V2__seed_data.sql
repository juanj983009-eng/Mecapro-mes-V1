-- =================================================================
-- Meca-PRO MES — V2: Datos Semilla (seed data)
-- Flyway migration: V2__seed_data.sql
-- =================================================================

-- Áreas base del sistema
INSERT INTO areas (nombre_area) VALUES
    ('PRODUCCION'),
    ('SIG'),
    ('ALMACEN'),
    ('RRHH'),
    ('GERENCIA');

-- Usuarios de ejemplo (operarios y supervisores)
INSERT INTO usuarios (dni, nombre_completo, id_area, puesto) VALUES
    ('77777777', 'Juan José Parra',        1, 'Operario CNC'),
    ('88888888', 'Carlos Mendoza Ríos',    1, 'Operario Mandrinadora'),
    ('99999999', 'Ana Torres Vega',        2, 'Supervisora SIG'),
    ('11111111', 'Luis Ramírez Castro',    3, 'Jefe de Almacén'),
    ('22222222', 'María García López',     4, 'Analista RRHH');

-- Catálogo EPPs (SIG)
INSERT INTO catalogo_recursos (tipo_recurso, categoria, nombre_especifico, unidad_medida, stock_actual, stock_minimo) VALUES
    ('EPP', 'Guantes',    'Nitrilo Talla M',         'PAR',    50, 10),
    ('EPP', 'Guantes',    'Anticorte Nivel 5',        'PAR',    30, 5),
    ('EPP', 'Guantes',    'Badana Cuero',             'PAR',   100, 15),
    ('EPP', 'Guantes',    'Poliuretano Talla L',      'PAR',    40, 10),
    ('EPP', 'Guantes',    'Cuero Soldador',           'PAR',    20, 5),
    ('EPP', 'Lentes',     'Seguridad Claro',          'UNIDAD', 80, 10),
    ('EPP', 'Lentes',     'Seguridad Oscuro',         'UNIDAD', 60, 10),
    ('EPP', 'Protector',  'Auditivo Tapón',           'PAR',   200, 30),
    ('EPP', 'Casco',      'Blanco Jefatura',          'UNIDAD', 15, 3),
    ('EPP', 'Casco',      'Amarillo Operario',        'UNIDAD', 25, 5);

-- Catálogo Herramental (Almacén)
INSERT INTO catalogo_recursos (tipo_recurso, categoria, nombre_especifico, unidad_medida, stock_actual, stock_minimo) VALUES
    ('HERRAMIENTA', 'Brocas',    'HSS 10mm',           'UNIDAD', 15, 3),
    ('HERRAMIENTA', 'Brocas',    'HSS 12mm',           'UNIDAD', 12, 3),
    ('HERRAMIENTA', 'Brocas',    'Carburo 8mm',        'UNIDAD',  8, 2),
    ('HERRAMIENTA', 'Fresas',    'Extremo 12mm 4F',    'UNIDAD', 10, 2),
    ('HERRAMIENTA', 'Fresas',    'Esférica 10mm',      'UNIDAD',  6, 2),
    ('HERRAMIENTA', 'Insertos',  'CNMG 120408',        'UNIDAD',100, 20),
    ('HERRAMIENTA', 'Insertos',  'TNMG 160408',        'UNIDAD', 80, 20),
    ('HERRAMIENTA', 'Insertos',  'DCMT 11T304',        'UNIDAD', 60, 15),
    ('HERRAMIENTA', 'Machuelos', 'M10x1.5 HSS',        'UNIDAD',  5, 1),
    ('HERRAMIENTA', 'Machuelos', 'M12x1.75 HSS',       'UNIDAD',  4, 1),
    ('HERRAMIENTA', 'Calibres',  'Micrómetro 0-25mm',  'UNIDAD',  3, 1),
    ('HERRAMIENTA', 'Calibres',  'Vernier 150mm',      'UNIDAD',  5, 1);

-- HP de ejemplo para pruebas
INSERT INTO hojas_proceso (id_hp, descripcion, pieza, material, cantidad_total, estado, dni_responsable) VALUES
    ('HP2026-001', 'Mecanizado de carcasas de bomba hidráulica', 'Carcasa BH-200', 'Hierro Fundido GG25', 10, 'EN_PROCESO', '77777777'),
    ('HP2026-002', 'Torneado de ejes de transmisión',            'Eje TR-45',      'Acero 1045',          5,  'PENDIENTE',  '88888888'),
    ('HP2026-003', 'Fresado de placas de soporte',               'Placa PS-10',    'Aluminio 6061',       20, 'PENDIENTE',  '77777777');
