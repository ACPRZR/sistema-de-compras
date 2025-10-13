const { Pool } = require('pg');
require('dotenv').config();

// Script para probar conexión a RDS
async function testRDSConnection() {
  console.log('🧪 Probando conexión a RDS...');
  console.log('📍 Configuración:');
  console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`   Puerto: ${process.env.DB_PORT || 5432}`);
  console.log(`   Base de datos: ${process.env.DB_NAME || 'ordenes_compra'}`);
  console.log(`   Usuario: ${process.env.DB_USER || 'postgres'}`);
  console.log(`   SSL: ${process.env.DB_SSL || 'false'}`);

  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'ordenes_compra',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  });

  try {
    const result = await pool.query('SELECT NOW() as current_time, version() as postgres_version');
    console.log('✅ ¡Conexión exitosa!');
    console.log(`   Hora actual: ${result.rows[0].current_time}`);
    console.log(`   Versión PostgreSQL: ${result.rows[0].postgres_version}`);
    
    // Probar creación de esquema
    await pool.query('CREATE SCHEMA IF NOT EXISTS ordenes_compra');
    console.log('✅ Esquema ordenes_compra creado/verificado');
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    console.log('\n🔧 Posibles soluciones:');
    console.log('   1. Verificar que la instancia RDS esté ejecutándose');
    console.log('   2. Verificar el Security Group (puerto 5432 abierto)');
    console.log('   3. Verificar las credenciales en .env');
    console.log('   4. Verificar que el endpoint sea correcto');
  } finally {
    await pool.end();
  }
}

testRDSConnection();
