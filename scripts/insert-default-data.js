const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'sistema_ordenes',
  user: 'postgres',
  password: 'alvaro',
  searchPath: 'ordenes_compra, public'
});

async function insertDefaultData() {
  try {
    console.log('🔄 Insertando datos por defecto...');

    // Insertar estados de orden
    await pool.query(`
      INSERT INTO ordenes_compra.estados_orden (id, nombre, descripcion, activo) 
      VALUES 
        (1, 'Creada', 'Orden creada y pendiente de aprobación', true),
        (2, 'Aprobada', 'Orden aprobada y lista para procesar', true),
        (3, 'En Proceso', 'Orden en proceso de compra', true),
        (4, 'Completada', 'Orden completada', true),
        (5, 'Cancelada', 'Orden cancelada', true)
      ON CONFLICT (id) DO NOTHING;
    `);

    // Insertar tipos de orden
    await pool.query(`
      INSERT INTO ordenes_compra.tipos_orden (id, nombre, descripcion, activo) 
      VALUES 
        (1, 'Estándar', 'Orden de compra estándar', true),
        (2, 'Urgente', 'Orden de compra urgente', true),
        (3, 'Especial', 'Orden de compra especial', true)
      ON CONFLICT (id) DO NOTHING;
    `);

    // Insertar prioridades
    await pool.query(`
      INSERT INTO ordenes_compra.prioridades (id, nombre, descripcion, activo) 
      VALUES 
        (1, 'Normal', 'Prioridad normal', true),
        (2, 'Alta', 'Prioridad alta', true),
        (3, 'Urgente', 'Prioridad urgente', true)
      ON CONFLICT (id) DO NOTHING;
    `);

    // Insertar categorías de compra
    await pool.query(`
      INSERT INTO ordenes_compra.categorias_compra (id, codigo, nombre, descripcion, activo) 
      VALUES 
        (1, 'GEN', 'General', 'Categoría general de compras', true),
        (2, 'TEC', 'Tecnología', 'Equipos y servicios de tecnología', true),
        (3, 'OFI', 'Oficina', 'Suministros de oficina', true),
        (4, 'MANT', 'Mantenimiento', 'Servicios de mantenimiento', true)
      ON CONFLICT (id) DO NOTHING;
    `);

    // Insertar unidades de negocio
    await pool.query(`
      INSERT INTO ordenes_compra.unidades_negocio (id, nombre, descripcion, activo) 
      VALUES 
        (1, 'Administración', 'Unidad de administración', true),
        (2, 'Tecnología', 'Unidad de tecnología', true),
        (3, 'Operaciones', 'Unidad de operaciones', true)
      ON CONFLICT (id) DO NOTHING;
    `);

    // Insertar ubicaciones de entrega
    await pool.query(`
      INSERT INTO ordenes_compra.ubicaciones_entrega (id, nombre, direccion, activo) 
      VALUES 
        (1, 'Oficina Principal', 'Av. Principal 123, Lima', true),
        (2, 'Sucursal Norte', 'Av. Norte 456, Lima', true),
        (3, 'Sucursal Sur', 'Av. Sur 789, Lima', true)
      ON CONFLICT (id) DO NOTHING;
    `);

    // Insertar condiciones de pago
    await pool.query(`
      INSERT INTO ordenes_compra.condiciones_pago (id, nombre, dias, descripcion, activo) 
      VALUES 
        (1, 'Contado', 0, 'Pago al contado', true),
        (2, '30 días', 30, 'Pago a 30 días', true),
        (3, '60 días', 60, 'Pago a 60 días', true)
      ON CONFLICT (id) DO NOTHING;
    `);

    // Insertar usuarios (compradores)
    await pool.query(`
      INSERT INTO ordenes_compra.usuarios (id, nombre, email, rol, activo) 
      VALUES 
        (1, 'Usuario Administrador', 'admin@empresa.com', 'admin', true),
        (2, 'Comprador Principal', 'comprador@empresa.com', 'comprador', true),
        (3, 'Gerente Compras', 'gerente@empresa.com', 'gerente', true)
      ON CONFLICT (id) DO NOTHING;
    `);

    console.log('✅ Datos por defecto insertados exitosamente');
  } catch (error) {
    console.error('❌ Error insertando datos por defecto:', error);
  } finally {
    await pool.end();
  }
}

insertDefaultData();
