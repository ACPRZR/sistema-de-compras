-- Migración: Agregar tabla de secuencias para números de OC
-- Fecha: 2025-10-13
-- Descripción: Permite generar números de OC únicos desde la base de datos

-- Crear tabla de secuencias/contadores
CREATE TABLE IF NOT EXISTS ordenes_compra.secuencias (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(50) NOT NULL UNIQUE, -- Tipo de secuencia (ej: 'oc', 'factura', etc)
  prefijo VARCHAR(20) NOT NULL, -- Prefijo (ej: 'OC')
  anio INTEGER NOT NULL, -- Año actual de la secuencia
  contador INTEGER NOT NULL DEFAULT 0, -- Contador actual
  ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tipo, anio)
);

-- Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_secuencias_tipo_anio 
ON ordenes_compra.secuencias(tipo, anio);

-- Insertar secuencia inicial para órdenes de compra
INSERT INTO ordenes_compra.secuencias (tipo, prefijo, anio, contador)
VALUES ('orden_compra', 'OC', EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 0)
ON CONFLICT (tipo, anio) DO NOTHING;

-- Comentarios para documentación
COMMENT ON TABLE ordenes_compra.secuencias IS 
'Tabla para gestionar secuencias/contadores de documentos (OC, facturas, etc)';

COMMENT ON COLUMN ordenes_compra.secuencias.tipo IS 
'Tipo de documento: orden_compra, factura, nota_credito, etc';

COMMENT ON COLUMN ordenes_compra.secuencias.contador IS 
'Contador actual. Se incrementa con cada documento generado';

-- Verificar que se creó correctamente
SELECT 
  'Secuencia OC creada' as status,
  tipo,
  prefijo,
  anio,
  contador,
  'Próximo número: ' || prefijo || '-' || anio || '-' || LPAD((contador + 1)::TEXT, 3, '0') as proximo
FROM ordenes_compra.secuencias
WHERE tipo = 'orden_compra';

