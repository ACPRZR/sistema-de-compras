const { query } = require('../config/database');

class Proveedor {
  // Crear proveedor
  static async create(proveedorData) {
    const {
      ruc,
      nombre,
      contacto,
      telefono,
      email,
      direccion,
      especialidad,
      calificacion,
      tiempo_entrega,
      categoria_id
    } = proveedorData;

    const text = `
      INSERT INTO proveedores (
        ruc, nombre, contacto, telefono, email, direccion, 
        especialidad, calificacion, tiempo_entrega, categoria_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const values = [
      ruc, nombre, contacto, telefono, email, direccion,
      especialidad, calificacion, tiempo_entrega, categoria_id
    ];

    const result = await query(text, values);
    return result.rows[0];
  }

  // Obtener proveedor por ID
  static async findById(id) {
    const text = `
      SELECT 
        p.*,
        c.nombre as categoria_nombre
      FROM proveedores p
      LEFT JOIN categorias_compra c ON p.categoria_id = c.id
      WHERE p.id = $1
    `;

    const result = await query(text, [id]);
    return result.rows[0];
  }

  // Obtener proveedor por RUC
  static async findByRUC(ruc) {
    const text = `
      SELECT 
        p.*,
        c.nombre as categoria_nombre
      FROM proveedores p
      LEFT JOIN categorias_compra c ON p.categoria_id = c.id
      WHERE p.ruc = $1
    `;

    const result = await query(text, [ruc]);
    return result.rows[0];
  }

  // Obtener proveedores por categoría
  static async findByCategoria(categoriaId) {
    const text = `
      SELECT 
        p.*,
        c.nombre as categoria_nombre
      FROM proveedores p
      LEFT JOIN categorias_compra c ON p.categoria_id = c.id
      WHERE p.categoria_id = $1 AND p.activo = true
      ORDER BY p.nombre
    `;

    const result = await query(text, [categoriaId]);
    return result.rows;
  }

  // Obtener todos los proveedores con filtros
  static async findAll(filters = {}) {
    let text = `
      SELECT 
        p.*,
        c.nombre as categoria_nombre
      FROM proveedores p
      LEFT JOIN categorias_compra c ON p.categoria_id = c.id
      WHERE p.activo = true
    `;

    const values = [];
    let paramCount = 1;

    // Aplicar filtros
    if (filters.categoria_id) {
      text += ` AND p.categoria_id = $${paramCount}`;
      values.push(filters.categoria_id);
      paramCount++;
    }

    if (filters.busqueda) {
      text += ` AND (p.nombre ILIKE $${paramCount} OR p.ruc ILIKE $${paramCount} OR p.especialidad ILIKE $${paramCount})`;
      values.push(`%${filters.busqueda}%`);
      paramCount++;
    }

    // Ordenamiento
    text += ` ORDER BY p.nombre`;

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

  // Actualizar proveedor
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
      UPDATE proveedores 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(text, values);
    return result.rows[0];
  }

  // Eliminar proveedor (soft delete)
  static async delete(id) {
    const text = `
      UPDATE proveedores 
      SET activo = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const result = await query(text, [id]);
    return result.rows[0];
  }

  // Obtener estadísticas de proveedores
  static async getStats() {
    const text = `
      SELECT 
        COUNT(*) as total_proveedores,
        COUNT(CASE WHEN activo = true THEN 1 END) as proveedores_activos,
        COUNT(CASE WHEN activo = false THEN 1 END) as proveedores_inactivos,
        COALESCE(AVG(calificacion), 0) as calificacion_promedio,
        COUNT(DISTINCT categoria_id) as categorias_con_proveedores
      FROM proveedores
    `;

    const result = await query(text);
    return result.rows[0];
  }

  // Buscar proveedores por texto
  static async search(searchTerm) {
    const text = `
      SELECT 
        p.*,
        c.nombre as categoria_nombre
      FROM proveedores p
      LEFT JOIN categorias_compra c ON p.categoria_id = c.id
      WHERE p.activo = true 
        AND (p.nombre ILIKE $1 OR p.ruc ILIKE $1 OR p.especialidad ILIKE $1)
      ORDER BY p.nombre
      LIMIT 20
    `;

    const result = await query(text, [`%${searchTerm}%`]);
    return result.rows;
  }
}

module.exports = Proveedor;
