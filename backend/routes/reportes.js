const express = require('express');
const router = express.Router();
const ReportesService = require('../services/reportesService');

// Instancia del servicio de reportes
const reportesService = new ReportesService();

// Middleware para validar parámetros de fecha
const validateDateRange = (req, res, next) => {
  const { fecha_inicio, fecha_fin } = req.query;
  
  if (fecha_inicio && fecha_fin) {
    const inicio = new Date(fecha_inicio);
    const fin = new Date(fecha_fin);
    
    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Formato de fecha inválido. Use YYYY-MM-DD'
      });
    }
    
    if (inicio > fin) {
      return res.status(400).json({
        success: false,
        error: 'La fecha de inicio debe ser anterior a la fecha de fin'
      });
    }
  }
  
  next();
};

// 📊 DASHBOARD - Estadísticas generales
router.get('/dashboard', validateDateRange, async (req, res) => {
  try {
    const filtros = {
      fecha_inicio: req.query.fecha_inicio,
      fecha_fin: req.query.fecha_fin,
      categoria_id: req.query.categoria_id,
      proveedor_id: req.query.proveedor_id,
      estado_id: req.query.estado_id,
      unidad_negocio_id: req.query.unidad_negocio_id
    };

    const dashboardData = await reportesService.getDashboardStats(filtros);
    
    res.json({
      success: true,
      data: dashboardData,
      metadata: {
        fecha_generacion: new Date().toISOString(),
        filtros_aplicados: filtros
      }
    });
  } catch (error) {
    console.error('Error en dashboard de reportes:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// 📈 TENDENCIAS - Análisis temporal
router.get('/tendencias', validateDateRange, async (req, res) => {
  try {
    const filtros = {
      fecha_inicio: req.query.fecha_inicio,
      fecha_fin: req.query.fecha_fin,
      tipo_periodo: req.query.tipo_periodo || 'mensual', // mensual, trimestral, anual
      categoria_id: req.query.categoria_id,
      proveedor_id: req.query.proveedor_id,
      estado_id: req.query.estado_id,
      unidad_negocio_id: req.query.unidad_negocio_id
    };

    const tendenciasData = await reportesService.getTendencias(filtros);
    
    res.json({
      success: true,
      data: tendenciasData,
      metadata: {
        fecha_generacion: new Date().toISOString(),
        filtros_aplicados: filtros
      }
    });
  } catch (error) {
    console.error('Error en tendencias de reportes:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// 🏢 CATEGORÍAS - Análisis por categorías
router.get('/categorias', validateDateRange, async (req, res) => {
  try {
    const filtros = {
      fecha_inicio: req.query.fecha_inicio,
      fecha_fin: req.query.fecha_fin,
      proveedor_id: req.query.proveedor_id,
      estado_id: req.query.estado_id,
      unidad_negocio_id: req.query.unidad_negocio_id,
      limite: parseInt(req.query.limite) || 10
    };

    const categoriasData = await reportesService.getAnalisisCategorias(filtros);
    
    res.json({
      success: true,
      data: categoriasData,
      metadata: {
        fecha_generacion: new Date().toISOString(),
        filtros_aplicados: filtros
      }
    });
  } catch (error) {
    console.error('Error en análisis de categorías:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// 🏪 PROVEEDORES - Análisis por proveedores
router.get('/proveedores', validateDateRange, async (req, res) => {
  try {
    const filtros = {
      fecha_inicio: req.query.fecha_inicio,
      fecha_fin: req.query.fecha_fin,
      categoria_id: req.query.categoria_id,
      estado_id: req.query.estado_id,
      unidad_negocio_id: req.query.unidad_negocio_id,
      tipo_analisis: req.query.tipo_analisis || 'volumen', // volumen, monto, rendimiento
      limite: parseInt(req.query.limite) || 10
    };

    const proveedoresData = await reportesService.getAnalisisProveedores(filtros);
    
    res.json({
      success: true,
      data: proveedoresData,
      metadata: {
        fecha_generacion: new Date().toISOString(),
        filtros_aplicados: filtros
      }
    });
  } catch (error) {
    console.error('Error en análisis de proveedores:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// 🏢 UNIDADES DE NEGOCIO - Análisis por unidades de negocio
router.get('/unidades-negocio', validateDateRange, async (req, res) => {
  try {
    const filtros = {
      fecha_inicio: req.query.fecha_inicio,
      fecha_fin: req.query.fecha_fin,
      categoria_id: req.query.categoria_id,
      proveedor_id: req.query.proveedor_id,
      estado_id: req.query.estado_id,
      tipo_analisis: req.query.tipo_analisis || 'completo', // completo, rendimiento, comparativo
      limite: parseInt(req.query.limite) || 10
    };

    const unidadesData = await reportesService.getAnalisisUnidadesNegocio(filtros);
    
    res.json({
      success: true,
      data: unidadesData,
      metadata: {
        fecha_generacion: new Date().toISOString(),
        filtros_aplicados: filtros
      }
    });
  } catch (error) {
    console.error('Error en análisis de unidades de negocio:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// ⚡ EFICIENCIA - Análisis de eficiencia operativa
router.get('/eficiencia', validateDateRange, async (req, res) => {
  try {
    const filtros = {
      fecha_inicio: req.query.fecha_inicio,
      fecha_fin: req.query.fecha_fin,
      categoria_id: req.query.categoria_id,
      proveedor_id: req.query.proveedor_id,
      unidad_negocio_id: req.query.unidad_negocio_id,
      tipo_metrica: req.query.tipo_metrica || 'tiempo' // tiempo, productividad, calidad
    };

    const eficienciaData = await reportesService.getAnalisisEficiencia(filtros);
    
    res.json({
      success: true,
      data: eficienciaData,
      metadata: {
        fecha_generacion: new Date().toISOString(),
        filtros_aplicados: filtros
      }
    });
  } catch (error) {
    console.error('Error en análisis de eficiencia:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// 📊 RESUMEN EJECUTIVO - Vista consolidada
router.get('/resumen-ejecutivo', validateDateRange, async (req, res) => {
  try {
    const filtros = {
      fecha_inicio: req.query.fecha_inicio,
      fecha_fin: req.query.fecha_fin,
      categoria_id: req.query.categoria_id,
      proveedor_id: req.query.proveedor_id,
      estado_id: req.query.estado_id,
      unidad_negocio_id: req.query.unidad_negocio_id
    };

    const resumenData = await reportesService.getResumenEjecutivo(filtros);
    
    res.json({
      success: true,
      data: resumenData,
      metadata: {
        fecha_generacion: new Date().toISOString(),
        filtros_aplicados: filtros
      }
    });
  } catch (error) {
    console.error('Error en resumen ejecutivo:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// 📈 PROYECCIONES - Análisis predictivo
router.get('/proyecciones', validateDateRange, async (req, res) => {
  try {
    const filtros = {
      fecha_inicio: req.query.fecha_inicio,
      fecha_fin: req.query.fecha_fin,
      categoria_id: req.query.categoria_id,
      proveedor_id: req.query.proveedor_id,
      unidad_negocio_id: req.query.unidad_negocio_id,
      periodo_proyeccion: req.query.periodo_proyeccion || 6 // meses
    };

    const proyeccionesData = await reportesService.getProyecciones(filtros);
    
    res.json({
      success: true,
      data: proyeccionesData,
      metadata: {
        fecha_generacion: new Date().toISOString(),
        filtros_aplicados: filtros
      }
    });
  } catch (error) {
    console.error('Error en proyecciones:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;
