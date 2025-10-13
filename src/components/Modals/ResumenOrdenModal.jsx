import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon,
  DocumentTextIcon,
  UserIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import Button from '../UI/Button';
import { formatCurrency, formatDate } from '../../utils/formatters';
import apiService from '../../services/api';

const ResumenOrdenModal = ({ isOpen, onClose, orden }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && orden) {
      cargarItems();
    }
  }, [isOpen, orden]);

  const cargarItems = async () => {
    if (!orden?.id) return;
    
    setLoading(true);
    try {
      const response = await apiService.getOrdenItems(orden.id);
      setItems(response.data || []);
    } catch (error) {
      console.error('Error cargando items:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDescargarPDF = async () => {
    if (!orden?.id) {
      alert('Error: No se pudo obtener el ID de la orden');
      return;
    }

    try {
      // Abrir el PDF en una nueva pestaña
      const pdfUrl = `http://localhost:3001/api/pdf/orden/${orden.id}`;
      window.open(pdfUrl, '_blank');
    } catch (error) {
      console.error('Error abriendo PDF:', error);
      alert('Error al abrir el PDF. Inténtalo de nuevo.');
    }
  };

  if (!isOpen || !orden) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-accent-600 px-6 py-4 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <DocumentTextIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Resumen de Orden
                  </h2>
                  <p className="text-sm text-primary-100">
                    {orden.numero_oc}
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <XMarkIcon className="w-6 h-6" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {/* Información General */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Proveedor */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <BuildingOfficeIcon className="w-5 h-5 text-primary-600" />
                  <h3 className="font-semibold text-gray-900">Proveedor</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-900 font-medium">
                    {orden.proveedor_nombre || orden.proveedor_nombre_completo || 'No especificado'}
                  </p>
                  {orden.proveedor_ruc && (
                    <p className="text-gray-600">RUC: {orden.proveedor_ruc}</p>
                  )}
                  {orden.proveedor_contacto && (
                    <p className="text-gray-600">Contacto: {orden.proveedor_contacto}</p>
                  )}
                </div>
              </div>

              {/* Información de la Orden */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <CalendarIcon className="w-5 h-5 text-primary-600" />
                  <h3 className="font-semibold text-gray-900">Información</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fecha Creación:</span>
                    <span className="text-gray-900 font-medium">
                      {formatDate(orden.fecha_creacion)}
                    </span>
                  </div>
                  {orden.fecha_requerimiento && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fecha Requerida:</span>
                      <span className="text-gray-900 font-medium">
                        {formatDate(orden.fecha_requerimiento)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Categoría:</span>
                    <span className="text-gray-900 font-medium">
                      {orden.categoria_nombre || 'No especificada'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items de la Orden */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-4">
                <DocumentTextIcon className="w-5 h-5 text-primary-600" />
                <h3 className="font-semibold text-gray-900">Items Solicitados</h3>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : items.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <p className="text-gray-500">No hay items registrados</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          #
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Descripción
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cantidad
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Unidad
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Precio Unit.
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Subtotal
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {items.map((item, index) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {index + 1}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {item.descripcion}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-center">
                            {item.cantidad}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-center">
                            {item.unidad_medida}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">
                            {formatCurrency(item.precio_unitario)}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                            {formatCurrency(item.subtotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-lg p-4 border border-primary-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CurrencyDollarIcon className="w-6 h-6 text-primary-600" />
                  <span className="text-lg font-semibold text-gray-900">Total General</span>
                </div>
                <span className="text-2xl font-bold text-primary-600">
                  {formatCurrency(orden.total)}
                </span>
              </div>
            </div>

            {/* Información Adicional */}
            {(orden.observaciones || orden.notas) && (
              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Observaciones</h4>
                <p className="text-sm text-gray-600">
                  {orden.observaciones || orden.notas}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="inline-flex items-center">
                <UserIcon className="w-4 h-4 mr-1" />
                Estado: <span className="ml-1 font-medium text-gray-900">
                  {orden.estado_nombre}
                </span>
              </span>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="accent"
                onClick={handleDescargarPDF}
                icon={ArrowDownTrayIcon}
              >
                Ver PDF
              </Button>
              <Button
                variant="primary"
                onClick={onClose}
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumenOrdenModal;

