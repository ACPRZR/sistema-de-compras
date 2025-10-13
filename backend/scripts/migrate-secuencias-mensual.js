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

async function migrateSecuenciasMensual() {
  try {
    console.log('🔄 Ejecutando migración para numeración mensual...\n');

    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, '..', 'migrations', 'update-secuencias-mensual.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Ejecutar la migración
    await pool.query(sqlContent);

    console.log('✅ Migración ejecutada exitosamente');

    // Verificar el resultado
    const result = await pool.query(`
      SELECT * FROM ordenes_compra.secuencias 
      WHERE tipo = 'orden_compra'
    `);

    console.log('\n📊 Secuencias después de la migración:');
    console.table(result.rows);

    const fechaActual = new Date();
    const anioActual = fechaActual.getFullYear();
    const mesActual = String(fechaActual.getMonth() + 1).padStart(2, '0');
    
    console.log(`\n🎯 Próximo número de orden será: OC-${anioActual}-${mesActual}-001`);

  } catch (error) {
    console.error('❌ Error ejecutando migración:', error);
  } finally {
    await pool.end();
  }
}

migrateSecuenciasMensual();
