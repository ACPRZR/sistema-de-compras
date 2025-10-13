const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Script para ejecutar todas las migraciones en orden
async function runAllMigrations() {
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🚀 Ejecutando migraciones de base de datos...');
    
    // Lista de migraciones en orden
    const migrations = [
      'add-secuencias-oc.sql',
      'add-sistema-aprobacion-pin.sql',
      'add-aprobador-to-ordenes.sql'
    ];

    for (const migration of migrations) {
      const migrationPath = path.join(__dirname, '..', 'migrations', migration);
      
      if (fs.existsSync(migrationPath)) {
        console.log(`📄 Ejecutando migración: ${migration}`);
        const sql = fs.readFileSync(migrationPath, 'utf8');
        await pool.query(sql);
        console.log(`✅ Migración ${migration} completada`);
      } else {
        console.log(`⚠️ Migración no encontrada: ${migration}`);
      }
    }

    console.log('🎉 Todas las migraciones completadas exitosamente');
    
  } catch (error) {
    console.error('❌ Error ejecutando migraciones:', error);
  } finally {
    await pool.end();
  }
}

runAllMigrations();
