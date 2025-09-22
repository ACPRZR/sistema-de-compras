const { query } = require('../config/database');

class OrdenItem {
  // Crear item de orden
  static async create(itemData) {
    const {
      orden_id,
      item_numero,
      descripcion,
      unidad_id,
      cantidad,
      precio_unitario,
      subtotal,
      producto_id
    } = itemData;

    const text = `
      INSERT INTO orden_items (
        orden_id, item_numero, descripcion, unidad_id, cantidad, 
        precio_unitario, subtotal, producto_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      orden_id, item_numero, descripcion, unidad_id, cantidad,
      precio_unitario, subtotal, producto_id
    ];

    const result = await query(text, values);
    return result.rows[0];
  }

  // Obtener items de una orden
  static async findByOrdenId(ordenId) {
    const text = `
      SELECT 
        oi.*,
        um.nombre as unidad_nombre,
        um.simbolo as unidad_simbolo,
        ps.codigo as producto_codigo
      FROM orden_items oi
      LEFT JOIN unidades_medida um ON oi.unidad_id = um.id
      LEFT JOIN productos_servicios ps ON oi.producto_id = ps.id
      WHERE oi.orden_id = $1
      ORDER BY oi.item_numero
    `;

    const result = await query(text, [ordenId]);
    return result.rows;
  }

  // Obtener item por ID
  static async findById(id) {
    const text = `
      SELECT 
        oi.*,
        um.nombre as unidad_nombre,
        um.simbolo as unidad_simbolo,
        ps.codigo as producto_codigo
      FROM orden_items oi
      LEFT JOIN unidades_medida um ON oi.unidad_id = um.id
      LEFT JOIN productos_servicios ps ON oi.producto_id = ps.id
      WHERE oi.id = $1
    `;

    const result = await query(text, [id]);
    return result.rows[0];
  }

  // Actualizar item
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
      UPDATE orden_items 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(text, values);
    return result.rows[0];
  }

  // Eliminar item
  static async delete(id) {
    const text = 'DELETE FROM orden_items WHERE id = $1 RETURNING *';
    const result = await query(text, [id]);
    return result.rows[0];
  }

  // Eliminar todos los items de una orden
  static async deleteByOrdenId(ordenId) {
    const text = 'DELETE FROM orden_items WHERE orden_id = $1';
    const result = await query(text, [ordenId]);
    return result.rowCount;
  }

  // Calcular total de una orden
  static async calculateTotal(ordenId) {
    const text = `
      SELECT COALESCE(SUM(subtotal), 0) as total
      FROM orden_items 
      WHERE orden_id = $1
    `;

    const result = await query(text, [ordenId]);
    return result.rows[0].total;
  }

  // Obtener siguiente número de item para una orden
  static async getNextItemNumber(ordenId) {
    const text = `
      SELECT COALESCE(MAX(item_numero), 0) + 1 as next_number
      FROM orden_items 
      WHERE orden_id = $1
    `;

    const result = await query(text, [ordenId]);
    return result.rows[0].next_number;
  }

  // Crear múltiples items
  static async createMultiple(items) {
    if (!Array.isArray(items) || items.length === 0) {
      return [];
    }

    const values = [];
    const placeholders = [];
    let paramCount = 1;

    items.forEach((item, index) => {
      const {
        orden_id,
        item_numero,
        descripcion,
        unidad_id,
        cantidad,
        precio_unitario,
        subtotal,
        producto_id
      } = item;

      placeholders.push(
        `($${paramCount}, $${paramCount + 1}, $${paramCount + 2}, $${paramCount + 3}, $${paramCount + 4}, $${paramCount + 5}, $${paramCount + 6}, $${paramCount + 7})`
      );

      values.push(
        orden_id, item_numero, descripcion, unidad_id, cantidad,
        precio_unitario, subtotal, producto_id
      );

      paramCount += 8;
    });

    const text = `
      INSERT INTO orden_items (
        orden_id, item_numero, descripcion, unidad_id, cantidad, 
        precio_unitario, subtotal, producto_id
      ) VALUES ${placeholders.join(', ')}
      RETURNING *
    `;

    const result = await query(text, values);
    return result.rows;
  }
}

module.exports = OrdenItem;
