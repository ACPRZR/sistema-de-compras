import React, { useState } from 'react';
import { 
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  PrinterIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import Button from '../UI/Button';
import Input from '../UI/Input';
import { useHistorialOrdenes } from '../../hooks/useHistorialOrdenes';

const Historial = () => {
  const {
    ordenes,
    estadisticas,
    filtros,
    loading,
    error,
    aplicarFiltros,
    limpiarFiltros,
    getEstadoColor,
    getEstadoLabel,
    getEstadoIcon,
    formatearFecha,
    formatearMoneda
  } = useHistorialOrdenes();

  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);

  // Manejar filtros
  const handleFiltroChange = (campo, valor) => {
    aplicarFiltros({ [campo]: valor });
  };

  // Manejar acciones de orden
  const handleVerOrden = (orden) => {
    setOrdenSeleccionada(orden);
    // TODO: Implementar modal de detalles
    console.log('Ver orden:', orden);
  };

  const handleImprimirOrden = (orden) => {
    // TODO: Implementar impresión
    console.log('Imprimir orden:', orden);
  };

  // Obtener icono de estado
  const getEstadoIconComponent = (estado) => {
    const iconType = getEstadoIcon(estado);
    switch (iconType) {
      case 'CheckCircleIcon':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'XCircleIcon':
        return <XCircleIcon className="w-4 h-4" />;
      default:
        return <DocumentTextIcon className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <DocumentTextIcon className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Historial de Órdenes</h1>
            <p className="text-gray-600">Revisa el historial completo de órdenes de compra</p>
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
          <Button variant="secondary" size="sm">
            <PrinterIcon className="w-4 h-4 mr-2" />
            Exportar
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
            <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
              <CheckCircleIcon className="w-5 h-5 text-success-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Completadas</p>
              <p className="text-2xl font-bold text-gray-900">{estadisticas.ordenes_completadas || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-soft border border-secondary-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-danger-100 rounded-lg flex items-center justify-center">
              <XCircleIcon className="w-5 h-5 text-danger-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Canceladas</p>
              <p className="text-2xl font-bold text-gray-900">{estadisticas.ordenes_canceladas || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-soft border border-secondary-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
              <DocumentTextIcon className="w-5 h-5 text-primary-600" />
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
              <DocumentTextIcon className="w-5 h-5 text-accent-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Monto Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatearMoneda(estadisticas.monto_total)}
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

      {/* Lista de historial */}
      <div className="bg-white rounded-lg shadow-soft border border-secondary-200">
        <div className="px-6 py-4 border-b border-secondary-200">
          <h3 className="text-lg font-semibold text-gray-900">Historial de Órdenes</h3>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Cargando historial...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <XCircleIcon className="w-12 h-12 text-danger-500 mx-auto" />
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
                    Fecha Creación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Fecha Finalización
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Responsable
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
                      No hay órdenes en el historial que coincidan con los filtros aplicados
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
                          {formatearFecha(orden.fecha_creacion)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatearMoneda(orden.total)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(orden.estado_nombre)}`}>
                          {getEstadoIconComponent(orden.estado_nombre)}
                          <span className="ml-1">{getEstadoLabel(orden.estado_nombre)}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatearFecha(orden.updated_at || orden.fecha_creacion)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{orden.comprador_nombre || 'N/A'}</div>
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
                            onClick={() => handleImprimirOrden(orden)}
                            title="Imprimir"
                          >
                            <PrinterIcon className="w-4 h-4" />
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
    </div>
  );
};

export default Historial;
