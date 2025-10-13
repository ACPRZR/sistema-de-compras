const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'ordenes_compra',
  user: 'postgres',
  password: 'alvaro'
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Ejecutando migración de secuencias...\n');

    // Leer archivo SQL
    const sqlFile = path.join(__dirname, '../migrations/add-secuencias-oc.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Ejecutar migración
    await client.query(sql);

    console.log('✅ Migración completada exitosamente\n');

    // Verificar resultado
    const result = await client.query(`
      SELECT 
        tipo,
        prefijo,
        anio,
        contador,
        prefijo || '-' || anio || '-' || LPAD((contador + 1)::TEXT, 3, '0') as proximo_numero
      FROM ordenes_compra.secuencias
      WHERE tipo = 'orden_compra'
    `);

    if (result.rows.length > 0) {
      const secuencia = result.rows[0];
      console.log('📊 Estado de la secuencia:');
      console.log(`   Tipo: ${secuencia.tipo}`);
      console.log(`   Prefijo: ${secuencia.prefijo}`);
      console.log(`   Año: ${secuencia.anio}`);
      console.log(`   Contador actual: ${secuencia.contador}`);
      console.log(`   Próximo número: ${secuencia.proximo_numero}\n`);
    }

    console.log('🎉 Sistema listo para generar números de OC desde la BD');

  } catch (error) {
    console.error('❌ Error ejecutando migración:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar
runMigration()
  .then(() => {
    console.log('\n✅ Proceso completado');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n💥 Error fatal:', err);
    process.exit(1);
  });

