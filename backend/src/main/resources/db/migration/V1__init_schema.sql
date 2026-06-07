-- =================================================================
-- Meca-PRO MES — V1: Schema inicial PostgreSQL
-- Flyway migration: V1__init_schema.sql
-- =================================================================

-- 1. ÁREAS: SIG, Almacén, RH, Producción
CREATE TABLE areas (
    id_area     SERIAL PRIMARY KEY,
    nombre_area VARCHAR(50) NOT NULL UNIQUE
);

-- 2. USUARIOS: Personal de la planta (DNI como PK)
CREATE TABLE usuarios (
    dni             VARCHAR(15)  PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    id_area         INT          REFERENCES areas(id_area) ON DELETE SET NULL,
    puesto          VARCHAR(50),
    activo          BOOLEAN      NOT NULL DEFAULT TRUE
);

-- 3. HOJAS DE PROCESO: Órdenes de trabajo (HP)
CREATE TABLE hojas_proceso (
    id_hp           VARCHAR(20)  PRIMARY KEY,
    descripcion     TEXT,
    pieza           VARCHAR(100),
    material        VARCHAR(100),
    cantidad_total  INT          NOT NULL DEFAULT 1,
    cantidad_buenas INT          NOT NULL DEFAULT 0,
    cantidad_malas  INT          NOT NULL DEFAULT 0,
    estado          VARCHAR(20)  NOT NULL DEFAULT 'PENDIENTE'
                    CHECK (estado IN ('PENDIENTE','EN_PROCESO','TERMINADA','CANCELADA')),
    dni_responsable VARCHAR(15)  REFERENCES usuarios(dni) ON DELETE SET NULL,
    fecha_inicio    TIMESTAMP WITH TIME ZONE,
    fecha_fin       TIMESTAMP WITH TIME ZONE,
    creado_en       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_hp_estado ON hojas_proceso(estado);

-- 4. REGISTRO DE TIEMPOS: Control de actividades (refrigerio, producción, apoyos)
CREATE TABLE registro_tiempos (
    id_registro         BIGSERIAL    PRIMARY KEY,
    dni_operario        VARCHAR(15)  NOT NULL REFERENCES usuarios(dni),
    id_hp               VARCHAR(20)  REFERENCES hojas_proceso(id_hp),
    tipo_actividad      VARCHAR(30)  NOT NULL
                        CHECK (tipo_actividad IN ('PRODUCCION','REFRIGERIO','APOYO','PARADA_TECNICA')),
    hora_inicio         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    hora_fin            TIMESTAMP WITH TIME ZONE,
    duracion_minutos    INT          GENERATED ALWAYS AS (
                            CASE WHEN hora_fin IS NOT NULL
                            THEN EXTRACT(EPOCH FROM (hora_fin - hora_inicio))::INT / 60
                            ELSE NULL END
                        ) STORED,
    justificacion_exceso TEXT,
    requiere_justificacion BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX idx_rt_dni_operario  ON registro_tiempos(dni_operario);
CREATE INDEX idx_rt_id_hp         ON registro_tiempos(id_hp);
CREATE INDEX idx_rt_hora_fin      ON registro_tiempos(hora_fin);

-- 5. PARADAS TÉCNICAS: Fallas de máquina con justificación automática para RRHH
CREATE TABLE paradas_tecnicas (
    id_parada       BIGSERIAL    PRIMARY KEY,
    id_hp           VARCHAR(20)  REFERENCES hojas_proceso(id_hp),
    dni_operario    VARCHAR(15)  NOT NULL REFERENCES usuarios(dni),
    maquina         VARCHAR(50)  NOT NULL,
    causa           VARCHAR(50)  NOT NULL
                    CHECK (causa IN ('FALLA_MECANICA','FALLA_ELECTRICA','FALTA_MATERIAL',
                                     'CAMBIO_HERRAMIENTA','PROGRAMACION','OTRO')),
    descripcion     TEXT,
    hora_inicio     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    hora_fin        TIMESTAMP WITH TIME ZONE,
    duracion_minutos INT         GENERATED ALWAYS AS (
                         CASE WHEN hora_fin IS NOT NULL
                         THEN EXTRACT(EPOCH FROM (hora_fin - hora_inicio))::INT / 60
                         ELSE NULL END
                     ) STORED,
    justificacion_rrhh TEXT,     -- Texto autogenerado para enviar a RRHH
    reportada_rrhh  BOOLEAN      NOT NULL DEFAULT FALSE
);
CREATE INDEX idx_pt_id_hp      ON paradas_tecnicas(id_hp);
CREATE INDEX idx_pt_reportada  ON paradas_tecnicas(reportada_rrhh);

-- 6. CATÁLOGO DE RECURSOS: EPPs y Herramientas
CREATE TABLE catalogo_recursos (
    id_recurso          SERIAL       PRIMARY KEY,
    tipo_recurso        VARCHAR(20)  NOT NULL CHECK (tipo_recurso IN ('EPP','HERRAMIENTA')),
    categoria           VARCHAR(50)  NOT NULL,
    nombre_especifico   VARCHAR(100) NOT NULL,
    unidad_medida       VARCHAR(20)  NOT NULL DEFAULT 'UNIDAD',
    stock_actual        INT          NOT NULL DEFAULT 0 CHECK (stock_actual >= 0),
    stock_minimo        INT          NOT NULL DEFAULT 5,
    activo              BOOLEAN      NOT NULL DEFAULT TRUE,
    UNIQUE (tipo_recurso, categoria, nombre_especifico)
);
CREATE INDEX idx_cr_tipo ON catalogo_recursos(tipo_recurso);

-- 7. SOLICITUDES: Pedidos de EPPs / Herramientas desde planta
CREATE TABLE solicitudes (
    id_solicitud        BIGSERIAL    PRIMARY KEY,
    dni_operario        VARCHAR(15)  NOT NULL REFERENCES usuarios(dni),
    id_recurso          INT          NOT NULL REFERENCES catalogo_recursos(id_recurso),
    cantidad            INT          NOT NULL DEFAULT 1 CHECK (cantidad > 0),
    estado_solicitud    VARCHAR(20)  NOT NULL DEFAULT 'PENDIENTE'
                        CHECK (estado_solicitud IN ('PENDIENTE','PREPARANDO','LISTO','ENTREGADO','CANCELADO')),
    observaciones       TEXT,
    fecha_solicitud     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    fecha_entrega       TIMESTAMP WITH TIME ZONE,
    dni_atendido_por    VARCHAR(15)  REFERENCES usuarios(dni)
);
CREATE INDEX idx_sol_estado     ON solicitudes(estado_solicitud);
CREATE INDEX idx_sol_operario   ON solicitudes(dni_operario);

-- 8. COSTOS DE PRODUCCIÓN: Registro de costos por HP
CREATE TABLE costos_produccion (
    id_costo            BIGSERIAL    PRIMARY KEY,
    id_hp               VARCHAR(20)  NOT NULL REFERENCES hojas_proceso(id_hp),
    concepto            VARCHAR(50)  NOT NULL
                        CHECK (concepto IN ('MANO_OBRA','MATERIAL','HERRAMENTAL','OVERHEAD','OTRO')),
    descripcion         VARCHAR(200),
    monto               NUMERIC(12,2) NOT NULL CHECK (monto >= 0),
    moneda              VARCHAR(5)   NOT NULL DEFAULT 'PEN',
    registrado_por      VARCHAR(15)  REFERENCES usuarios(dni),
    fecha_registro      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_cp_id_hp ON costos_produccion(id_hp);
