const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'ordenes_compra',
  user: 'postgres',
  password: 'alvaro'
});

async function testUltimaOrden() {
  try {
    console.log('🧪 Verificando la última orden creada...\n');

    // Verificar la última orden
    const result = await pool.query(`
      SELECT 
        id, 
        numero_oc, 
        aprobador_id, 
        fecha_creacion,
        proveedor_nombre,
        total
      FROM ordenes_compra.ordenes_compra 
      ORDER BY fecha_creacion DESC 
      LIMIT 1
    `);

    console.log('📋 Última orden:');
    console.table(result.rows);

    if (result.rows.length > 0) {
      const orden = result.rows[0];
      if (orden.aprobador_id) {
        console.log('✅ SUCCESS: La última orden tiene aprobador_id:', orden.aprobador_id);
      } else {
        console.log('❌ PROBLEMA: La última orden NO tiene aprobador_id');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

testUltimaOrden();
