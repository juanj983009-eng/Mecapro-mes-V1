-- =================================================================
-- Meca-PRO MES — V2: Datos Semilla (seed data)
-- Flyway migration: V2__seed_data.sql
-- =================================================================

-- 1. ÁREAS BASE DEL SISTEMA
INSERT INTO areas (nombre_area) VALUES
    ('PRODUCCION'),
    ('SIG'),
    ('ALMACEN'),
    ('RRHH'),
    ('GERENCIA');

-- 2. USUARIOS DE EJEMPLO
INSERT INTO usuarios (dni, nombre_completo, id_area, puesto) VALUES
    ('77777777', 'Juan José Parra',        1, 'Operario CNC'),
    ('88888888', 'Carlos Mendoza Ríos',    1, 'Operario Mandrinadora'),
    ('99999999', 'Ana Torres Vega',        2, 'Supervisora SIG'),
    ('11111111', 'Luis Ramírez Castro',    3, 'Jefe de Almacén'),
    ('22222222', 'María García López',     4, 'Analista RRHH');

-- 3. MÁQUINAS DE PRODUCCIÓN
-- Máquinas Convencionales (MAQ-CONV-XXX)
INSERT INTO maquinas (nombre_especifico, tipo) VALUES
    ('Torno Paralelo Universal Pinacho 1.5m [MAQ-CONV-001]', 'MAQUINA_CONVENCIONAL'),
    ('Torno Paralelo Heavy Duty Tos 3.0m [MAQ-CONV-002]', 'MAQUINA_CONVENCIONAL'),
    ('Torno Paralelo de Precision Colchester [MAQ-CONV-003]', 'MAQUINA_CONVENCIONAL'),
    ('Fresadora Universal No. 2 Lagun [MAQ-CONV-004]', 'MAQUINA_CONVENCIONAL'),
    ('Fresadora Universal No. 3 Bridgeport [MAQ-CONV-005]', 'MAQUINA_CONVENCIONAL'),
    ('Taladro de Columna Engranado Erlo 32mm [MAQ-CONV-006]', 'MAQUINA_CONVENCIONAL'),
    ('Taladro de Columna Radial Quantum 50mm [MAQ-CONV-007]', 'MAQUINA_CONVENCIONAL'),
    ('Rectificadora Tangencial Hidraulica Chevalier 300x600 [MAQ-CONV-008]', 'MAQUINA_CONVENCIONAL'),
    ('Rectificadora Tangencial Manual Jones Shipman [MAQ-CONV-009]', 'MAQUINA_CONVENCIONAL'),
    ('Rectificadora Cilindrica Universal Kellenberger [MAQ-CONV-010]', 'MAQUINA_CONVENCIONAL'),
    ('Prensa Hidraulica H-Frame Mega 50 Ton [MAQ-CONV-011]', 'MAQUINA_CONVENCIONAL'),
    ('Prensa Hidraulica C-Frame Larzep 20 Ton [MAQ-CONV-012]', 'MAQUINA_CONVENCIONAL'),
    ('Sierra de Cinta Horizontal Fat 270 [MAQ-CONV-013]', 'MAQUINA_CONVENCIONAL'),
    ('Cepillo de Codo Mecanico Limadora [MAQ-CONV-014]', 'MAQUINA_CONVENCIONAL'),
    ('Limadora de Metales Convencional [MAQ-CONV-015]', 'MAQUINA_CONVENCIONAL');

-- Máquinas CNC (MAQ-CNC-XXX)
INSERT INTO maquinas (nombre_especifico, tipo) VALUES
    ('Centro de Mecanizado Haas VF-2 de 3 Ejes [MAQ-CNC-001]', 'MAQUINA_CNC'),
    ('Centro de Mecanizado Haas VF-5 de 3 Ejes [MAQ-CNC-002]', 'MAQUINA_CNC'),
    ('Centro de Mecanizado Mazak VCN-530C de 3 Ejes [MAQ-CNC-003]', 'MAQUINA_CNC'),
    ('Centro de Mecanizado Haas UMC-750 de 5 Ejes [MAQ-CNC-004]', 'MAQUINA_CNC'),
    ('Centro de Mecanizado Mazak Variaxis C-600 de 5 Ejes [MAQ-CNC-005]', 'MAQUINA_CNC'),
    ('Torno CNC Haas ST-10 con Herramientas Motorizadas [MAQ-CNC-006]', 'MAQUINA_CNC'),
    ('Torno CNC Haas ST-30Y con Eje Y [MAQ-CNC-007]', 'MAQUINA_CNC'),
    ('Torno CNC Mazak Quick Turn 250MY [MAQ-CNC-008]', 'MAQUINA_CNC'),
    ('Cortadora por Hilo EDM Fanuc Robocut C400iC [MAQ-CNC-009]', 'MAQUINA_CNC'),
    ('Cortadora por Hilo EDM Mitsubishi MV1200R [MAQ-CNC-010]', 'MAQUINA_CNC'),
    ('Cortadora por Plasma CNC Hypertherm Powermax [MAQ-CNC-011]', 'MAQUINA_CNC'),
    ('Cortadora por Laser de Fibra Trumpf TruLaser 1030 [MAQ-CNC-012]', 'MAQUINA_CNC'),
    ('Cortadora por Laser de Fibra Bystronic BySmart 3015 [MAQ-CNC-013]', 'MAQUINA_CNC'),
    ('Rectificadora CNC Studer S33 [MAQ-CNC-014]', 'MAQUINA_CNC'),
    ('Dobladora CNC Amada Promecam [MAQ-CNC-015]', 'MAQUINA_CNC');

-- 4. CATÁLOGO DE EPPs (SIG)
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

-- 5. CATÁLOGO HERRAMENTAL Y CONSUMIBLES (Almacén)
-- Brocas
INSERT INTO catalogo_recursos (tipo_recurso, categoria, nombre_especifico, unidad_medida, stock_actual, stock_minimo) VALUES
    ('HERRAMIENTA', 'Brocas',    'HSS 10mm',                                                 'UNIDAD', 15, 3),
    ('HERRAMIENTA', 'Brocas',    'HSS 12mm',                                                 'UNIDAD', 12, 3),
    ('HERRAMIENTA', 'Brocas',    'Carburo 8mm',                                              'UNIDAD',  8, 2),
    ('HERRAMIENTA', 'Brocas',    'Broca Helicoidal HSS 1/8 pulg - Acero Rapido [REF-BRO-001]', 'UNIDAD', 150, 25),
    ('HERRAMIENTA', 'Brocas',    'Broca Helicoidal HSS 1/4 pulg - Acero Rapido [REF-BRO-002]', 'UNIDAD', 120, 20),
    ('HERRAMIENTA', 'Brocas',    'Broca Helicoidal HSS 1/2 pulg - Acero Rapido [REF-BRO-003]', 'UNIDAD', 80, 15),
    ('HERRAMIENTA', 'Brocas',    'Broca Helicoidal HSS 6mm - Acero Rapido [REF-BRO-004]',    'UNIDAD', 100, 18),
    ('HERRAMIENTA', 'Brocas',    'Broca Helicoidal HSS 10mm - Acero Rapido [REF-BRO-005]',   'UNIDAD', 90, 15),
    ('HERRAMIENTA', 'Brocas',    'Broca Helicoidal de Carburo de Tungsteno 8mm [REF-BRO-006]', 'UNIDAD', 45, 8),
    ('HERRAMIENTA', 'Brocas',    'Broca Helicoidal de Carburo de Tungsteno 12mm [REF-BRO-007]', 'UNIDAD', 30, 6),
    ('HERRAMIENTA', 'Brocas',    'Broca de Centrar HSS No. 2 [REF-BRO-008]',                 'UNIDAD', 60, 12),
    ('HERRAMIENTA', 'Brocas',    'Broca de Centrar HSS No. 4 [REF-BRO-009]',                 'UNIDAD', 50, 10),
    ('HERRAMIENTA', 'Brocas',    'Broca con Insertos Intercambiables Sandvik 20mm [REF-BRO-010]', 'UNIDAD', 15, 3),
    ('HERRAMIENTA', 'Brocas',    'Broca con Insertos Intercambiables Kennametal 25mm [REF-BRO-011]', 'UNIDAD', 12, 2);

-- Fresas
INSERT INTO catalogo_recursos (tipo_recurso, categoria, nombre_especifico, unidad_medida, stock_actual, stock_minimo) VALUES
    ('HERRAMIENTA', 'Fresas',    'Extremo 12mm 4F',                                           'UNIDAD', 10, 2),
    ('HERRAMIENTA', 'Fresas',    'Esférica 10mm',                                             'UNIDAD',  6, 2),
    ('HERRAMIENTA', 'Fresas',    'Fresa de Extremo End Mill HSS 2 Gavilanes 6mm [REF-FRE-001]', 'UNIDAD', 40, 8),
    ('HERRAMIENTA', 'Fresas',    'Fresa de Extremo End Mill Carburo 4 Gavilanes 10mm [REF-FRE-002]', 'UNIDAD', 35, 7),
    ('HERRAMIENTA', 'Fresas',    'Fresa de Extremo End Mill Carburo 6 Gavilanes 16mm [REF-FRE-003]', 'UNIDAD', 20, 4),
    ('HERRAMIENTA', 'Fresas',    'Fresa Esferica Ball Nose Carburo 6mm [REF-FRE-004]',       'UNIDAD', 25, 5),
    ('HERRAMIENTA', 'Fresas',    'Fresa Esferica Ball Nose Carburo 12mm [REF-FRE-005]',      'UNIDAD', 18, 4),
    ('HERRAMIENTA', 'Fresas',    'Fresa para Desbaste Roughing End Mill HSS 20mm [REF-FRE-006]', 'UNIDAD', 15, 3),
    ('HERRAMIENTA', 'Fresas',    'Fresa de Planear Face Mill Sandvik 80mm [REF-FRE-007]',     'UNIDAD', 8, 2),
    ('HERRAMIENTA', 'Fresas',    'Fresa de Planear Face Mill Seco Tools 100mm [REF-FRE-008]', 'UNIDAD', 6, 1);

-- Insertos y Cuchillas
INSERT INTO catalogo_recursos (tipo_recurso, categoria, nombre_especifico, unidad_medida, stock_actual, stock_minimo) VALUES
    ('HERRAMIENTA', 'Insertos',  'CNMG 120408',                                              'UNIDAD', 100, 20),
    ('HERRAMIENTA', 'Insertos',  'TNMG 160408',                                              'UNIDAD', 80, 20),
    ('HERRAMIENTA', 'Insertos',  'DCMT 11T304',                                              'UNIDAD', 60, 15),
    ('HERRAMIENTA', 'Insertos',  'Inserto de Carburo Recubierto CVD CNMG 120408-PM [REF-INS-001]', 'UNIDAD', 500, 80),
    ('HERRAMIENTA', 'Insertos',  'Inserto de Carburo Recubierto PVD WNMG 080408-MM [REF-INS-002]', 'UNIDAD', 400, 60),
    ('HERRAMIENTA', 'Insertos',  'Inserto de Carburo Recubierto CVD TNMG 160412-PR [REF-INS-003]', 'UNIDAD', 350, 50),
    ('HERRAMIENTA', 'Insertos',  'Inserto de Carburo Recubierto PVD DCMT 11T304-FP [REF-INS-004]', 'UNIDAD', 300, 45),
    ('HERRAMIENTA', 'Insertos',  'Cuchilla de Cobalto 8% para Tronzado 3/32x1/2x4 [REF-CUCH-001]', 'UNIDAD', 75, 15),
    ('HERRAMIENTA', 'Insertos',  'Cuchilla de Cobalto 10% para Torneado HSS 3/8x3/8x3 [REF-CUCH-002]', 'UNIDAD', 60, 12);

-- Otros herramentales heredados
INSERT INTO catalogo_recursos (tipo_recurso, categoria, nombre_especifico, unidad_medida, stock_actual, stock_minimo) VALUES
    ('HERRAMIENTA', 'Machuelos', 'M10x1.5 HSS',        'UNIDAD',  5, 1),
    ('HERRAMIENTA', 'Machuelos', 'M12x1.75 HSS',       'UNIDAD',  4, 1),
    ('HERRAMIENTA', 'Calibres',  'Micrómetro 0-25mm',  'UNIDAD',  3, 1),
    ('HERRAMIENTA', 'Calibres',  'Vernier 150mm',      'UNIDAD',  5, 1);

-- 6. HOJAS DE PROCESO DE PRUEBA
INSERT INTO hojas_proceso (id_hp, descripcion, pieza, material, cantidad_total, estado, dni_responsable) VALUES
    ('HP2026-001', 'Mecanizado de carcasas de bomba hidráulica', 'Carcasa BH-200', 'Hierro Fundido GG25', 10, 'EN_PROCESO', '77777777'),
    ('HP2026-002', 'Torneado de ejes de transmisión',            'Eje TR-45',      'Acero 1045',          5,  'PENDIENTE',  '88888888'),
    ('HP2026-003', 'Fresado de placas de soporte',               'Placa PS-10',    'Aluminio 6061',       20, 'PENDIENTE',  '77777777');
