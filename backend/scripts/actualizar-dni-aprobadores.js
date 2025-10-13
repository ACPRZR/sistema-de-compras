const { Pool } = require('pg');
const readline = require('readline');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'ordenes_compra',
  user: 'postgres',
  password: 'alvaro'
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function pregunta(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function actualizarDNIs() {
  const client = await pool.connect();
  
  try {
    console.log('📝 Actualización de DNIs de Aprobadores\n');
    console.log('═══════════════════════════════════════════════════\n');

    // DNI de Juan Colqui Solorzano
    const dniJuan = await pregunta('DNI de Juan Colqui Solorzano (Presidente): ');
    
    if (dniJuan && /^\d{8}$/.test(dniJuan)) {
      await client.query(
        'UPDATE ordenes_compra.usuarios SET dni = $1 WHERE email = $2',
        [dniJuan, 'presidente@ladp.org']
      );
      console.log('✅ DNI de Juan Colqui Solorzano actualizado\n');
    } else {
      console.log('⚠️  DNI inválido (debe tener 8 dígitos). No se actualizó.\n');
    }

    // DNI de Janette Cerna Velazquez
    const dniJanette = await pregunta('DNI de Janette Cerna Velazquez (Secretaria): ');
    
    if (dniJanette && /^\d{8}$/.test(dniJanette)) {
      await client.query(
        'UPDATE ordenes_compra.usuarios SET dni = $1 WHERE email = $2',
        [dniJanette, 'secretaria@ladp.org']
      );
      console.log('✅ DNI de Janette Cerna Velazquez actualizado\n');
    } else {
      console.log('⚠️  DNI inválido (debe tener 8 dígitos). No se actualizó.\n');
    }

    // Verificar resultados
    const aprobadores = await client.query(`
      SELECT nombre_completo, cargo, dni, email
      FROM ordenes_compra.usuarios
      WHERE es_aprobador = true
      ORDER BY nombre_completo
    `);

    console.log('═══════════════════════════════════════════════════');
    console.log('\n👔 Aprobadores actualizados:\n');
    aprobadores.rows.forEach(aprobador => {
      console.log(`   ${aprobador.nombre_completo}`);
      console.log(`   Cargo: ${aprobador.cargo}`);
      console.log(`   DNI: ${aprobador.dni}`);
      console.log(`   Email: ${aprobador.email}\n`);
    });

    console.log('✅ Actualización completada');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    rl.close();
    client.release();
    await pool.end();
  }
}

actualizarDNIs();

