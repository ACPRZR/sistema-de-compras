const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'ordenes_compra',
  user: 'postgres',
  password: 'alvaro'
});

async function testCrearOrden() {
  try {
    console.log('🧪 Creando orden de prueba con aprobador_id...\n');

    // Crear una orden de prueba con aprobador_id
    const ordenData = {
      numero_oc: 'OC-2025-TEST',
      fecha_requerimiento: new Date().toISOString().split('T')[0],
      categoria_id: 1,
      tipo_oc_id: 1,
      estado_id: 1,
      prioridad_id: 1,
      unidad_negocio_id: 1,
      unidad_autoriza_id: 1,
      ubicacion_entrega_id: 1,
      lugar_entrega: 'Test Location',
      datos_proyecto: 'Test Project',
      proveedor_nombre: 'Test Provider',
      proveedor_ruc: '12345678901',
      proveedor_contacto: 'Test Contact',
      proveedor_telefono: '123456789',
      proveedor_email: 'test@test.com',
      condiciones_pago_id: 1,
      comprador_responsable_id: 1,
      aprobador_id: 3, // Juan Colqui Solorzano
      total: 100.00
    };

    const result = await pool.query(`
      INSERT INTO ordenes_compra.ordenes_compra (
        numero_oc, fecha_requerimiento, categoria_id, tipo_oc_id, estado_id, prioridad_id,
        unidad_negocio_id, unidad_autoriza_id, ubicacion_entrega_id, lugar_entrega, datos_proyecto,
        proveedor_nombre, proveedor_ruc, proveedor_contacto, proveedor_telefono, proveedor_email,
        condiciones_pago_id, comprador_responsable_id, aprobador_id, total
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      RETURNING id, numero_oc, aprobador_id
    `, [
      ordenData.numero_oc, ordenData.fecha_requerimiento, ordenData.categoria_id, ordenData.tipo_oc_id,
      ordenData.estado_id, ordenData.prioridad_id, ordenData.unidad_negocio_id, ordenData.unidad_autoriza_id,
      ordenData.ubicacion_entrega_id, ordenData.lugar_entrega, ordenData.datos_proyecto,
      ordenData.proveedor_nombre, ordenData.proveedor_ruc, ordenData.proveedor_contacto,
      ordenData.proveedor_telefono, ordenData.proveedor_email, ordenData.condiciones_pago_id,
      ordenData.comprador_responsable_id, ordenData.aprobador_id, ordenData.total
    ]);

    console.log('✅ Orden creada exitosamente:');
    console.table(result.rows);

    // Verificar que se guardó correctamente
    const verificacion = await pool.query(`
      SELECT id, numero_oc, aprobador_id, proveedor_nombre
      FROM ordenes_compra.ordenes_compra 
      WHERE id = $1
    `, [result.rows[0].id]);

    console.log('\n🔍 Verificación:');
    console.table(verificacion.rows);

    if (verificacion.rows[0].aprobador_id) {
      console.log('✅ SUCCESS: El aprobador_id se guardó correctamente');
    } else {
      console.log('❌ ERROR: El aprobador_id NO se guardó');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

testCrearOrden();
