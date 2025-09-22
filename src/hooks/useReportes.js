import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

export const useReportes = () => {
  // Estados principales
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    dashboard: null,
    tendencias: [],
    categorias: [],
    proveedores: [],
    unidadesNegocio: [],
    eficiencia: null,
    resumenEjecutivo: null,
    proyecciones: []
  });

  // Estados de filtros
  const [filtros, setFiltros] = useState({
    fecha_inicio: '',
    fecha_fin: '',
    categoria_id: '',
    proveedor_id: '',
    estado_id: '',
    unidad_negocio_id: '',
    tipo_periodo: 'mensual',
    tipo_analisis: 'volumen',
    limite: 10
  });

  // Estados de UI
  const [vistaActual, setVistaActual] = useState('dashboard');
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
  const [exportando, setExportando] = useState(false);

  // 🔄 Cargar datos del dashboard
  const cargarDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getReportesDashboard(filtros);
      if (response.success) {
        setData(prev => ({ ...prev, dashboard: response.data }));
      } else {
        throw new Error(response.error || 'Error en la respuesta del servidor');
      }
    } catch (err) {
      console.error('Error cargando dashboard:', err);
      setError('Error al cargar datos del dashboard');
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  // 📈 Cargar tendencias
  const cargarTendencias = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getReportesTendencias(filtros);
      if (response.success) {
        setData(prev => ({ ...prev, tendencias: response.data.tendencias }));
      } else {
        throw new Error(response.error || 'Error en la respuesta del servidor');
      }
    } catch (err) {
      console.error('Error cargando tendencias:', err);
      setError('Error al cargar datos de tendencias');
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  // 🏢 Cargar categorías
  const cargarCategorias = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getReportesCategorias(filtros);
      if (response.success) {
        setData(prev => ({ ...prev, categorias: response.data.categorias }));
      } else {
        throw new Error(response.error || 'Error en la respuesta del servidor');
      }
    } catch (err) {
      console.error('Error cargando categorías:', err);
      setError('Error al cargar datos de categorías');
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  // 🏪 Cargar proveedores
  const cargarProveedores = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getReportesProveedores(filtros);
      if (response.success) {
        setData(prev => ({ ...prev, proveedores: response.data.proveedores }));
      } else {
        throw new Error(response.error || 'Error en la respuesta del servidor');
      }
    } catch (err) {
      console.error('Error cargando proveedores:', err);
      setError('Error al cargar datos de proveedores');
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  // 🏢 Cargar unidades de negocio
  const cargarUnidadesNegocio = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getReportesUnidadesNegocio(filtros);
      if (response.success) {
        setData(prev => ({ ...prev, unidadesNegocio: response.data.unidades_negocio }));
      } else {
        throw new Error(response.error || 'Error en la respuesta del servidor');
      }
    } catch (err) {
      console.error('Error cargando unidades de negocio:', err);
      setError('Error al cargar datos de unidades de negocio');
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  // ⚡ Cargar eficiencia
  const cargarEficiencia = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getReportesEficiencia(filtros);
      if (response.success) {
        setData(prev => ({ ...prev, eficiencia: response.data }));
      } else {
        throw new Error(response.error || 'Error en la respuesta del servidor');
      }
    } catch (err) {
      console.error('Error cargando eficiencia:', err);
      setError('Error al cargar datos de eficiencia');
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  // 📊 Cargar resumen ejecutivo
  const cargarResumenEjecutivo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getReportesResumenEjecutivo(filtros);
      if (response.success) {
        setData(prev => ({ ...prev, resumenEjecutivo: response.data }));
      } else {
        throw new Error(response.error || 'Error en la respuesta del servidor');
      }
    } catch (err) {
      console.error('Error cargando resumen ejecutivo:', err);
      setError('Error al cargar resumen ejecutivo');
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  // 📈 Cargar proyecciones
  const cargarProyecciones = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getReportesProyecciones(filtros);
      if (response.success) {
        setData(prev => ({ ...prev, proyecciones: response.data.proyecciones }));
      } else {
        throw new Error(response.error || 'Error en la respuesta del servidor');
      }
    } catch (err) {
      console.error('Error cargando proyecciones:', err);
      setError('Error al cargar proyecciones');
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  // 🔄 Cargar todos los datos
  const cargarTodosLosDatos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Solo cargar datos de la vista actual para evitar sobrecarga
      let response;
      switch (vistaActual) {
        case 'dashboard':
          response = await apiService.getReportesDashboard(filtros);
          if (response.success) {
            setData(prev => ({ ...prev, dashboard: response.data }));
          }
          break;
        case 'tendencias':
          response = await apiService.getReportesTendencias(filtros);
          if (response.success) {
            setData(prev => ({ ...prev, tendencias: response.data.tendencias }));
          }
          break;
        case 'categorias':
          response = await apiService.getReportesCategorias(filtros);
          if (response.success) {
            setData(prev => ({ ...prev, categorias: response.data.categorias }));
          }
          break;
        case 'proveedores':
          response = await apiService.getReportesProveedores(filtros);
          if (response.success) {
            setData(prev => ({ ...prev, proveedores: response.data.proveedores }));
          }
          break;
        case 'unidades-negocio':
          response = await apiService.getReportesUnidadesNegocio(filtros);
          if (response.success) {
            setData(prev => ({ ...prev, unidadesNegocio: response.data.unidades_negocio }));
          }
          break;
        case 'eficiencia':
          response = await apiService.getReportesEficiencia(filtros);
          if (response.success) {
            setData(prev => ({ ...prev, eficiencia: response.data }));
          }
          break;
        case 'resumen-ejecutivo':
          response = await apiService.getReportesResumenEjecutivo(filtros);
          if (response.success) {
            setData(prev => ({ ...prev, resumenEjecutivo: response.data }));
          }
          break;
        case 'proyecciones':
          response = await apiService.getReportesProyecciones(filtros);
          if (response.success) {
            setData(prev => ({ ...prev, proyecciones: response.data.proyecciones }));
          }
          break;
        default:
          response = await apiService.getReportesDashboard(filtros);
          if (response.success) {
            setData(prev => ({ ...prev, dashboard: response.data }));
          }
      }
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('Error al cargar los datos de reportes');
    } finally {
      setLoading(false);
    }
  }, [filtros, vistaActual]);

  // 📊 Actualizar filtros
  const actualizarFiltros = useCallback((nuevosFiltros) => {
    setFiltros(prev => ({ ...prev, ...nuevosFiltros }));
  }, []);

  // 🔄 Limpiar filtros
  const limpiarFiltros = useCallback(() => {
    setFiltros({
      fecha_inicio: '',
      fecha_fin: '',
      categoria_id: '',
      proveedor_id: '',
      estado_id: '',
      unidad_negocio_id: '',
      tipo_periodo: 'mensual',
      tipo_analisis: 'volumen',
      limite: 10
    });
  }, []);

  // 📤 Exportar a PDF
  const exportarPDF = useCallback(async (tipo = 'resumen') => {
    try {
      setExportando(true);
      
      const { jsPDF } = await import('jspdf');
      const { html2canvas } = await import('html2canvas');
      
      const doc = new jsPDF();
      const element = document.getElementById(`reporte-${tipo}`);
      
      if (element) {
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          allowTaint: true
        });
        
        const imgData = canvas.toDataURL('image/png');
        doc.addImage(imgData, 'PNG', 10, 10, 190, 0);
        doc.save(`reporte-${tipo}-${new Date().toISOString().split('T')[0]}.pdf`);
      }
    } catch (err) {
      console.error('Error exportando PDF:', err);
      setError('Error al exportar PDF');
    } finally {
      setExportando(false);
    }
  }, []);

  // 📊 Exportar a Excel
  const exportarExcel = useCallback(async (tipo = 'resumen') => {
    try {
      setExportando(true);
      
      const { utils, writeFile } = await import('xlsx');
      
      let datos = [];
      let nombreArchivo = '';
      
      switch (tipo) {
        case 'dashboard':
          datos = data.dashboard ? [data.dashboard] : [];
          nombreArchivo = 'dashboard';
          break;
        case 'tendencias':
          datos = data.tendencias;
          nombreArchivo = 'tendencias';
          break;
        case 'categorias':
          datos = data.categorias;
          nombreArchivo = 'categorias';
          break;
        case 'proveedores':
          datos = data.proveedores;
          nombreArchivo = 'proveedores';
          break;
        case 'unidades':
          datos = data.unidadesNegocio;
          nombreArchivo = 'unidades-negocio';
          break;
        default:
          datos = data.resumenEjecutivo ? [data.resumenEjecutivo] : [];
          nombreArchivo = 'resumen-ejecutivo';
      }
      
      const ws = utils.json_to_sheet(datos);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, 'Datos');
      
      writeFile(wb, `reporte-${nombreArchivo}-${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (err) {
      console.error('Error exportando Excel:', err);
      setError('Error al exportar Excel');
    } finally {
      setExportando(false);
    }
  }, [data]);

  // 🔄 Refrescar datos
  const refrescarDatos = useCallback(() => {
    cargarTodosLosDatos();
  }, [cargarTodosLosDatos]);

  // 📊 Cambiar vista
  const cambiarVista = useCallback((nuevaVista) => {
    setVistaActual(nuevaVista);
  }, []);

  // 🎯 Cargar datos iniciales
  useEffect(() => {
    cargarTodosLosDatos();
  }, [cargarTodosLosDatos]);

  // 🔄 Recargar cuando cambien los filtros (con debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (Object.values(filtros).some(valor => valor !== '')) {
        cargarTodosLosDatos();
      }
    }, 500); // Esperar 500ms antes de hacer la solicitud

    return () => clearTimeout(timeoutId);
  }, [filtros, cargarTodosLosDatos]);

  return {
    // Estados
    loading,
    error,
    data,
    filtros,
    vistaActual,
    filtrosAbiertos,
    exportando,
    
    // Acciones
    actualizarFiltros,
    limpiarFiltros,
    cargarDashboard,
    cargarTendencias,
    cargarCategorias,
    cargarProveedores,
    cargarUnidadesNegocio,
    cargarEficiencia,
    cargarResumenEjecutivo,
    cargarProyecciones,
    cargarTodosLosDatos,
    refrescarDatos,
    cambiarVista,
    exportarPDF,
    exportarExcel,
    setFiltrosAbiertos,
    
    // Utilidades
    limpiarError: () => setError(null)
  };
};
