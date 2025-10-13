const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'ordenes_compra',
  user: 'postgres',
  password: 'alvaro'
});

async function resetSecuenciasMensual() {
  try {
    console.log('🔄 Configurando sistema de numeración mensual...\n');

    const fechaActual = new Date();
    const anioActual = fechaActual.getFullYear();
    const mesActual = String(fechaActual.getMonth() + 1).padStart(2, '0');
    const periodoActual = `${anioActual}-${mesActual}`;

    console.log(`📅 Período actual: ${periodoActual}`);
    console.log(`📋 Formato: OC-${anioActual}-${mesActual}-NNN\n`);

    // Eliminar todas las secuencias existentes
    console.log('🗑️ Eliminando secuencias existentes...');
    await pool.query('DELETE FROM ordenes_compra.secuencias WHERE tipo = \'orden_compra\'');

    // Crear nueva secuencia para el período actual
    console.log('✨ Creando nueva secuencia para el período actual...');
    await pool.query(`
      INSERT INTO ordenes_compra.secuencias (tipo, prefijo, anio, contador, ultima_actualizacion)
      VALUES ('orden_compra', 'OC', $1, 0, CURRENT_TIMESTAMP)
    `, [periodoActual]);

    // Verificar la nueva secuencia
    const result = await pool.query(`
      SELECT * FROM ordenes_compra.secuencias 
      WHERE tipo = 'orden_compra'
    `);

    console.log('\n✅ Sistema configurado exitosamente:');
    console.table(result.rows);

    console.log(`\n🎯 Próximo número de orden será: OC-${anioActual}-${mesActual}-001`);

  } catch (error) {
    console.error('❌ Error configurando secuencias:', error);
  } finally {
    await pool.end();
  }
}

resetSecuenciasMensual();
