import { useState, useEffect } from 'react';
import apiService from '../services/api';

export const useMaestros = () => {
  const [maestros, setMaestros] = useState({
    unidadesNegocio: [],
    ubicacionesEntrega: [],
    condicionesPago: [],
    estadosOrden: [],
    tiposOrden: [],
    prioridades: [],
    unidadesAutoriza: [],
    configuracionEmpresa: null,
    usuarios: [],
    categorias: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarMaestros = async () => {
      try {
        setLoading(true);
        
        // Cargar todos los datos maestros en paralelo desde endpoints individuales
        const [
          unidadesNegocio,
          ubicacionesEntrega,
          condicionesPago,
          tiposOrden,
          unidadesAutoriza,
          configuracion,
          categorias
        ] = await Promise.all([
          apiService.get('/unidades-negocio'),
          apiService.get('/ubicaciones-entrega'),
          apiService.get('/condiciones-pago'),
          apiService.get('/tipos-orden'),
          apiService.get('/unidades-autoriza'),
          apiService.get('/configuracion-empresa'),
          apiService.getCategorias()
        ]);

        const maestrosData = {
          unidadesNegocio: unidadesNegocio.data || [],
          ubicacionesEntrega: ubicacionesEntrega.data || [],
          condicionesPago: condicionesPago.data || [],
          estadosOrden: [],
          tiposOrden: tiposOrden.data || [],
          prioridades: [],
          unidadesAutoriza: unidadesAutoriza.data || [],
          configuracionEmpresa: configuracion.data || null,
          usuarios: [],
          categorias: categorias.data || []
        };
        
        console.log('📊 Datos maestros cargados:', {
          unidadesNegocio: maestrosData.unidadesNegocio.length,
          ubicacionesEntrega: maestrosData.ubicacionesEntrega.length,
          categorias: maestrosData.categorias.length,
          tiposOrden: maestrosData.tiposOrden.length,
          unidadesAutoriza: maestrosData.unidadesAutoriza.length
        });
        
        setMaestros(maestrosData);
      } catch (err) {
        console.error('❌ Error cargando datos maestros:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    cargarMaestros();
  }, []);

  // Formatear datos para los dropdowns de Select
  const formatearParaSelect = (items, valueKey = 'codigo', labelKey = 'nombre') => {
    return items.map(item => ({
      value: item[valueKey],
      label: item[labelKey]
    }));
  };

  return {
    maestros,
    loading,
    error,
    // Helpers para obtener datos formateados para Select
    getUnidadesNegocioOptions: () => formatearParaSelect(maestros.unidadesNegocio),
    getUbicacionesEntregaOptions: () => maestros.ubicacionesEntrega.map(ub => ({
      value: ub.codigo,
      label: ub.nombre,
      direccion: ub.direccion
    })),
    getCondicionesPagoOptions: () => formatearParaSelect(maestros.condicionesPago),
    getTiposOrdenOptions: () => maestros.tiposOrden.map(tipo => ({
      value: tipo.codigo,
      label: tipo.nombre,
      description: tipo.descripcion
    })),
    getUnidadesAutorizaOptions: () => formatearParaSelect(maestros.unidadesAutoriza),
    getCategoriasOptions: () => maestros.categorias.map(cat => ({
      value: cat.codigo,
      label: cat.nombre
    }))
  };
};

