const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'ordenes_compra',
  user: 'postgres',
  password: 'alvaro'
});

async function checkTable() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Verificando estructura de tabla usuarios...\n');

    // Ver columnas existentes
    const columns = await client.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_schema = 'ordenes_compra'
        AND table_name = 'usuarios'
      ORDER BY ordinal_position
    `);

    console.log('📋 Columnas existentes en ordenes_compra.usuarios:');
    columns.rows.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type}${col.character_maximum_length ? `(${col.character_maximum_length})` : ''})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkTable();

