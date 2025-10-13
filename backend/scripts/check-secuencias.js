const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'ordenes_compra',
  user: 'postgres',
  password: 'alvaro'
});

async function checkSecuencias() {
  try {
    console.log('🔍 Verificando secuencias actuales...\n');

    // Verificar secuencias
    const secuenciasResult = await pool.query(`
      SELECT * FROM ordenes_compra.secuencias 
      ORDER BY anio, tipo
    `);
    
    console.log('📊 Secuencias en la base de datos:');
    if (secuenciasResult.rows.length > 0) {
      console.table(secuenciasResult.rows);
    } else {
      console.log('❌ No hay secuencias registradas');
    }

    // Verificar últimas órdenes
    const ordenesResult = await pool.query(`
      SELECT id, numero_oc, fecha_creacion, aprobador_id
      FROM ordenes_compra.ordenes_compra 
      ORDER BY fecha_creacion DESC 
      LIMIT 5
    `);
    
    console.log('\n📋 Últimas 5 órdenes:');
    if (ordenesResult.rows.length > 0) {
      console.table(ordenesResult.rows);
    } else {
      console.log('❌ No hay órdenes registradas');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

checkSecuencias();
