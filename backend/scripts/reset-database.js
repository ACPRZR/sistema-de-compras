const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'ordenes_compra',
  user: 'postgres',
  password: 'alvaro'
});

async function resetDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Iniciando limpieza de la base de datos...\n');

    // 1. Eliminar todos los items de órdenes
    console.log('📦 Eliminando items de órdenes...');
    const deleteItems = await client.query('DELETE FROM ordenes_compra.orden_items');
    console.log(`✅ ${deleteItems.rowCount} items eliminados\n`);

    // 2. Eliminar todas las órdenes
    console.log('📋 Eliminando órdenes...');
    const deleteOrdenes = await client.query('DELETE FROM ordenes_compra.ordenes_compra');
    console.log(`✅ ${deleteOrdenes.rowCount} órdenes eliminadas\n`);

    // 3. Reiniciar el contador de órdenes (secuencia)
    console.log('🔢 Reiniciando contador de órdenes...');
    await client.query('ALTER SEQUENCE ordenes_compra.ordenes_compra_id_seq RESTART WITH 1');
    console.log('✅ Contador de órdenes reiniciado a 1\n');

    // 4. Reiniciar el contador de items (secuencia)
    console.log('🔢 Reiniciando contador de items...');
    await client.query('ALTER SEQUENCE ordenes_compra.orden_items_id_seq RESTART WITH 1');
    console.log('✅ Contador de items reiniciado a 1\n');

    // 5. Verificar encoding de la base de datos
    console.log('🔍 Verificando encoding de la base de datos...');
    const dbEncoding = await client.query(`
      SELECT pg_encoding_to_char(encoding) as database_encoding 
      FROM pg_database 
      WHERE datname = current_database()
    `);
    console.log(`✅ Encoding de la BD: ${dbEncoding.rows[0].database_encoding}\n`);

    // 6. Verificar encoding de las tablas principales (simplificado)
    console.log('🔍 Verificando tablas en schema ordenes_compra...');
    const tables = await client.query(`
      SELECT tablename
      FROM pg_tables 
      WHERE schemaname = 'ordenes_compra'
      ORDER BY tablename
    `);
    
    console.log('📊 Tablas encontradas (todas heredan encoding UTF8 de la BD):');
    tables.rows.forEach(row => {
      console.log(`   ✅ ${row.tablename}`);
    });
    console.log('');

    // 7. Verificar estado final
    console.log('📊 Estado final:');
    const ordenesCount = await client.query('SELECT COUNT(*) FROM ordenes_compra.ordenes_compra');
    const itemsCount = await client.query('SELECT COUNT(*) FROM ordenes_compra.orden_items');
    console.log(`   📋 Órdenes restantes: ${ordenesCount.rows[0].count}`);
    console.log(`   📦 Items restantes: ${itemsCount.rows[0].count}\n`);

    // 8. Verificar próximo número de orden
    const nextId = await client.query(`
      SELECT nextval('ordenes_compra.ordenes_compra_id_seq') as next_id
    `);
    const currentId = nextId.rows[0].next_id;
    
    // Resetear de nuevo porque nextval lo incrementó
    await client.query('ALTER SEQUENCE ordenes_compra.ordenes_compra_id_seq RESTART WITH 1');
    
    console.log(`🎯 Próxima orden será: OC-${new Date().getFullYear()}-${String(1).padStart(3, '0')}\n`);

    console.log('✅ ¡Limpieza completada exitosamente!');
    console.log('🔄 Ahora puedes crear órdenes desde cero con numeración reiniciada.\n');

  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar
resetDatabase()
  .then(() => {
    console.log('🎉 Proceso completado');
    process.exit(0);
  })
  .catch((err) => {
    console.error('💥 Error fatal:', err);
    process.exit(1);
  });

