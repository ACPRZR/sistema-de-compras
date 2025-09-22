const { Pool } = require('pg');
require('dotenv').config();

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'ordenes_compra',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 20, // Máximo de conexiones en el pool
  idleTimeoutMillis: 30000, // Tiempo de espera antes de cerrar conexiones inactivas
  connectionTimeoutMillis: 2000, // Tiempo de espera para obtener conexión
  searchPath: 'ordenes_compra, public' // Configurar esquema de búsqueda
};

// Crear pool de conexiones
const pool = new Pool(dbConfig);

// Eventos del pool
pool.on('connect', () => {
  console.log('✅ Conexión a la base de datos establecida');
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en el pool de conexiones:', err);
  process.exit(-1);
});

// Función para ejecutar consultas
const query = async (text, params) => {
  const start = Date.now();
  try {
    // Establecer search_path antes de cada consulta
    await pool.query('SET search_path TO ordenes_compra, public');
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('📊 Query ejecutada:', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('❌ Error en query:', { text, error: error.message });
    throw error;
  }
};

// Función para obtener una conexión del pool
const getClient = async () => {
  try {
    const client = await pool.connect();
    return client;
  } catch (error) {
    console.error('❌ Error obteniendo cliente:', error);
    throw error;
  }
};

// Función para cerrar el pool
const closePool = async () => {
  try {
    await pool.end();
    console.log('🔒 Pool de conexiones cerrado');
  } catch (error) {
    console.error('❌ Error cerrando pool:', error);
    throw error;
  }
};

// Función para probar la conexión
const testConnection = async () => {
  try {
    const result = await query('SELECT NOW() as current_time');
    console.log('✅ Conexión a la base de datos exitosa:', result.rows[0].current_time);
    return true;
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error.message);
    return false;
  }
};

module.exports = {
  pool,
  query,
  getClient,
  closePool,
  testConnection
};
