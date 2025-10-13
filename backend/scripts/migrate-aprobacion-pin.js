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

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Ejecutando migración de sistema de aprobación PIN + DNI...\n');

    // Leer archivo SQL
    const sqlFile = path.join(__dirname, '../migrations/add-sistema-aprobacion-pin.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Ejecutar migración
    await client.query(sql);

    console.log('✅ Migración completada exitosamente\n');

    // Verificar aprobadores registrados
    const aprobadores = await client.query(`
      SELECT 
        id,
        nombre_completo,
        cargo,
        dni,
        email,
        es_aprobador,
        puede_aprobar_sin_limite,
        CASE WHEN pin_aprobacion IS NOT NULL THEN '✓ Configurado' ELSE '✗ No configurado' END as pin_status
      FROM ordenes_compra.usuarios
      WHERE es_aprobador = true
      ORDER BY nombre_completo
    `);

    if (aprobadores.rows.length > 0) {
      console.log('👔 Aprobadores registrados:');
      aprobadores.rows.forEach(aprobador => {
        console.log(`\n   ✅ ${aprobador.nombre_completo}`);
        console.log(`      Cargo: ${aprobador.cargo}`);
        console.log(`      DNI: ${aprobador.dni} ${aprobador.dni === '00000000' || aprobador.dni === '00000001' ? '(⚠️ TEMPORAL - Actualizar mañana)' : ''}`);
        console.log(`      Email: ${aprobador.email}`);
        console.log(`      PIN: ${aprobador.pin_status}`);
        console.log(`      Puede aprobar sin límite: ${aprobador.puede_aprobar_sin_limite ? 'Sí' : 'No'}`);
      });
    }

    // Verificar tabla de aprobaciones
    const aprobacionesCheck = await client.query(`
      SELECT COUNT(*) as count FROM ordenes_compra.aprobaciones_ordenes
    `);
    
    console.log(`\n📊 Tabla de aprobaciones: ✓ Creada (${aprobacionesCheck.rows[0].count} registros)`);

    console.log('\n🎉 Sistema de aprobación con PIN + DNI está listo');
    console.log('\n📝 Pendientes:');
    console.log('   1. Actualizar DNI de Juan Colqui Solorzano');
    console.log('   2. Actualizar DNI de Janette Cerna Velazquez');
    console.log('   3. Cambiar PINs de producción (actualmente: 1234 para ambos)');

  } catch (error) {
    console.error('❌ Error ejecutando migración:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar
runMigration()
  .then(() => {
    console.log('\n✅ Proceso completado');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n💥 Error fatal:', err);
    process.exit(1);
  });

