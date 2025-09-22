import React, { useState } from 'react';
import { 
  ClipboardDocumentListIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PencilIcon,
  FunnelIcon,
  XMarkIcon,
  TrashIcon,
  CheckIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import Button from '../UI/Button';
import Select from '../UI/Select';
import Input from '../UI/Input';
import { useOrdenesPendientes } from '../../hooks/useOrdenesPendientes';
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
    actualizarEstadoOrden,
    eliminarOrden,
    calcularDiasPendientes,
    getEstadoColor,
    getPrioridadColor,
    getEstadoLabel
  } = useOrdenesPendientes();

  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
  const [mostrarAcciones, setMostrarAcciones] = useState(false);

  // Manejar filtros
  const handleFiltroChange = (campo, valor) => {
    aplicarFiltros({ [campo]: valor });
  };

  // Manejar acciones de orden
  const handleVerOrden = (orden) => {
    setOrdenSeleccionada(orden);
    setMostrarAcciones(true);
  };

  const handleEditarOrden = (orden) => {
    // TODO: Implementar edición
    console.log('Editar orden:', orden);
  };

  const handleAprobarOrden = async (orden) => {
    try {
      await actualizarEstadoOrden(orden.id, 3); // Estado "aprobada"
      setMostrarAcciones(false);
    } catch (err) {
      console.error('Error aprobando orden:', err);
    }
  };

  const handleRechazarOrden = async (orden) => {
    try {
      await actualizarEstadoOrden(orden.id, 6); // Estado "cancelada"
      setMostrarAcciones(false);
    } catch (err) {
      console.error('Error rechazando orden:', err);
    }
  };

  const handleEliminarOrden = async (orden) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta orden?')) {
      try {
        await eliminarOrden(orden.id);
        setMostrarAcciones(false);
      } catch (err) {
        console.error('Error eliminando orden:', err);
      }
    }
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-soft border border-secondary-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center">
              <ClockIcon className="w-5 h-5 text-warning-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">En Revisión</p>
              <p className="text-2xl font-bold text-gray-900">{estadisticas.ordenes_revision || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-soft border border-secondary-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
              <ClipboardDocumentListIcon className="w-5 h-5 text-success-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Aprobadas</p>
              <p className="text-2xl font-bold text-gray-900">{estadisticas.ordenes_aprobadas || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-soft border border-secondary-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
              <ClipboardDocumentListIcon className="w-5 h-5 text-primary-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{estadisticas.total_ordenes || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-soft border border-secondary-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-accent-100 rounded-lg flex items-center justify-center">
              <ClockIcon className="w-5 h-5 text-accent-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Monto Total</p>
              <p className="text-2xl font-bold text-gray-900">
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Buscar"
              type="text"
              value={filtros.busqueda}
              onChange={(e) => handleFiltroChange('busqueda', e.target.value)}
              placeholder="Número OC, proveedor, proyecto..."
            />
            
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
                            onClick={() => handleVerOrden(orden)}
                            title="Ver detalles"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditarOrden(orden)}
                            title="Editar"
                          >
                            <PencilIcon className="w-4 h-4" />
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

      {/* Modal de Acciones */}
      {mostrarAcciones && ordenSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Acciones - {ordenSeleccionada.numero_oc}
              </h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setMostrarAcciones(false)}
              >
                <XMarkIcon className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-3">
              <div className="text-sm text-gray-600">
                <p><strong>Proveedor:</strong> {ordenSeleccionada.proveedor_nombre || ordenSeleccionada.proveedor_nombre_completo}</p>
                <p><strong>Monto:</strong> {formatCurrency(ordenSeleccionada.total)}</p>
                <p><strong>Estado:</strong> {getEstadoLabel(ordenSeleccionada.estado_nombre?.toLowerCase())}</p>
              </div>
              
              <div className="flex space-x-2 pt-4">
                <Button 
                  variant="success" 
                  size="sm"
                  onClick={() => handleAprobarOrden(ordenSeleccionada)}
                  className="flex-1"
                >
                  <CheckIcon className="w-4 h-4 mr-2" />
                  Aprobar
                </Button>
                <Button 
                  variant="danger" 
                  size="sm"
                  onClick={() => handleRechazarOrden(ordenSeleccionada)}
                  className="flex-1"
                >
                  <XCircleIcon className="w-4 h-4 mr-2" />
                  Rechazar
                </Button>
                <Button 
                  variant="danger" 
                  size="sm"
                  onClick={() => handleEliminarOrden(ordenSeleccionada)}
                  className="flex-1"
                >
                  <TrashIcon className="w-4 h-4 mr-2" />
                  Eliminar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdenesPendientes;
