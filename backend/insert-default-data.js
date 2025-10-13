const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'ordenes_compra',
  user: 'postgres',
  password: 'alvaro',
  searchPath: 'ordenes_compra, public'
});

async function insertDefaultData() {
  try {
    console.log('🔄 Insertando datos por defecto...');

    // Insertar estados de orden
    await pool.query(`
      INSERT INTO ordenes_compra.estados_orden (id, codigo, nombre, descripcion) 
      VALUES 
        (1, 'creada', 'Creada', 'Orden creada, aún no enviada para aprobación'),
        (2, 'aprobada', 'Aprobada', 'Orden aprobada por el autorizador'),
        (3, 'revision', 'En Revisión', 'Orden enviada para aprobación vía WhatsApp'),
        (4, 'completada', 'Completada', 'Orden completada, compra finalizada'),
        (5, 'cancelada', 'Cancelada', 'Orden rechazada por el autorizador')
      ON CONFLICT (id) DO UPDATE SET 
        codigo = EXCLUDED.codigo,
        nombre = EXCLUDED.nombre,
        descripcion = EXCLUDED.descripcion;
    `);

    // Insertar tipos de orden
    await pool.query(`
      INSERT INTO ordenes_compra.tipos_orden (id, nombre, descripcion) 
      VALUES 
        (1, 'Estándar', 'Orden de compra estándar'),
        (2, 'Urgente', 'Orden de compra urgente'),
        (3, 'Especial', 'Orden de compra especial')
      ON CONFLICT (id) DO NOTHING;
    `);

    // Insertar prioridades
    await pool.query(`
      INSERT INTO ordenes_compra.prioridades (id, nombre, descripcion) 
      VALUES 
        (1, 'Normal', 'Prioridad normal'),
        (2, 'Alta', 'Prioridad alta'),
        (3, 'Urgente', 'Prioridad urgente')
      ON CONFLICT (id) DO NOTHING;
    `);

    // Insertar categorías de compra
    await pool.query(`
      INSERT INTO ordenes_compra.categorias_compra (id, codigo, nombre, descripcion) 
      VALUES 
        (1, 'GEN', 'General', 'Categoría general de compras'),
        (2, 'TEC', 'Tecnología', 'Equipos y servicios de tecnología'),
        (3, 'OFI', 'Oficina', 'Suministros de oficina'),
        (4, 'MANT', 'Mantenimiento', 'Servicios de mantenimiento')
      ON CONFLICT (id) DO NOTHING;
    `);

    // Insertar unidades de negocio
    await pool.query(`
      INSERT INTO ordenes_compra.unidades_negocio (id, nombre, descripcion) 
      VALUES 
        (1, 'Administración', 'Unidad de administración'),
        (2, 'Tecnología', 'Unidad de tecnología'),
        (3, 'Operaciones', 'Unidad de operaciones')
      ON CONFLICT (id) DO NOTHING;
    `);

    // Insertar ubicaciones de entrega
    await pool.query(`
      INSERT INTO ordenes_compra.ubicaciones_entrega (id, nombre, direccion) 
      VALUES 
        (1, 'Oficina Principal', 'Av. Principal 123, Lima'),
        (2, 'Sucursal Norte', 'Av. Norte 456, Lima'),
        (3, 'Sucursal Sur', 'Av. Sur 789, Lima')
      ON CONFLICT (id) DO NOTHING;
    `);

    // Insertar condiciones de pago
    await pool.query(`
      INSERT INTO ordenes_compra.condiciones_pago (id, nombre, dias, descripcion) 
      VALUES 
        (1, 'Contado', 0, 'Pago al contado'),
        (2, '30 días', 30, 'Pago a 30 días'),
        (3, '60 días', 60, 'Pago a 60 días')
      ON CONFLICT (id) DO NOTHING;
    `);

    // Insertar usuarios (compradores)
    await pool.query(`
      INSERT INTO ordenes_compra.usuarios (id, nombre, email, rol) 
      VALUES 
        (1, 'Usuario Administrador', 'admin@empresa.com', 'admin'),
        (2, 'Comprador Principal', 'comprador@empresa.com', 'comprador'),
        (3, 'Gerente Compras', 'gerente@empresa.com', 'gerente')
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