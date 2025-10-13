const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'ordenes_compra',
  user: 'postgres',
  password: 'alvaro'
});

async function testAprobadorId() {
  try {
    console.log('🧪 Probando si el aprobador_id se está guardando correctamente...\n');

    // Verificar las últimas 3 órdenes
    const result = await pool.query(`
      SELECT 
        id, 
        numero_oc, 
        aprobador_id, 
        fecha_creacion,
        proveedor_nombre
      FROM ordenes_compra.ordenes_compra 
      ORDER BY fecha_creacion DESC 
      LIMIT 3
    `);

    console.log('📋 Últimas 3 órdenes:');
    console.table(result.rows);

    // Verificar si hay órdenes sin aprobador_id
    const ordenesSinAprobador = result.rows.filter(orden => !orden.aprobador_id);
    
    if (ordenesSinAprobador.length > 0) {
      console.log('\n❌ PROBLEMA: Hay órdenes sin aprobador_id:');
      console.table(ordenesSinAprobador);
    } else {
      console.log('\n✅ Todas las órdenes tienen aprobador_id asignado');
    }

    // Verificar los aprobadores disponibles
    const aprobadores = await pool.query(`
      SELECT id, nombre_completo, cargo, es_aprobador 
      FROM ordenes_compra.usuarios 
      WHERE es_aprobador = true
    `);

    console.log('\n👔 Aprobadores disponibles:');
    console.table(aprobadores.rows);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

testAprobadorId();
