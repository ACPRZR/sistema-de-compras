const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'ordenes_compra',
  user: 'postgres',
  password: 'alvaro',
  client_encoding: 'UTF8'
});

async function fixEncoding() {
  try {
    console.log('🔧 Corrigiendo codificación UTF-8...\n');
    
    // Configurar UTF-8
    await pool.query('SET CLIENT_ENCODING TO UTF8');
    
    // 1. Verificar datos actuales
    console.log('📋 Datos actuales en categorías:');
    const categorias = await pool.query('SELECT id, nombre FROM ordenes_compra.categorias_compra ORDER BY id');
    categorias.rows.forEach(cat => {
      console.log(`   ${cat.id}: ${cat.nombre}`);
    });
    
    console.log('\n🔄 Corrigiendo textos...\n');
    
    // 2. Corregir categorías
    await pool.query(`
      UPDATE ordenes_compra.categorias_compra 
      SET nombre = 'Tecnología e Informática'
      WHERE nombre LIKE '%Tecnolog%' OR nombre LIKE '%Inform%'
    `);
    
    await pool.query(`
      UPDATE ordenes_compra.categorias_compra 
      SET nombre = 'Papelería y Útiles de Oficina'
      WHERE nombre LIKE '%Papeler%' OR nombre LIKE '%tiles%'
    `);
    
    await pool.query(`
      UPDATE ordenes_compra.categorias_compra 
      SET nombre = 'Limpieza e Higiene'
      WHERE nombre LIKE '%Limpieza%'
    `);
    
    await pool.query(`
      UPDATE ordenes_compra.categorias_compra 
      SET nombre = 'Mobiliario y Equipamiento'
      WHERE nombre LIKE '%Mobiliario%'
    `);
    
    await pool.query(`
      UPDATE ordenes_compra.categorias_compra 
      SET nombre = 'Mantenimiento y Reparación'
      WHERE nombre LIKE '%Mantenimiento%' OR nombre LIKE '%Reparaci%'
    `);
    
    await pool.query(`
      UPDATE ordenes_compra.categorias_compra 
      SET nombre = 'Servicios Profesionales'
      WHERE nombre LIKE '%Servicios%'
    `);
    
    await pool.query(`
      UPDATE ordenes_compra.categorias_compra 
      SET nombre = 'Alimentación y Catering'
      WHERE nombre LIKE '%Alimentaci%'
    `);
    
    await pool.query(`
      UPDATE ordenes_compra.categorias_compra 
      SET nombre = 'Construcción y Obra Civil'
      WHERE nombre LIKE '%Construcci%' OR nombre LIKE '%Obra%'
    `);
    
    console.log('✅ Categorías corregidas\n');
    
    // 3. Verificar corrección
    console.log('📋 Datos corregidos:');
    const categoriasFixed = await pool.query('SELECT id, nombre FROM ordenes_compra.categorias_compra ORDER BY id');
    categoriasFixed.rows.forEach(cat => {
      console.log(`   ${cat.id}: ${cat.nombre}`);
    });
    
    console.log('\n✅ Corrección completada!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

fixEncoding();

