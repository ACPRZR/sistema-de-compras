const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { testConnection } = require('./config/database');

// Importar rutas
const ordenesRoutes = require('./routes/ordenes');
const proveedoresRoutes = require('./routes/proveedores');
const categoriasRoutes = require('./routes/categorias');
const unidadesMedidaRoutes = require('./routes/unidades-medida');
const pdfRoutes = require('./routes/pdf');
const reportesRoutes = require('./routes/reportes');

// Rutas de datos maestros (individuales)
const unidadesNegocioRoutes = require('./routes/unidades-negocio');
const tiposOrdenRoutes = require('./routes/tipos-orden');
const ubicacionesEntregaRoutes = require('./routes/ubicaciones-entrega');
const condicionesPagoRoutes = require('./routes/condiciones-pago');
const unidadesAutorizaRoutes = require('./routes/unidades-autoriza');
const configuracionEmpresaRoutes = require('./routes/configuracion-empresa');

const app = express();
const PORT = process.env.PORT || 3001;

// =====================================================
// MIDDLEWARES DE SEGURIDAD
// =====================================================

// Helmet para headers de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting - Deshabilitado temporalmente para debug
// const limiter = rateLimit({
//   windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 1 * 60 * 1000, // 1 minuto
//   max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // límite de 1000 requests por minuto
//   message: {
//     success: false,
//     message: 'Demasiadas solicitudes, intenta de nuevo más tarde'
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// app.use(limiter);

// =====================================================
// MIDDLEWARES GENERALES
// =====================================================

// Compresión
app.use(compression());

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Parse JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// =====================================================
// RUTAS
// =====================================================

// Ruta de salud
app.get('/health', async (req, res) => {
  try {
    const dbConnected = await testConnection();
    
    res.json({
      success: true,
      message: 'Servidor funcionando correctamente',
      timestamp: new Date().toISOString(),
      database: dbConnected ? 'Conectado' : 'Desconectado',
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API del Sistema de Órdenes de Compra',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      ordenes: '/api/ordenes',
      proveedores: '/api/proveedores'
    }
  });
});

// Rutas de la API
app.use('/api/ordenes', ordenesRoutes);
app.use('/api/proveedores', proveedoresRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/unidades-medida', unidadesMedidaRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/reportes', reportesRoutes);

// Rutas de datos maestros (individuales)
app.use('/api/unidades-negocio', unidadesNegocioRoutes);
app.use('/api/tipos-orden', tiposOrdenRoutes);
app.use('/api/ubicaciones-entrega', ubicacionesEntregaRoutes);
app.use('/api/condiciones-pago', condicionesPagoRoutes);
app.use('/api/unidades-autoriza', unidadesAutorizaRoutes);
app.use('/api/configuracion-empresa', configuracionEmpresaRoutes);

// =====================================================
// MANEJO DE ERRORES
// =====================================================

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

// Middleware global de manejo de errores
app.use((error, req, res, next) => {
  console.error('Error no manejado:', error);
  
  // Error de validación de JSON
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'JSON inválido',
      error: 'Formato de JSON incorrecto'
    });
  }

  // Error de límite de tamaño
  if (error.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Archivo demasiado grande',
      error: 'El archivo excede el límite de tamaño permitido'
    });
  }

  // Error genérico
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'production' ? 'Error interno' : error.message
  });
});

// =====================================================
// INICIO DEL SERVIDOR
// =====================================================

const startServer = async () => {
  try {
    // Probar conexión a la base de datos
    console.log('🔄 Probando conexión a la base de datos...');
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ No se pudo conectar a la base de datos');
      process.exit(1);
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log('🚀 Servidor iniciado exitosamente');
      console.log(`📡 Puerto: ${PORT}`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 URL: http://localhost:${PORT}`);
      console.log(`💚 Health Check: http://localhost:${PORT}/health`);
      console.log('📋 Endpoints disponibles:');
      console.log('   - GET  /health');
      console.log('   - GET  /api/ordenes');
      console.log('   - POST /api/ordenes');
      console.log('   - GET  /api/proveedores');
      console.log('   - POST /api/proveedores');
      console.log('   - GET  /api/reportes/dashboard');
      console.log('   - GET  /api/reportes/tendencias');
      console.log('   - GET  /api/reportes/categorias');
      console.log('   - GET  /api/reportes/proveedores');
      console.log('   - GET  /api/reportes/unidades-negocio');
      console.log('   - GET  /api/reportes/eficiencia');
      console.log('   - GET  /api/reportes/resumen-ejecutivo');
      console.log('   - GET  /api/reportes/proyecciones');
    });
  } catch (error) {
    console.error('❌ Error iniciando el servidor:', error);
    process.exit(1);
  }
};

// Manejo de señales de terminación
process.on('SIGTERM', () => {
  console.log('🛑 Señal SIGTERM recibida, cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Señal SIGINT recibida, cerrando servidor...');
  process.exit(0);
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Excepción no capturada:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada:', reason);
  process.exit(1);
});

// Iniciar servidor
startServer();

module.exports = app;
