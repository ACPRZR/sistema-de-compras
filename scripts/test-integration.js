const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

async function testIntegration() {
  console.log('🚀 Iniciando pruebas de integración del Sistema de Órdenes de Compra');
  console.log('============================================================\n');

  try {
    // 1. Health Check
    console.log('🔍 Probando Health Check...');
    try {
      const healthResponse = await axios.get(`${API_BASE_URL}/health`);
      console.log('✅ Health Check - Status:', healthResponse.status);
      console.log('   Respuesta:', healthResponse.data);
    } catch (error) {
      console.log('❌ Health Check - Error:', error.response?.data?.message || error.message);
      console.log('   Status:', error.response?.status);
      console.log('   Data:', error.response?.data);
    }

    // 2. Obtener Proveedores
    console.log('\n🔍 Probando Obtener Proveedores...');
    try {
      const proveedoresResponse = await axios.get(`${API_BASE_URL}/api/proveedores`);
      console.log('✅ Obtener Proveedores - Status:', proveedoresResponse.status);
      console.log('   Respuesta:', JSON.stringify(proveedoresResponse.data).substring(0, 200) + '...');
    } catch (error) {
      console.log('❌ Obtener Proveedores - Error:', error.response?.data?.message || error.message);
      console.log('   Status:', error.response?.status);
      console.log('   Data:', error.response?.data);
    }

    // 3. Obtener Categorías
    console.log('\n🔍 Probando Obtener Categorías...');
    try {
      const categoriasResponse = await axios.get(`${API_BASE_URL}/api/categorias`);
      console.log('✅ Obtener Categorías - Status:', categoriasResponse.status);
      console.log('   Respuesta:', categoriasResponse.data);
    } catch (error) {
      console.log('❌ Obtener Categorías - Error:', error.response?.data?.message || error.message);
      console.log('   Status:', error.response?.status);
      console.log('   Data:', error.response?.data);
    }

    // 4. Obtener Órdenes
    console.log('\n🔍 Probando Obtener Órdenes...');
    try {
      const ordenesResponse = await axios.get(`${API_BASE_URL}/api/ordenes`);
      console.log('✅ Obtener Órdenes - Status:', ordenesResponse.status);
      console.log('   Respuesta:', JSON.stringify(ordenesResponse.data).substring(0, 200) + '...');
    } catch (error) {
      console.log('❌ Obtener Órdenes - Error:', error.response?.data?.message || error.message);
      console.log('   Status:', error.response?.status);
      console.log('   Data:', error.response?.data);
    }

    // 5. Generar Número OC
    console.log('\n🔍 Probando Generar Número OC...');
    try {
      const numeroResponse = await axios.get(`${API_BASE_URL}/api/ordenes/generate-number`);
      console.log('✅ Generar Número OC - Status:', numeroResponse.status);
      console.log('   Respuesta:', numeroResponse.data);
    } catch (error) {
      console.log('❌ Generar Número OC - Error:', error.response?.data?.message || error.message);
      console.log('   Status:', error.response?.status);
      console.log('   Data:', error.response?.data);
    }

    // 6. Crear Orden
    console.log('\n🔍 Probando Crear Orden...');
    try {
      const ordenData = {
        numero_oc: `OC-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`,
        fecha_requerimiento: new Date().toISOString().split('T')[0],
        categoria_id: 1,
        tipo_oc_id: 1,
        estado_id: 1,
        prioridad_id: 1,
        unidad_negocio_id: 1,
        unidad_autoriza_id: 1,
        ubicacion_entrega_id: 1,
        lugar_entrega: 'Oficina Principal',
        datos_proyecto: 'Proyecto de prueba',
        proveedor_nombre: 'Proveedor de Prueba',
        proveedor_ruc: '20123456789',
        proveedor_contacto: 'Juan Pérez',
        proveedor_telefono: '999-999-999',
        proveedor_email: 'juan@proveedor.com',
        condiciones_pago_id: 1,
        comprador_responsable_id: 1,
        total: 100.00
      };

      const crearResponse = await axios.post(`${API_BASE_URL}/api/ordenes`, ordenData);
      console.log('✅ Crear Orden - Status:', crearResponse.status);
      console.log('   Respuesta:', crearResponse.data);
    } catch (error) {
      console.log('❌ Crear Orden - Error:', error.response?.data?.message || error.message);
      console.log('   Status:', error.response?.status);
      console.log('   Data:', error.response?.data);
    }

    // 7. Estadísticas de Órdenes
    console.log('\n🔍 Probando Estadísticas de Órdenes...');
    try {
      const statsResponse = await axios.get(`${API_BASE_URL}/api/ordenes/stats`);
      console.log('✅ Estadísticas de Órdenes - Status:', statsResponse.status);
      console.log('   Respuesta:', statsResponse.data);
    } catch (error) {
      console.log('❌ Estadísticas de Órdenes - Error:', error.response?.data?.message || error.message);
      console.log('   Status:', error.response?.status);
      console.log('   Data:', error.response?.data);
    }

    // 8. Estadísticas de Proveedores
    console.log('\n🔍 Probando Estadísticas de Proveedores...');
    try {
      const proveedoresStatsResponse = await axios.get(`${API_BASE_URL}/api/proveedores/stats`);
      console.log('✅ Estadísticas de Proveedores - Status:', proveedoresStatsResponse.status);
      console.log('   Respuesta:', proveedoresStatsResponse.data);
    } catch (error) {
      console.log('❌ Estadísticas de Proveedores - Error:', error.response?.data?.message || error.message);
      console.log('   Status:', error.response?.status);
      console.log('   Data:', error.response?.data);
    }

  } catch (error) {
    console.error('❌ Error general en las pruebas:', error.message);
  }

  console.log('\n============================================================');
  console.log('✅ Pruebas de integración completadas');
  console.log('\n📋 Para probar el frontend:');
  console.log('   1. Asegúrate de que el backend esté corriendo: npm start (en la carpeta backend)');
  console.log('   2. Inicia el frontend: npm start (en la carpeta raíz)');
  console.log('   3. Abre http://localhost:3000 en tu navegador');
  console.log('   4. Crea una nueva orden y verifica que se guarde en la base de datos');
}

testIntegration();
