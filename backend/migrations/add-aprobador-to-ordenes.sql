-- Agregar campo aprobador_id a ordenes_compra
-- Este campo indica quién debe aprobar la orden

ALTER TABLE ordenes_compra.ordenes_compra
ADD COLUMN IF NOT EXISTS aprobador_id INTEGER REFERENCES ordenes_compra.usuarios(id);

-- Agregar índice para mejorar búsquedas
CREATE INDEX IF NOT EXISTS idx_ordenes_aprobador 
ON ordenes_compra.ordenes_compra(aprobador_id);

-- Comentario para documentar
COMMENT ON COLUMN ordenes_compra.ordenes_compra.aprobador_id 
IS 'Usuario que debe aprobar esta orden (Presidente o Secretaria)';

