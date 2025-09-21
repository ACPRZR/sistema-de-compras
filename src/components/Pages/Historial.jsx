import React from 'react';
import { 
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';
import Button from '../UI/Button';

const Historial = () => {
  // Datos de ejemplo para historial
  const historialOrdenes = [
    {
      id: 'OC-2024-001',
      proveedor: 'Proveedor ABC S.A.C.',
      fecha: '2024-01-10',
      monto: 15000.00,
      estado: 'completada',
      fechaCompletada: '2024-01-15',
      responsable: 'A. Pérez'
    },
    {
      id: 'OC-2024-002',
      proveedor: 'Distribuidora XYZ Ltda.',
      fecha: '2024-01-08',
      monto: 8500.00,
      estado: 'cancelada',
      fechaCompletada: '2024-01-12',
      responsable: 'M. García'
    },
    {
      id: 'OC-2024-003',
      proveedor: 'Servicios Generales S.A.',
      fecha: '2024-01-05',
      monto: 25000.00,
      estado: 'completada',
      fechaCompletada: '2024-01-10',
      responsable: 'A. Pérez'
    },
    {
      id: 'OC-2024-004',
      proveedor: 'Suministros Industriales',
      fecha: '2024-01-03',
      monto: 12000.00,
      estado: 'completada',
      fechaCompletada: '2024-01-08',
      responsable: 'L. Martínez'
    }
  ];

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'completada':
        return 'bg-success-100 text-success-800';
      case 'cancelada':
        return 'bg-danger-100 text-danger-800';
      case 'rechazada':
        return 'bg-danger-100 text-danger-800';
      default:
        return 'bg-secondary-100 text-secondary-800';
    }
  };

  const getEstadoLabel = (estado) => {
    switch (estado) {
      case 'completada':
        return 'Completada';
      case 'cancelada':
        return 'Cancelada';
      case 'rechazada':
        return 'Rechazada';
      default:
        return estado;
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'completada':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'cancelada':
      case 'rechazada':
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
              <p className="text-2xl font-bold text-gray-900">3</p>
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
              <p className="text-2xl font-bold text-gray-900">1</p>
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
              <p className="text-2xl font-bold text-gray-900">4</p>
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
              <p className="text-2xl font-bold text-gray-900">S/ 60,500</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de historial */}
      <div className="bg-white rounded-lg shadow-soft border border-secondary-200">
        <div className="px-6 py-4 border-b border-secondary-200">
          <h3 className="text-lg font-semibold text-gray-900">Historial de Órdenes</h3>
        </div>
        
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
              {historialOrdenes.map((orden) => (
                <tr key={orden.id} className="hover:bg-secondary-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{orden.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{orden.proveedor}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{orden.fecha}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      S/ {orden.monto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(orden.estado)}`}>
                      {getEstadoIcon(orden.estado)}
                      <span className="ml-1">{getEstadoLabel(orden.estado)}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{orden.fechaCompletada}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{orden.responsable}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <EyeIcon className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <PrinterIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Historial;
