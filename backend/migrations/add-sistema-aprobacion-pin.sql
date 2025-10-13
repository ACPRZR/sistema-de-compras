-- Migración: Sistema de Aprobación con PIN + DNI
-- Fecha: 2025-10-13
-- Descripción: Agregar campos para aprobación con PIN y DNI, y tabla de auditoría

-- =====================================================
-- 1. EXTENDER TABLA DE USUARIOS
-- =====================================================

-- Agregar campos para aprobadores
ALTER TABLE ordenes_compra.usuarios
ADD COLUMN IF NOT EXISTS es_aprobador BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS cargo VARCHAR(100),
ADD COLUMN IF NOT EXISTS dni VARCHAR(8),
ADD COLUMN IF NOT EXISTS pin_aprobacion VARCHAR(255), -- Hash bcrypt del PIN
ADD COLUMN IF NOT EXISTS firma_imagen TEXT, -- Base64 de firma (opcional, para fase 2)
ADD COLUMN IF NOT EXISTS puede_aprobar_sin_limite BOOLEAN DEFAULT false;

-- Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_usuarios_dni ON ordenes_compra.usuarios(dni);
CREATE INDEX IF NOT EXISTS idx_usuarios_aprobador ON ordenes_compra.usuarios(es_aprobador) WHERE es_aprobador = true;

-- =====================================================
-- 2. TABLA DE APROBACIONES (AUDITORÍA)
-- =====================================================

CREATE TABLE IF NOT EXISTS ordenes_compra.aprobaciones_ordenes (
  id SERIAL PRIMARY KEY,
  orden_id INTEGER NOT NULL REFERENCES ordenes_compra.ordenes_compra(id) ON DELETE CASCADE,
  usuario_id INTEGER REFERENCES ordenes_compra.usuarios(id),
  nombre_completo VARCHAR(200) NOT NULL,
  cargo VARCHAR(100),
  dni VARCHAR(8) NOT NULL,
  fecha_aprobacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_aprobacion VARCHAR(45),
  user_agent TEXT, -- Información del navegador/dispositivo
  firma_digital TEXT, -- Base64 de la firma (opcional)
  metodo_autenticacion VARCHAR(20) DEFAULT 'pin', -- 'pin', 'firma_digital', 'biometrico'
  observaciones TEXT,
  token_usado VARCHAR(64), -- Token que se usó para aprobar
  
  -- Constraint para evitar múltiples aprobaciones de la misma orden
  CONSTRAINT uk_orden_aprobacion UNIQUE(orden_id)
);

-- Índices para búsquedas y reportes
CREATE INDEX IF NOT EXISTS idx_aprobaciones_orden ON ordenes_compra.aprobaciones_ordenes(orden_id);
CREATE INDEX IF NOT EXISTS idx_aprobaciones_usuario ON ordenes_compra.aprobaciones_ordenes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_aprobaciones_dni ON ordenes_compra.aprobaciones_ordenes(dni);
CREATE INDEX IF NOT EXISTS idx_aprobaciones_fecha ON ordenes_compra.aprobaciones_ordenes(fecha_aprobacion);

-- =====================================================
-- 3. INSERTAR APROBADORES INICIALES
-- =====================================================

-- NOTA: Los PINs están hasheados con bcrypt
-- Para generar hash de PIN en Node.js: bcrypt.hash('1234', 10)
-- Estos son ejemplos temporales, deben cambiarse en producción

-- Eliminar usuarios aprobadores existentes (si los hay) para evitar duplicados
DELETE FROM ordenes_compra.usuarios 
WHERE email IN ('presidente@ladp.org', 'secretaria@ladp.org');

-- Aprobador 1: Juan Colqui Solorzano (Presidente)
INSERT INTO ordenes_compra.usuarios 
(nombre_completo, email, cargo, dni, pin_aprobacion, es_aprobador, puede_aprobar_sin_limite, activo, username)
VALUES 
(
  'Juan Colqui Solorzano',
  'presidente@ladp.org',
  'Presidente',
  '00000000', -- DNI temporal, actualizar mañana
  '$2a$10$rBV2kVZ4fF5qN7W3zJxRGOYGHvJZLT.bKZ8YqH0rZQl6QxKFQ0C8O', -- PIN: 1234 (CAMBIAR EN PRODUCCIÓN)
  true,
  true, -- Puede aprobar sin límite de monto
  true,
  'jcolqui'
);

-- Aprobador 2: Janette Cerna Velazquez (Secretaria)
INSERT INTO ordenes_compra.usuarios 
(nombre_completo, email, cargo, dni, pin_aprobacion, es_aprobador, puede_aprobar_sin_limite, activo, username)
VALUES 
(
  'Janette Cerna Velazquez',
  'secretaria@ladp.org',
  'Secretaria',
  '00000001', -- DNI temporal, actualizar mañana
  '$2a$10$rBV2kVZ4fF5qN7W3zJxRGOYGHvJZLT.bKZ8YqH0rZQl6QxKFQ0C8O', -- PIN: 1234 (CAMBIAR EN PRODUCCIÓN)
  true,
  true, -- Puede aprobar sin límite de monto
  true,
  'jcerna'
);

-- =====================================================
-- 4. COMENTARIOS PARA DOCUMENTACIÓN
-- =====================================================

COMMENT ON COLUMN ordenes_compra.usuarios.es_aprobador IS 
'Indica si el usuario está autorizado para aprobar órdenes de compra';

COMMENT ON COLUMN ordenes_compra.usuarios.dni IS 
'DNI del usuario (8 dígitos). Requerido para aprobadores';

COMMENT ON COLUMN ordenes_compra.usuarios.pin_aprobacion IS 
'Hash bcrypt del PIN de 4 dígitos para aprobar órdenes';

COMMENT ON COLUMN ordenes_compra.usuarios.puede_aprobar_sin_limite IS 
'Si true, puede aprobar órdenes de cualquier monto sin restricciones';

COMMENT ON TABLE ordenes_compra.aprobaciones_ordenes IS 
'Registro de auditoría de todas las aprobaciones de órdenes. Incluye información del aprobador y timestamp';

COMMENT ON COLUMN ordenes_compra.aprobaciones_ordenes.token_usado IS 
'Token de aprobación que se utilizó. Permite trazabilidad del link de WhatsApp usado';

COMMENT ON COLUMN ordenes_compra.aprobaciones_ordenes.user_agent IS 
'Información del navegador/dispositivo usado para aprobar. Útil para auditoría';

-- =====================================================
-- 5. VERIFICACIÓN
-- =====================================================

-- Mostrar aprobadores registrados
SELECT 
  id,
  nombre_completo,
  cargo,
  dni,
  email,
  es_aprobador,
  puede_aprobar_sin_limite,
  CASE WHEN pin_aprobacion IS NOT NULL THEN '✓ Configurado' ELSE '✗ No configurado' END as pin_status
FROM ordenes_compra.usuarios
WHERE es_aprobador = true;

-- Verificar estructura de tabla de aprobaciones
SELECT 
  'Tabla aprobaciones_ordenes creada correctamente' as status,
  COUNT(*) as registros_actuales
FROM ordenes_compra.aprobaciones_ordenes;

