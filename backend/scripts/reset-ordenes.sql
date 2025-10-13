-- Script para limpiar órdenes, items y reiniciar contadores
-- Fecha: 2025-10-13

-- 1. Eliminar todos los items de órdenes
DELETE FROM ordenes_compra.orden_items;

-- 2. Eliminar todas las órdenes
DELETE FROM ordenes_compra.ordenes_compra;

-- 3. Reiniciar el contador de órdenes (secuencia)
ALTER SEQUENCE ordenes_compra.ordenes_compra_id_seq RESTART WITH 1;

-- 4. Reiniciar el contador de items (secuencia)
ALTER SEQUENCE ordenes_compra.orden_items_id_seq RESTART WITH 1;

-- 5. Verificar encodings de las tablas principales
-- Mostrar encoding de la base de datos
SELECT pg_encoding_to_char(encoding) as database_encoding 
FROM pg_database 
WHERE datname = current_database();

-- 6. Verificar encoding de las tablas
SELECT 
    schemaname,
    tablename,
    pg_encoding_to_char(pg_table_encoding(schemaname||'.'||tablename)) as encoding
FROM pg_tables 
WHERE schemaname = 'ordenes_compra'
ORDER BY tablename;

-- Mensaje de confirmación
SELECT 
    'Limpieza completada' as status,
    (SELECT COUNT(*) FROM ordenes_compra.ordenes_compra) as ordenes_restantes,
    (SELECT COUNT(*) FROM ordenes_compra.orden_items) as items_restantes;

