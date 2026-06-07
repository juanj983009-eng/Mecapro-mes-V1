-- =================================================================
-- Meca-PRO MES — V3: Añadir columna password_hash a usuarios
-- =================================================================
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Inyectar hash BCrypt limpio y verificado para la contraseña 'password'
UPDATE usuarios SET password_hash = '$2a$10$tCYWvksQTTXTDIChq/wjaukHMU225Dv3ysmycV9D8D7E77KTbLEPe';

ALTER TABLE usuarios ALTER COLUMN password_hash SET NOT NULL;
