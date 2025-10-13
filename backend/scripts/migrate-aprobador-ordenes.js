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

async function migrate() {
  try {
    console.log('🚀 Ejecutando migración: agregar aprobador_id a ordenes_compra...\n');
    
    const sqlPath = path.join(__dirname, '../migrations/add-aprobador-to-ordenes.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    await pool.query(sql);
    
    console.log('✅ Migración completada exitosamente\n');
    
    // Verificar la columna
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_schema = 'ordenes_compra' 
        AND table_name = 'ordenes_compra' 
        AND column_name = 'aprobador_id'
    `);
    
    if (result.rows.length > 0) {
      console.log('📋 Columna agregada:');
      console.log(`   - ${result.rows[0].column_name} (${result.rows[0].data_type})`);
      console.log(`   - Nullable: ${result.rows[0].is_nullable}`);
    }
    
  } catch (error) {
    console.error('❌ Error en migración:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();

