import React, { useState, useEffect } from 'react';
import { 
  ClipboardDocumentListIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  ChartBarIcon as TimelineIcon,
  FunnelIcon,
  XMarkIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import Button from '../UI/Button';
import Input from '../UI/Input';
import TimelineStep from '../Timeline/TimelineStep';
import ResumenOrdenModal from '../Modals/ResumenOrdenModal';
import LinksAprobacionModal from '../Modals/LinksAprobacionModal';
import { useOrdenesPendientes } from '../../hooks/useOrdenesPendientes';
import apiService from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';

const OrdenesPendientes = () => {
  const {
    ordenes,
    estadisticas,
    filtros,
    loading,
    error,
    aplicarFiltros,
    limpiarFiltros,
    eliminarOrden,
    calcularDiasPendientes,
    getEstadoColor,
    getPrioridadColor,
    getEstadoLabel
  } = useOrdenesPendientes();

  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
  const [mostrarPanel, setMostrarPanel] = useState(false);
  const [mostrarResumen, setMostrarResumen] = useState(false);
  const [showLinksModal, setShowLinksModal] = useState(false);
  const [linksAprobacion, setLinksAprobacion] = useState(null);
  const [generandoLinks, setGenerandoLinks] = useState(false);
  const [tokenInfo, setTokenInfo] = useState(null);

  // Manejar filtros
  const handleFiltroChange = (campo, valor) => {
    aplicarFiltros({ [campo]: valor });
  };

  // Manejar acciones de orden
  const handleVerResumen = (orden) => {
    setOrdenSeleccionada(orden);
    setMostrarResumen(true);
  };

  const handleVerTimeline = (orden) => {
    setOrdenSeleccionada(orden);
    setMostrarPanel(true);
  };

  // Calcular información del token
  useEffect(() => {
    if (ordenSeleccionada?.token_aprobacion) {
      const expiraFecha = new Date(ordenSeleccionada.token_expira_fecha);
      const ahora = new Date();
      const diferenciaMs = expiraFecha - ahora;
      const expirado = diferenciaMs <= 0;
      const minutosRestantes = Math.ceil(diferenciaMs / (1000 * 60));
      const horasRestantes = Math.floor(minutosRestantes / 60);
      const mins = minutosRestantes % 60;
      
      setTokenInfo({
        existe: true,
        expirado: expirado,
        usado: ordenSeleccionada.token_usado,
        fecha_creacion: ordenSeleccionada.token_creado_fecha,
        fecha_expiracion: ordenSeleccionada.token_expira_fecha,
        horas_restantes: horasRestantes > 0 ? horasRestantes : 0,
        minutos_restantes: mins > 0 ? mins : 0,
        total_minutos_restantes: minutosRestantes > 0 ? minutosRestantes : 0
      });
    } else {
      setTokenInfo({ existe: false });
    }
  }, [ordenSeleccionada]);

  // Cerrar panel/modal cuando se presiona Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (mostrarPanel) setMostrarPanel(false);
        if (mostrarResumen) setMostrarResumen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mostrarPanel, mostrarResumen]);

  const handleEliminarOrden = async (orden) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta orden?')) {
      try {
        await eliminarOrden(orden.id);
        setMostrarPanel(false);
        setOrdenSeleccionada(null);
      } catch (err) {
        console.error('Error eliminando orden:', err);
      }
    }
  };

  const handleGenerarLinksAprobacion = async (orden) => {
    console.log('🔗 Generando links para orden:', orden);
    
    if (!orden?.id) {
      alert('Error: No se pudo obtener el ID de la orden');
      return;
    }

    setGenerandoLinks(true);
    try {
      const baseUrl = window.location.origin;
      console.log('🔗 Llamando al backend con ordenId:', orden.id);
      const response = await apiService.generarTokenAprobacion(orden.id, baseUrl);

      console.log('🔗 Respuesta del backend:', response);

      if (response.success) {
        setLinksAprobacion({
          urls: response.data.urls,
          whatsappMessage: response.data.whatsappMessage,
          numero_oc: orden.numero_oc
        });
        setShowLinksModal(true);
      } else {
        // Manejar error de token activo con información detallada
        if (response.error === 'TOKEN_ACTIVO' && response.data) {
          const { horas_restantes, minutos_restantes } = response.data;
          alert(`⏰ Ya existe un link de aprobación válido\n\n` +
                `Expira en: ${horas_restantes}h ${minutos_restantes}min\n\n` +
                `Puedes regenerar el link cuando expire.`);
        } else {
          alert('Error al generar links: ' + response.message);
        }
      }
    } catch (error) {
      console.error('❌ Error generando links:', error);
      alert('Error al generar los links de aprobación: ' + error.message);
    } finally {
      setGenerandoLinks(false);
    }
  };

  const handleCompletarOrden = async (orden) => {
    // Validar que la orden esté en estado aprobada
    if (orden.estado_id !== 3) {
      alert(`No se puede completar esta orden.\nEstado actual: ${getEstadoLabel(orden.estado_nombre?.toLowerCase())}\nSolo se pueden completar órdenes aprobadas.`);
      return;
    }

    if (window.confirm('¿Confirmas que esta orden ha sido completada?')) {
      try {
        const response = await apiService.completarOrden(orden.id, 'Álvaro Pérez Román');
        
        if (response.success) {
          alert('✅ Orden completada exitosamente');
          setMostrarPanel(false);
          setOrdenSeleccionada(null);
          window.location.reload();
        } else {
          throw new Error(response.message || 'Error desconocido');
        }
      } catch (err) {
        console.error('Error completando orden:', err);
        alert(`❌ Error al completar la orden:\n${err.message}`);
      }
    }
  };

  // Función para construir el timeline basado en el estado de la orden
  const construirTimeline = (orden) => {
    if (!orden) return [];
    
    const timeline = [
      {
        estado: 'creada',
        label: 'Creada',
        completado: true,
        fecha: orden.fecha_creacion,
        responsable: orden.creado_por || 'Sistema'
      },
      {
        estado: 'revision',
        label: 'En Revisión',
        completado: orden.estado_id >= 2,
        fecha: orden.token_creado_fecha,
        responsable: orden.estado_id >= 2 ? 'Sistema' : null
      },
      {
        estado: 'aprobada',
        label: 'Aprobada',
        completado: orden.estado_id >= 3 && orden.estado_id !== 6,
        fecha: orden.aprobada_fecha,
        responsable: orden.aprobada_por
      },
      {
        estado: 'completada',
        label: 'Completada',
        completado: orden.estado_id === 5,
        fecha: orden.completada_fecha,
        responsable: orden.completada_por
      }
    ];

    // Si está cancelada, agregar ese estado
    if (orden.estado_id === 6) {
      timeline.push({
        estado: 'cancelada',
        label: 'Cancelada',
        completado: true,
        fecha: orden.rechazada_fecha,
        responsable: orden.rechazada_por
      });
    }

    return timeline;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <ClipboardDocumentListIcon className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Órdenes Pendientes</h1>
            <p className="text-gray-600">Gestiona las órdenes de compra en proceso</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
          >
            <FunnelIcon className="w-4 h-4 mr-2" />
            {mostrarFiltros ? 'Ocultar Filtros' : 'Filtros'}
          </Button>
          <Button variant="primary" size="sm">
            Nueva Orden
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-soft border border-secondary-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <ClipboardDocumentListIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Creadas</p>
              <p className="text-xl font-bold text-gray-900">{estadisticas.ordenes_creadas || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-soft border border-secondary-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center">
              <ClockIcon className="w-5 h-5 text-warning-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">En Revisión</p>
              <p className="text-xl font-bold text-gray-900">{estadisticas.ordenes_revision || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-soft border border-secondary-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
              <CheckCircleIcon className="w-5 h-5 text-success-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Aprobadas</p>
              <p className="text-xl font-bold text-gray-900">{estadisticas.ordenes_aprobadas || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-soft border border-secondary-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Completadas</p>
              <p className="text-xl font-bold text-gray-900">{estadisticas.ordenes_completadas || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-soft border border-secondary-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-danger-100 rounded-lg flex items-center justify-center">
              <XCircleIcon className="w-5 h-5 text-danger-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Canceladas</p>
              <p className="text-xl font-bold text-gray-900">{estadisticas.ordenes_canceladas || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-soft border border-secondary-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
              <ClipboardDocumentListIcon className="w-5 h-5 text-primary-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Monto Total</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(estadisticas.monto_total || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      {mostrarFiltros && (
        <div className="bg-white rounded-lg p-6 shadow-soft border border-secondary-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
            <Button variant="ghost" size="sm" onClick={limpiarFiltros}>
              <XMarkIcon className="w-4 h-4 mr-2" />
              Limpiar
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              label="Buscar"
              type="text"
              value={filtros.busqueda}
              onChange={(e) => handleFiltroChange('busqueda', e.target.value)}
              placeholder="Número OC, proveedor, proyecto..."
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={filtros.estado_id}
                onChange={(e) => handleFiltroChange('estado_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Todos los estados</option>
                <option value="1">Creada</option>
                <option value="2">En Revisión</option>
                <option value="3">Aprobada</option>
                <option value="5">Completada</option>
                <option value="6">Cancelada</option>
              </select>
            </div>
            
            <Input
              label="Fecha Desde"
              type="date"
              value={filtros.fecha_desde}
              onChange={(e) => handleFiltroChange('fecha_desde', e.target.value)}
            />
            
            <Input
              label="Fecha Hasta"
              type="date"
              value={filtros.fecha_hasta}
              onChange={(e) => handleFiltroChange('fecha_hasta', e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Lista de órdenes */}
      <div className="bg-white rounded-lg shadow-soft border border-secondary-200">
        <div className="px-6 py-4 border-b border-secondary-200">
          <h3 className="text-lg font-semibold text-gray-900">Lista de Órdenes</h3>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Cargando órdenes...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <ExclamationTriangleIcon className="w-12 h-12 text-danger-500 mx-auto" />
              <p className="mt-2 text-sm text-gray-600">{error}</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-secondary-200">
              <thead className="bg-secondary-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Orden
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Proveedor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Prioridad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Días
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secondary-200">
                {ordenes.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                      No hay órdenes que coincidan con los filtros aplicados
                    </td>
                  </tr>
                ) : (
                  ordenes.map((orden) => (
                    <tr key={orden.id} className="hover:bg-secondary-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{orden.numero_oc}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{orden.proveedor_nombre || orden.proveedor_nombre_completo}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(orden.fecha_creacion)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(orden.total)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(orden.estado_nombre?.toLowerCase())}`}>
                          {getEstadoLabel(orden.estado_nombre?.toLowerCase())}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPrioridadColor(orden.prioridad_nombre?.toLowerCase())}`}>
                          {orden.prioridad_nombre?.toUpperCase() || 'NORMAL'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {calcularDiasPendientes(orden.fecha_creacion)} días
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleVerResumen(orden)}
                            title="Ver resumen de la orden"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleVerTimeline(orden)}
                            title="Ver timeline y acciones"
                          >
                            <TimelineIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Overlay oscuro */}
      {mostrarPanel && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={() => setMostrarPanel(false)}
        />
      )}

      {/* Panel Lateral Deslizable */}
      <div 
        className={`fixed top-0 right-0 h-full w-full md:w-[480px] lg:w-[600px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          mostrarPanel ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {ordenSeleccionada && (
          <div className="h-full flex flex-col">
            {/* Header del panel */}
            <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-accent-600 text-white px-6 py-4 shadow-lg z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">{ordenSeleccionada.numero_oc}</h3>
                  <p className="text-sm text-primary-100">Detalles de la orden</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setMostrarPanel(false)}
                  className="text-white hover:bg-white/20"
                >
                  <XMarkIcon className="w-6 h-6" />
                </Button>
              </div>
            </div>

            {/* Contenido del panel */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Información general */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center">
                  <ClipboardDocumentListIcon className="w-5 h-5 mr-2 text-primary-600" />
                  Información General
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Proveedor</p>
                    <p className="font-medium text-gray-900">
                      {ordenSeleccionada.proveedor_nombre || ordenSeleccionada.proveedor_nombre_completo}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Monto Total</p>
                    <p className="font-bold text-lg text-primary-600">
                      {formatCurrency(ordenSeleccionada.total)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Fecha Creación</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(ordenSeleccionada.fecha_creacion)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Estado Actual</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(ordenSeleccionada.estado_nombre?.toLowerCase())}`}>
                      {getEstadoLabel(ordenSeleccionada.estado_nombre?.toLowerCase())}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timeline de estados */}
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <h4 className="font-semibold text-gray-900 flex items-center mb-4">
                  <ChartBarIcon className="w-5 h-5 mr-2 text-accent-600" />
                  Timeline de Estados
                </h4>
                
                {/* Barra de progreso */}
                <div className="mb-6">
                  <div className="flex justify-between text-xs text-gray-600 mb-2">
                    <span>Progreso</span>
                    <span>
                      {ordenSeleccionada.estado_id === 6 ? '100%' : 
                       ordenSeleccionada.estado_id === 5 ? '100%' :
                       ordenSeleccionada.estado_id === 3 ? '75%' :
                       ordenSeleccionada.estado_id === 2 ? '50%' : '25%'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        ordenSeleccionada.estado_id === 6 ? 'bg-danger-500' : 'bg-gradient-to-r from-success-500 via-primary-500 to-accent-500'
                      }`}
                      style={{ 
                        width: ordenSeleccionada.estado_id === 6 ? '100%' :
                               ordenSeleccionada.estado_id === 5 ? '100%' :
                               ordenSeleccionada.estado_id === 3 ? '75%' :
                               ordenSeleccionada.estado_id === 2 ? '50%' : '25%'
                      }}
                    />
                  </div>
                </div>

                {/* Steps del timeline */}
                <div className="space-y-4">
                  {construirTimeline(ordenSeleccionada).map((step, index) => (
                    <TimelineStep
                      key={step.estado}
                      estado={step.estado}
                      data={{
                        label: step.label,
                        completado: step.completado,
                        fecha: step.fecha ? formatDate(step.fecha) : null,
                        responsable: step.responsable
                      }}
                      isActive={!step.completado && ordenSeleccionada.estado_id !== 6}
                      isCompleted={step.completado}
                      isNext={false}
                      isLast={index === construirTimeline(ordenSeleccionada).length - 1}
                    />
                  ))}
                </div>
              </div>

              {/* Acciones disponibles */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Acciones Disponibles</h4>
                <div className="space-y-3">
                  {/* Info del token (solo para órdenes Creadas o En Revisión) */}
                  {(ordenSeleccionada.estado_id === 1 || ordenSeleccionada.estado_id === 2) && tokenInfo?.existe && (
                    <div className={`rounded-lg p-3 mb-3 ${
                      tokenInfo.usado ? 'bg-gray-50 border border-gray-300' :
                      tokenInfo.expirado ? 'bg-yellow-50 border border-yellow-300' :
                      'bg-green-50 border border-green-300'
                    }`}>
                      <p className="text-xs font-semibold mb-2 flex items-center">
                        {tokenInfo.usado ? '🔒 Link Usado' :
                         tokenInfo.expirado ? '⏰ Link Expirado' :
                         '✅ Link Activo'}
                      </p>
                      <p className="text-xs text-gray-700">
                        <strong>Generado:</strong> {formatDate(tokenInfo.fecha_creacion)}
                      </p>
                      <p className="text-xs text-gray-700">
                        <strong>Expira:</strong> {formatDate(tokenInfo.fecha_expiracion)}
                      </p>
                      {!tokenInfo.usado && !tokenInfo.expirado && (
                        <p className="text-xs text-green-700 font-semibold mt-2">
                          ⏳ Válido por {tokenInfo.horas_restantes}h {tokenInfo.minutos_restantes}min más
                        </p>
                      )}
                      {tokenInfo.expirado && !tokenInfo.usado && (
                        <p className="text-xs text-yellow-700 font-semibold mt-2">
                          ⚠️ Puede regenerar el link
                        </p>
                      )}
                    </div>
                  )}

                  {/* Botón de generar link (solo para órdenes Creadas o En Revisión) */}
                  {(ordenSeleccionada.estado_id === 1 || ordenSeleccionada.estado_id === 2) && (
                    <>
                      <Button 
                        variant="accent" 
                        size="md"
                        onClick={() => handleGenerarLinksAprobacion(ordenSeleccionada)}
                        className="w-full"
                        loading={generandoLinks}
                        disabled={tokenInfo?.existe && !tokenInfo.expirado && !tokenInfo.usado}
                      >
                        <ShareIcon className="w-5 h-5 mr-2" />
                        {generandoLinks ? 'Generando...' : 
                         tokenInfo?.existe && !tokenInfo.expirado ? 'Link Ya Generado' :
                         tokenInfo?.existe ? 'Regenerar Link' : 
                         'Generar Link de Aprobación'}
                      </Button>
                      
                      {/* Mensaje si hay token activo */}
                      {tokenInfo?.existe && !tokenInfo.expirado && !tokenInfo.usado && (
                        <p className="text-xs text-gray-600 text-center">
                          Ya existe un link válido. Podrás regenerarlo cuando expire.
                        </p>
                      )}
                    </>
                  )}

                  {/* Botón de completar (solo para órdenes aprobadas - ID: 3) */}
                  {ordenSeleccionada.estado_id === 3 && (
                    <Button 
                      variant="success" 
                      size="md"
                      onClick={() => handleCompletarOrden(ordenSeleccionada)}
                      className="w-full"
                    >
                      <CheckCircleIcon className="w-5 h-5 mr-2" />
                      Marcar como Completada
                    </Button>
                  )}

                  {/* Eliminar (solo para órdenes no Completadas) */}
                  <Button 
                    variant="danger" 
                    size="sm"
                    onClick={() => handleEliminarOrden(ordenSeleccionada)}
                    className="w-full"
                    disabled={ordenSeleccionada.estado_id === 5}
                  >
                    <TrashIcon className="w-4 h-4 mr-2" />
                    Eliminar Orden
                  </Button>

                  {/* Nota informativa sobre aprobación */}
                  {(ordenSeleccionada.estado_id === 1 || ordenSeleccionada.estado_id === 2) && !tokenInfo?.existe && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                      <p className="text-xs text-blue-800">
                        <strong>💡 Tip:</strong> Genera el link de aprobación y envíalo por WhatsApp al autorizador. El link expira en 12 horas.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Resumen */}
      <ResumenOrdenModal
        isOpen={mostrarResumen}
        onClose={() => setMostrarResumen(false)}
        orden={ordenSeleccionada}
      />

      {/* Modal de Links de Aprobación */}
      {showLinksModal && linksAprobacion && (
        <LinksAprobacionModal
          isOpen={showLinksModal}
          onClose={() => setShowLinksModal(false)}
          linksData={linksAprobacion}
        />
      )}
    </div>
  );
};

export default OrdenesPendientes;
