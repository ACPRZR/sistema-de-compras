-- Migración para soportar numeración mensual de órdenes
-- Cambiar la columna 'anio' a 'periodo' para soportar formato YYYY-MM

-- Primero, eliminar las secuencias existentes
DELETE FROM ordenes_compra.secuencias WHERE tipo = 'orden_compra';

-- Modificar la tabla para soportar períodos mensuales
ALTER TABLE ordenes_compra.secuencias 
  DROP CONSTRAINT IF EXISTS secuencias_tipo_anio_key;

ALTER TABLE ordenes_compra.secuencias 
  RENAME COLUMN anio TO periodo;

ALTER TABLE ordenes_compra.secuencias 
  ALTER COLUMN periodo TYPE VARCHAR(7);

-- Crear nueva restricción única para tipo + periodo
ALTER TABLE ordenes_compra.secuencias 
  ADD CONSTRAINT secuencias_tipo_periodo_key UNIQUE (tipo, periodo);

-- Insertar secuencia para el período actual (octubre 2025)
INSERT INTO ordenes_compra.secuencias (tipo, prefijo, periodo, contador, ultima_actualizacion)
VALUES ('orden_compra', 'OC', '2025-10', 0, CURRENT_TIMESTAMP);

-- Comentarios para documentar el cambio
COMMENT ON COLUMN ordenes_compra.secuencias.periodo IS 'Período en formato YYYY-MM para numeración mensual';
COMMENT ON TABLE ordenes_compra.secuencias IS 'Secuencias para numeración de documentos. Soporta numeración mensual con formato OC-YYYY-MM-NNN';
