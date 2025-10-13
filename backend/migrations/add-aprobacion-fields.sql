-- Migración: Agregar campos para sistema de aprobación por WhatsApp
-- Fecha: 2025-10-11
-- Descripción: Permite generar tokens únicos para aprobar/rechazar órdenes vía links

-- Agregar columnas para el sistema de aprobación
ALTER TABLE ordenes_compra.ordenes_compra
ADD COLUMN IF NOT EXISTS token_aprobacion VARCHAR(64) UNIQUE,
ADD COLUMN IF NOT EXISTS token_creado_fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS token_expira_fecha TIMESTAMP,
ADD COLUMN IF NOT EXISTS token_usado BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS aprobada_por VARCHAR(200),
ADD COLUMN IF NOT EXISTS aprobada_fecha TIMESTAMP,
ADD COLUMN IF NOT EXISTS aprobada_ip VARCHAR(45),
ADD COLUMN IF NOT EXISTS rechazada_por VARCHAR(200),
ADD COLUMN IF NOT EXISTS rechazada_fecha TIMESTAMP,
ADD COLUMN IF NOT EXISTS rechazada_motivo TEXT,
ADD COLUMN IF NOT EXISTS rechazada_ip VARCHAR(45),
ADD COLUMN IF NOT EXISTS completada_por VARCHAR(200),
ADD COLUMN IF NOT EXISTS completada_fecha TIMESTAMP,
ADD COLUMN IF NOT EXISTS completada_ip VARCHAR(45);

-- Crear índice para búsquedas rápidas por token
CREATE INDEX IF NOT EXISTS idx_token_aprobacion 
ON ordenes_compra.ordenes_compra(token_aprobacion);

-- Crear índice para búsquedas por estado y fecha
CREATE INDEX IF NOT EXISTS idx_estado_fecha 
ON ordenes_compra.ordenes_compra(estado_id, fecha_creacion);

-- Comentarios para documentación
COMMENT ON COLUMN ordenes_compra.ordenes_compra.token_aprobacion IS 
'Token único de 64 caracteres para aprobar/rechazar la orden vía link';

COMMENT ON COLUMN ordenes_compra.ordenes_compra.token_expira_fecha IS 
'Fecha de expiración del token (48 horas por defecto)';

COMMENT ON COLUMN ordenes_compra.ordenes_compra.token_usado IS 
'Indica si el token ya fue utilizado (una sola vez)';

COMMENT ON COLUMN ordenes_compra.ordenes_compra.aprobada_por IS 
'Nombre de la persona que aprobó la orden';

COMMENT ON COLUMN ordenes_compra.ordenes_compra.rechazada_motivo IS 
'Motivo opcional por el cual se rechazó la orden';

