const { Pool } = require('pg');
require('dotenv').config();

// Script para configurar la base de datos de producción
async function setupProductionDB() {
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🚀 Configurando base de datos de producción...');
    console.log(`📍 Conectando a: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    
    // Probar conexión
    const testResult = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Conexión exitosa:', testResult.rows[0].current_time);

    // Crear esquema si no existe
    console.log('📁 Creando esquema ordenes_compra...');
    await pool.query('CREATE SCHEMA IF NOT EXISTS ordenes_compra');
    
    // Configurar search_path
    await pool.query('SET search_path TO ordenes_compra, public');
    
    console.log('✅ Base de datos de producción configurada correctamente');
    console.log('📋 Próximos pasos:');
    console.log('   1. Ejecutar migraciones: node scripts/migrate-all.js');
    console.log('   2. Insertar datos iniciales: node insert-default-data.js');
    
  } catch (error) {
    console.error('❌ Error configurando base de datos:', error);
  } finally {
    await pool.end();
  }
}

setupProductionDB();
