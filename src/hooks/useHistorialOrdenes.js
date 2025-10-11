import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

/**
 * Hook para manejar historial de órdenes con base de datos
 */
export const useHistorialOrdenes = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    total_ordenes: 0,
    ordenes_completadas: 0,
    ordenes_canceladas: 0,
    monto_total: 0,
    monto_promedio: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({
    estado_id: '',
    categoria_id: '',
    proveedor_id: '',
    fecha_desde: '',
    fecha_hasta: '',
    busqueda: ''
  });

  // Calcular estadísticas basadas en los datos del historial
  const calcularEstadisticas = useCallback((ordenes) => {
    const aprobadas = ordenes.filter(orden => orden.estado_nombre?.toLowerCase() === 'aprobada');
    const canceladas = ordenes.filter(orden => orden.estado_nombre?.toLowerCase() === 'cancelada');
    
    const totalAprobadas = aprobadas.length;
    const totalCanceladas = canceladas.length;
    const totalOrdenes = totalAprobadas + totalCanceladas;
    
    const montoTotal = ordenes.reduce((sum, orden) => sum + (parseFloat(orden.total) || 0), 0);
    const montoPromedio = totalOrdenes > 0 ? montoTotal / totalOrdenes : 0;
    
    setEstadisticas({
      total_ordenes: totalOrdenes,
      ordenes_completadas: totalAprobadas, // En el historial, "completadas" son las aprobadas
      ordenes_canceladas: totalCanceladas,
      monto_total: montoTotal,
      monto_promedio: montoPromedio
    });
  }, []);

  // Cargar órdenes del historial (completadas y canceladas)
  const cargarHistorial = useCallback(async (filtrosAplicados = filtros) => {
    setLoading(true);
    setError(null);
    
    try {
      // Hacer dos consultas separadas para evitar problemas con filtros complejos
      const [aprobadasResult, canceladasResult] = await Promise.all([
        apiService.getOrdenes({ ...filtrosAplicados, estado_id: 3 }), // Aprobadas
        apiService.getOrdenes({ ...filtrosAplicados, estado_id: 6 })  // Canceladas
      ]);

      const aprobadas = aprobadasResult.data || [];
      const canceladas = canceladasResult.data || [];
      
      // Combinar y ordenar por fecha de creación descendente
      const todasLasOrdenes = [...aprobadas, ...canceladas].sort((a, b) => 
        new Date(b.fecha_creacion) - new Date(a.fecha_creacion)
      );
      
      setOrdenes(todasLasOrdenes);
      
      // Calcular estadísticas basadas en los datos cargados
      calcularEstadisticas(todasLasOrdenes);
    } catch (err) {
      console.error('Error cargando historial:', err);
      setError('Error al cargar el historial');
      setOrdenes([]);
    } finally {
      setLoading(false);
    }
  }, [filtros, calcularEstadisticas]);

  // Cargar datos iniciales
  useEffect(() => {
    cargarHistorial();
  }, [cargarHistorial]);

  // Aplicar filtros
  const aplicarFiltros = useCallback((nuevosFiltros) => {
    setFiltros(prev => ({ ...prev, ...nuevosFiltros }));
    // Los filtros se aplicarán automáticamente en el próximo useEffect
  }, []);

  // Limpiar filtros
  const limpiarFiltros = useCallback(() => {
    setFiltros({
      estado_id: '',
      categoria_id: '',
      proveedor_id: '',
      fecha_desde: '',
      fecha_hasta: '',
      busqueda: ''
    });
  }, []);

  // Obtener color de estado
  const getEstadoColor = useCallback((estado) => {
    switch (estado?.toLowerCase()) {
      case 'aprobada':
        return 'bg-success-100 text-success-800';
      case 'completada':
        return 'bg-success-100 text-success-800';
      case 'cancelada':
        return 'bg-danger-100 text-danger-800';
      case 'rechazada':
        return 'bg-danger-100 text-danger-800';
      default:
        return 'bg-secondary-100 text-secondary-800';
    }
  }, []);

  // Obtener etiqueta de estado
  const getEstadoLabel = useCallback((estado) => {
    switch (estado?.toLowerCase()) {
      case 'aprobada':
        return 'Aprobada';
      case 'completada':
        return 'Completada';
      case 'cancelada':
        return 'Cancelada';
      case 'rechazada':
        return 'Rechazada';
      default:
        return estado || 'Desconocido';
    }
  }, []);

  // Obtener icono de estado
  const getEstadoIcon = useCallback((estado) => {
    switch (estado?.toLowerCase()) {
      case 'aprobada':
        return 'CheckCircleIcon';
      case 'completada':
        return 'CheckCircleIcon';
      case 'cancelada':
      case 'rechazada':
        return 'XCircleIcon';
      default:
        return 'DocumentTextIcon';
    }
  }, []);

  // Formatear fecha
  const formatearFecha = useCallback((fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-PE');
  }, []);

  // Formatear moneda
  const formatearMoneda = useCallback((monto) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(monto || 0);
  }, []);

  return {
    // Datos
    ordenes,
    estadisticas,
    filtros,
    
    // Estados
    loading,
    error,
    
    // Acciones
    cargarHistorial,
    aplicarFiltros,
    limpiarFiltros,
    
    // Utilidades
    getEstadoColor,
    getEstadoLabel,
    getEstadoIcon,
    formatearFecha,
    formatearMoneda
  };
};
