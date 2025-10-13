import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

/**
 * Hook para manejar órdenes pendientes con base de datos
 */
export const useOrdenesPendientes = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    total_ordenes: 0,
    ordenes_creadas: 0,
    ordenes_revision: 0,
    ordenes_aprobadas: 0,
    ordenes_enviadas: 0,
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

  // Cargar órdenes
  const cargarOrdenes = useCallback(async (filtrosAplicados = filtros) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiService.getOrdenes(filtrosAplicados);
      setOrdenes(result.data || []);
    } catch (err) {
      console.error('Error cargando órdenes:', err);
      setError('Error al cargar las órdenes');
      setOrdenes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar estadísticas
  const cargarEstadisticas = useCallback(async () => {
    try {
      const result = await apiService.getOrdenesStats();
      setEstadisticas(result.data || {});
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
    }
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    cargarOrdenes(filtros);
    cargarEstadisticas();
  }, [filtros]);

  // Aplicar filtros
  const aplicarFiltros = useCallback((nuevosFiltros) => {
    setFiltros(prev => ({ ...prev, ...nuevosFiltros }));
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

  // Actualizar estado de orden
  const actualizarEstadoOrden = useCallback(async (ordenId, nuevoEstadoId) => {
    try {
      await apiService.updateOrden(ordenId, { estado_id: nuevoEstadoId });
      // Recargar datos
      cargarOrdenes();
      cargarEstadisticas();
    } catch (err) {
      console.error('Error actualizando estado:', err);
      throw err;
    }
  }, [cargarOrdenes, cargarEstadisticas]);

  // Eliminar orden
  const eliminarOrden = useCallback(async (ordenId) => {
    try {
      await apiService.deleteOrden(ordenId);
      // Recargar datos
      cargarOrdenes();
      cargarEstadisticas();
    } catch (err) {
      console.error('Error eliminando orden:', err);
      throw err;
    }
  }, [cargarOrdenes, cargarEstadisticas]);

  // Calcular días pendientes
  const calcularDiasPendientes = useCallback((fechaCreacion) => {
    const hoy = new Date();
    const fecha = new Date(fechaCreacion);
    const diffTime = Math.abs(hoy - fecha);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, []);

  // Obtener color de estado
  const getEstadoColor = useCallback((estado) => {
    switch (estado) {
      case 'creada':
        return 'bg-blue-100 text-blue-800';
      case 'revision':
        return 'bg-warning-100 text-warning-800';
      case 'aprobada':
        return 'bg-success-100 text-success-800';
      case 'enviada':
        return 'bg-primary-100 text-primary-800';
      case 'completada':
        return 'bg-green-100 text-green-800';
      case 'cancelada':
        return 'bg-danger-100 text-danger-800';
      default:
        return 'bg-secondary-100 text-secondary-800';
    }
  }, []);

  // Obtener color de prioridad
  const getPrioridadColor = useCallback((prioridad) => {
    switch (prioridad) {
      case 'urgente':
        return 'bg-danger-100 text-danger-800';
      case 'normal':
        return 'bg-success-100 text-success-800';
      default:
        return 'bg-secondary-100 text-secondary-800';
    }
  }, []);

  // Obtener etiqueta de estado
  const getEstadoLabel = useCallback((estado) => {
    switch (estado) {
      case 'creada':
        return 'Creada';
      case 'revision':
        return 'En Revisión';
      case 'aprobada':
        return 'Aprobada';
      case 'enviada':
        return 'Enviada';
      case 'completada':
        return 'Completada';
      case 'cancelada':
        return 'Cancelada';
      default:
        return estado;
    }
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
    cargarOrdenes,
    cargarEstadisticas,
    aplicarFiltros,
    limpiarFiltros,
    actualizarEstadoOrden,
    eliminarOrden,
    
    // Utilidades
    calcularDiasPendientes,
    getEstadoColor,
    getPrioridadColor,
    getEstadoLabel
  };
};
