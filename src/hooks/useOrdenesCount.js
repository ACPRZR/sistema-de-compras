import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

/**
 * Hook para obtener conteos de órdenes para badges y notificaciones
 */
export const useOrdenesCount = () => {
  const [counts, setCounts] = useState({
    pendientes: 0,
    revision: 0,
    aprobadas: 0,
    total: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar conteos
  const cargarConteos = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiService.getOrdenesStats();
      const stats = result.data || {};
      
      setCounts({
        pendientes: parseInt(stats.ordenes_revision || 0) + parseInt(stats.ordenes_creadas || 0),
        revision: parseInt(stats.ordenes_revision || 0),
        aprobadas: parseInt(stats.ordenes_aprobadas || 0),
        total: parseInt(stats.total_ordenes || 0)
      });
    } catch (err) {
      console.error('Error cargando conteos:', err);
      setError('Error al cargar conteos');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    cargarConteos();
  }, [cargarConteos]);

  // Actualizar conteos
  const actualizarConteos = useCallback(() => {
    cargarConteos();
  }, [cargarConteos]);

  return {
    counts,
    loading,
    error,
    actualizarConteos
  };
};
