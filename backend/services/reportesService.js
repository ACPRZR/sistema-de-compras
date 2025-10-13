const db = require('../config/database');

class ReportesService {
  
  // 📊 DASHBOARD - Estadísticas generales
  async getDashboardStats(filtros = {}) {
    try {
      const whereConditions = this.buildWhereConditions(filtros);
      const params = this.buildParams(filtros);
      
      const query = `
        SELECT 
          COUNT(*) as total_ordenes,
          COALESCE(SUM(oc.total), 0) as monto_total,
          COALESCE(AVG(oc.total), 0) as monto_promedio,
          COUNT(CASE WHEN e.codigo = 'creada' THEN 1 END) as ordenes_creadas,
          COUNT(CASE WHEN e.codigo = 'revision' THEN 1 END) as ordenes_revision,
          COUNT(CASE WHEN e.codigo = 'aprobada' THEN 1 END) as ordenes_aprobadas,
          COUNT(CASE WHEN e.codigo = 'enviada' THEN 1 END) as ordenes_enviadas,
          COUNT(CASE WHEN e.codigo = 'completada' THEN 1 END) as ordenes_completadas,
          COUNT(CASE WHEN e.codigo = 'cancelada' THEN 1 END) as ordenes_canceladas
        FROM ordenes_compra oc
        LEFT JOIN estados_orden e ON oc.estado_id = e.id
        ${whereConditions}
      `;
      
      const result = await db.query(query, params);
      const stats = result.rows[0];
      
      return {
        estadisticas_generales: {
          total_ordenes: parseInt(stats.total_ordenes) || 0,
          monto_total: parseFloat(stats.monto_total) || 0,
          monto_promedio: parseFloat(stats.monto_promedio) || 0
        },
        ordenes_por_estado: {
          creadas: parseInt(stats.ordenes_creadas) || 0,
          revision: parseInt(stats.ordenes_revision) || 0,
          aprobadas: parseInt(stats.ordenes_aprobadas) || 0,
          enviadas: parseInt(stats.ordenes_enviadas) || 0,
          completadas: parseInt(stats.ordenes_completadas) || 0,
          canceladas: parseInt(stats.ordenes_canceladas) || 0
        }
      };
    } catch (error) {
      console.error('Error en getDashboardStats:', error);
      throw error;
    }
  }

  // 📈 TENDENCIAS - Análisis temporal
  async getTendencias(filtros = {}) {
    try {
      const whereConditions = this.buildWhereConditions(filtros);
      const params = this.buildParams(filtros);
      
      const query = `
        SELECT 
          TO_CHAR(oc.fecha_creacion, 'YYYY-MM') as mes,
          COUNT(*) as total_ordenes,
          COALESCE(SUM(oc.total), 0) as monto_total
        FROM ordenes_compra oc
        LEFT JOIN estados_orden e ON oc.estado_id = e.id
        ${whereConditions}
        GROUP BY TO_CHAR(oc.fecha_creacion, 'YYYY-MM')
        ORDER BY TO_CHAR(oc.fecha_creacion, 'YYYY-MM') DESC
        LIMIT 12
      `;
      
      const result = await db.query(query, params);
      
      return {
        tendencias: result.rows.map(row => ({
          mes: row.mes,
          total_ordenes: parseInt(row.total_ordenes) || 0,
          monto_total: parseFloat(row.monto_total) || 0
        }))
      };
    } catch (error) {
      console.error('Error en getTendencias:', error);
      throw error;
    }
  }

  // 🏢 CATEGORÍAS - Análisis por categorías
  async getAnalisisCategorias(filtros = {}) {
    try {
      const whereConditions = this.buildWhereConditions(filtros);
      const params = this.buildParams(filtros);
      const limite = filtros.limite || 10;
      
      const query = `
        SELECT 
          c.id,
          c.nombre as categoria,
          COUNT(*) as total_ordenes,
          COALESCE(SUM(oc.total), 0) as monto_total
        FROM ordenes_compra oc
        LEFT JOIN categorias_compra c ON oc.categoria_id = c.id
        LEFT JOIN estados_orden e ON oc.estado_id = e.id
        ${whereConditions}
        GROUP BY c.id, c.nombre
        ORDER BY total_ordenes DESC
        LIMIT $${params.length + 1}
      `;
      
      params.push(limite);
      const result = await db.query(query, params);
      
      return {
        categorias: result.rows.map(row => ({
          id: row.id,
          nombre: row.categoria,
          total_ordenes: parseInt(row.total_ordenes) || 0,
          monto_total: parseFloat(row.monto_total) || 0
        }))
      };
    } catch (error) {
      console.error('Error en getAnalisisCategorias:', error);
      throw error;
    }
  }

  // 🏪 PROVEEDORES - Análisis por proveedores
  async getAnalisisProveedores(filtros = {}) {
    try {
      const whereConditions = this.buildWhereConditions(filtros);
      const params = this.buildParams(filtros);
      const limite = filtros.limite || 10;
      
      const query = `
        SELECT 
          p.id,
          p.nombre as proveedor,
          COUNT(*) as total_ordenes,
          COALESCE(SUM(oc.total), 0) as monto_total
        FROM ordenes_compra oc
        LEFT JOIN proveedores p ON oc.proveedor_id = p.id
        LEFT JOIN estados_orden e ON oc.estado_id = e.id
        ${whereConditions}
        GROUP BY p.id, p.nombre
        ORDER BY total_ordenes DESC
        LIMIT $${params.length + 1}
      `;
      
      params.push(limite);
      const result = await db.query(query, params);
      
      return {
        proveedores: result.rows.map(row => ({
          id: row.id,
          nombre: row.proveedor,
          total_ordenes: parseInt(row.total_ordenes) || 0,
          monto_total: parseFloat(row.monto_total) || 0
        }))
      };
    } catch (error) {
      console.error('Error en getAnalisisProveedores:', error);
      throw error;
    }
  }

  // 🏢 UNIDADES DE NEGOCIO - Análisis por unidades de negocio
  async getAnalisisUnidadesNegocio(filtros = {}) {
    try {
      const whereConditions = this.buildWhereConditions(filtros);
      const params = this.buildParams(filtros);
      const limite = filtros.limite || 10;
      
      const query = `
        SELECT 
          un.id,
          un.nombre as unidad_negocio,
          COUNT(*) as total_ordenes,
          COALESCE(SUM(oc.total), 0) as monto_total
        FROM ordenes_compra oc
        LEFT JOIN unidades_negocio un ON oc.unidad_negocio_id = un.id
        LEFT JOIN estados_orden e ON oc.estado_id = e.id
        ${whereConditions}
        GROUP BY un.id, un.nombre
        ORDER BY total_ordenes DESC
        LIMIT $${params.length + 1}
      `;
      
      params.push(limite);
      const result = await db.query(query, params);
      
      return {
        unidades_negocio: result.rows.map(row => ({
          id: row.id,
          nombre: row.unidad_negocio,
          total_ordenes: parseInt(row.total_ordenes) || 0,
          monto_total: parseFloat(row.monto_total) || 0
        }))
      };
    } catch (error) {
      console.error('Error en getAnalisisUnidadesNegocio:', error);
      throw error;
    }
  }

  // ⚡ EFICIENCIA - Análisis de eficiencia operativa
  async getAnalisisEficiencia(filtros = {}) {
    try {
      const whereConditions = this.buildWhereConditions(filtros);
      const params = this.buildParams(filtros);
      
      const query = `
        SELECT 
          COUNT(*) as total_ordenes,
          COUNT(CASE WHEN e.codigo = 'completada' THEN 1 END) as ordenes_completadas,
          COUNT(CASE WHEN e.codigo = 'cancelada' THEN 1 END) as ordenes_canceladas
        FROM ordenes_compra oc
        LEFT JOIN estados_orden e ON oc.estado_id = e.id
        ${whereConditions}
      `;
      
      const result = await db.query(query, params);
      const stats = result.rows[0];
      
      const total = parseInt(stats.total_ordenes) || 0;
      const completadas = parseInt(stats.ordenes_completadas) || 0;
      const canceladas = parseInt(stats.ordenes_canceladas) || 0;
      
      return {
        total_ordenes: total,
        ordenes_completadas: completadas,
        ordenes_canceladas: canceladas,
        tasa_completadas: total > 0 ? ((completadas / total) * 100).toFixed(2) : 0,
        tasa_canceladas: total > 0 ? ((canceladas / total) * 100).toFixed(2) : 0
      };
    } catch (error) {
      console.error('Error en getAnalisisEficiencia:', error);
      throw error;
    }
  }

  // 📊 RESUMEN EJECUTIVO - Vista consolidada
  async getResumenEjecutivo(filtros = {}) {
    try {
      const [dashboard, tendencias, categorias, proveedores, unidades, eficiencia] = await Promise.all([
        this.getDashboardStats(filtros),
        this.getTendencias(filtros),
        this.getAnalisisCategorias({ ...filtros, limite: 5 }),
        this.getAnalisisProveedores({ ...filtros, limite: 5 }),
        this.getAnalisisUnidadesNegocio({ ...filtros, limite: 5 }),
        this.getAnalisisEficiencia(filtros)
      ]);
      
      return {
        dashboard,
        tendencias: tendencias.tendencias.slice(0, 6),
        top_categorias: categorias.categorias,
        top_proveedores: proveedores.proveedores,
        top_unidades: unidades.unidades_negocio,
        eficiencia
      };
    } catch (error) {
      console.error('Error en getResumenEjecutivo:', error);
      throw error;
    }
  }

  // 📈 PROYECCIONES - Análisis predictivo básico
  async getProyecciones(filtros = {}) {
    try {
      const tendencias = await this.getTendencias(filtros);
      
      return {
        proyecciones: tendencias.tendencias.slice(0, 6),
        mensaje: "Proyecciones básicas basadas en tendencias históricas"
      };
    } catch (error) {
      console.error('Error en getProyecciones:', error);
      throw error;
    }
  }

  // 🔧 MÉTODOS AUXILIARES

  buildWhereConditions(filtros) {
    const conditions = [];
    
    if (filtros.fecha_inicio) {
      conditions.push(`oc.fecha_creacion >= $${conditions.length + 1}`);
    }
    if (filtros.fecha_fin) {
      conditions.push(`oc.fecha_creacion <= $${conditions.length + 1}`);
    }
    if (filtros.categoria_id) {
      conditions.push(`oc.categoria_id = $${conditions.length + 1}`);
    }
    if (filtros.proveedor_id) {
      conditions.push(`oc.proveedor_id = $${conditions.length + 1}`);
    }
    if (filtros.estado_id) {
      conditions.push(`oc.estado_id = $${conditions.length + 1}`);
    }
    if (filtros.unidad_negocio_id) {
      conditions.push(`oc.unidad_negocio_id = $${conditions.length + 1}`);
    }
    
    return conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  }

  buildParams(filtros) {
    const params = [];
    
    if (filtros.fecha_inicio) params.push(filtros.fecha_inicio);
    if (filtros.fecha_fin) params.push(filtros.fecha_fin);
    if (filtros.categoria_id) params.push(filtros.categoria_id);
    if (filtros.proveedor_id) params.push(filtros.proveedor_id);
    if (filtros.estado_id) params.push(filtros.estado_id);
    if (filtros.unidad_negocio_id) params.push(filtros.unidad_negocio_id);
    
    return params;
  }
}

module.exports = ReportesService;