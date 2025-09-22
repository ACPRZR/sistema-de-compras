const { query } = require('../config/database');

class OrdenCompra {
  // Crear nueva orden de compra
  static async create(ordenData) {
    const {
      numero_oc,
      fecha_requerimiento,
      categoria_id,
      tipo_oc_id,
      estado_id,
      prioridad_id,
      unidad_negocio_id,
      unidad_autoriza_id,
      ubicacion_entrega_id,
      lugar_entrega,
      datos_proyecto,
      proveedor_id,
      proveedor_nombre,
      proveedor_ruc,
      proveedor_contacto,
      proveedor_telefono,
      proveedor_email,
      condiciones_pago_id,
      comprador_responsable_id,
      total,
      created_by
    } = ordenData;

    const text = `
      INSERT INTO ordenes_compra (
        numero_oc, fecha_requerimiento, categoria_id, tipo_oc_id, estado_id, prioridad_id,
        unidad_negocio_id, unidad_autoriza_id, ubicacion_entrega_id, lugar_entrega, datos_proyecto,
        proveedor_id, proveedor_nombre, proveedor_ruc, proveedor_contacto, proveedor_telefono, proveedor_email,
        condiciones_pago_id, comprador_responsable_id, total, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING *
    `;

    const values = [
      numero_oc, fecha_requerimiento, categoria_id, tipo_oc_id, estado_id, prioridad_id,
      unidad_negocio_id, unidad_autoriza_id, ubicacion_entrega_id, lugar_entrega, datos_proyecto,
      proveedor_id, proveedor_nombre, proveedor_ruc, proveedor_contacto, proveedor_telefono, proveedor_email,
      condiciones_pago_id, comprador_responsable_id, total, created_by
    ];

    const result = await query(text, values);
    return result.rows[0];
  }

  // Obtener orden por ID
  static async findById(id) {
    const text = `
      SELECT 
        oc.*,
        c.nombre as categoria_nombre,
        to.nombre as tipo_oc_nombre,
        e.nombre as estado_nombre,
        e.color as estado_color,
        e.icono as estado_icono,
        p.nombre as prioridad_nombre,
        p.color as prioridad_color,
        un.nombre as unidad_negocio_nombre,
        ua.nombre as unidad_autoriza_nombre,
        ue.nombre as ubicacion_entrega_nombre,
        prov.nombre as proveedor_nombre_completo,
        cp.nombre as condiciones_pago_nombre,
        u.nombre_completo as comprador_nombre
      FROM ordenes_compra oc
      LEFT JOIN categorias_compra c ON oc.categoria_id = c.id
      LEFT JOIN tipos_orden to ON oc.tipo_oc_id = to.id
      LEFT JOIN estados_orden e ON oc.estado_id = e.id
      LEFT JOIN prioridades p ON oc.prioridad_id = p.id
      LEFT JOIN unidades_negocio un ON oc.unidad_negocio_id = un.id
      LEFT JOIN unidades_negocio ua ON oc.unidad_autoriza_id = ua.id
      LEFT JOIN ubicaciones_entrega ue ON oc.ubicacion_entrega_id = ue.id
      LEFT JOIN proveedores prov ON oc.proveedor_id = prov.id
      LEFT JOIN condiciones_pago cp ON oc.condiciones_pago_id = cp.id
      LEFT JOIN usuarios u ON oc.comprador_responsable_id = u.id
      WHERE oc.id = $1
    `;

    const result = await query(text, [id]);
    return result.rows[0];
  }

  // Obtener todas las órdenes con filtros
  static async findAll(filters = {}) {
    let text = `
      SELECT 
        oc.*,
        c.nombre as categoria_nombre,
        e.nombre as estado_nombre,
        e.color as estado_color,
        p.nombre as prioridad_nombre,
        p.color as prioridad_color,
        un.nombre as unidad_negocio_nombre,
        prov.nombre as proveedor_nombre_completo,
        u.nombre_completo as comprador_nombre
      FROM ordenes_compra oc
      LEFT JOIN categorias_compra c ON oc.categoria_id = c.id
      LEFT JOIN estados_orden e ON oc.estado_id = e.id
      LEFT JOIN prioridades p ON oc.prioridad_id = p.id
      LEFT JOIN unidades_negocio un ON oc.unidad_negocio_id = un.id
      LEFT JOIN proveedores prov ON oc.proveedor_id = prov.id
      LEFT JOIN usuarios u ON oc.comprador_responsable_id = u.id
      WHERE 1=1
    `;

    const values = [];
    let paramCount = 1;

    // Aplicar filtros
    if (filters.estado_id) {
      text += ` AND oc.estado_id = $${paramCount}`;
      values.push(filters.estado_id);
      paramCount++;
    }

    if (filters.categoria_id) {
      text += ` AND oc.categoria_id = $${paramCount}`;
      values.push(filters.categoria_id);
      paramCount++;
    }

    if (filters.proveedor_id) {
      text += ` AND oc.proveedor_id = $${paramCount}`;
      values.push(filters.proveedor_id);
      paramCount++;
    }

    if (filters.fecha_desde) {
      text += ` AND oc.fecha_creacion >= $${paramCount}`;
      values.push(filters.fecha_desde);
      paramCount++;
    }

    if (filters.fecha_hasta) {
      text += ` AND oc.fecha_creacion <= $${paramCount}`;
      values.push(filters.fecha_hasta);
      paramCount++;
    }

    if (filters.busqueda) {
      text += ` AND (oc.numero_oc ILIKE $${paramCount} OR oc.proveedor_nombre ILIKE $${paramCount} OR oc.datos_proyecto ILIKE $${paramCount})`;
      values.push(`%${filters.busqueda}%`);
      paramCount++;
    }

    // Ordenamiento
    text += ` ORDER BY oc.fecha_creacion DESC`;

    // Paginación
    if (filters.limit) {
      text += ` LIMIT $${paramCount}`;
      values.push(filters.limit);
      paramCount++;
    }

    if (filters.offset) {
      text += ` OFFSET $${paramCount}`;
      values.push(filters.offset);
      paramCount++;
    }

    const result = await query(text, values);
    return result.rows;
  }

  // Actualizar orden
  static async update(id, updateData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    // Construir query dinámicamente
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    values.push(id);
    const text = `
      UPDATE ordenes_compra 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(text, values);
    return result.rows[0];
  }

  // Eliminar orden
  static async delete(id) {
    const text = 'DELETE FROM ordenes_compra WHERE id = $1 RETURNING *';
    const result = await query(text, [id]);
    return result.rows[0];
  }

  // Obtener estadísticas
  static async getStats() {
    const text = `
      SELECT 
        COUNT(*) as total_ordenes,
        COUNT(CASE WHEN e.codigo = 'creada' THEN 1 END) as ordenes_creadas,
        COUNT(CASE WHEN e.codigo = 'revision' THEN 1 END) as ordenes_revision,
        COUNT(CASE WHEN e.codigo = 'aprobada' THEN 1 END) as ordenes_aprobadas,
        COUNT(CASE WHEN e.codigo = 'enviada' THEN 1 END) as ordenes_enviadas,
        COUNT(CASE WHEN e.codigo = 'completada' THEN 1 END) as ordenes_completadas,
        COUNT(CASE WHEN e.codigo = 'cancelada' THEN 1 END) as ordenes_canceladas,
        COALESCE(SUM(oc.total), 0) as monto_total,
        COALESCE(AVG(oc.total), 0) as monto_promedio
      FROM ordenes_compra oc
      LEFT JOIN estados_orden e ON oc.estado_id = e.id
    `;

    const result = await query(text);
    return result.rows[0];
  }

  // Generar número de orden
  static async generateOCNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    
    // Buscar el último número del mes
    const text = `
      SELECT MAX(CAST(SUBSTRING(numero_oc FROM 'OC-\\d{4}-\\d{2}-(\\d{3})$') AS INTEGER)) as last_number
      FROM ordenes_compra 
      WHERE numero_oc LIKE $1
    `;
    
    const pattern = `OC-${year}-${month}-%`;
    const result = await query(text, [pattern]);
    
    const lastNumber = result.rows[0].last_number || 0;
    const newNumber = lastNumber + 1;
    
    return `OC-${year}-${month}-${String(newNumber).padStart(3, '0')}`;
  }
}

module.exports = OrdenCompra;
