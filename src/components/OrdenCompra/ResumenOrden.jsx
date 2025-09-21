import React from 'react';
import { 
  DocumentTextIcon, 
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline';
import { useOrdenCompra } from '../../hooks/useOrdenCompra';
import { formatCurrency, formatDate } from '../../utils/formatters';

const ResumenOrden = ({ formData }) => {
  const { resumenItems, calcularTotal } = useOrdenCompra();
  const total = calcularTotal();

  const getUnidadNegocioTexto = (unidad) => {
    const unidades = {
      'oficina_nacional': 'Oficina Nacional',
      'logistica': 'Logística',
      'legal': 'Legal',
      'sistemas': 'Sistemas',
      'mantenimiento': 'Mantenimiento'
    };
    return unidades[unidad] || 'No especificada';
  };

  const getTipoOCTexto = (tipo) => {
    return tipo === 'blanket' ? 'Orden Marco (Blanket)' : 'Orden Estándar';
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-success-500 to-success-600 rounded-lg flex items-center justify-center">
            <DocumentTextIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Resumen de la Orden</h3>
            <p className="text-sm text-secondary-600">Vista previa antes de generar la orden</p>
          </div>
        </div>
      </div>
      
      <div className="card-body space-y-6">
        {/* Información general */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <DocumentTextIcon className="w-5 h-5 text-primary-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Número de OC</p>
                <p className="text-lg font-mono font-semibold text-primary-600">
                  {formData.numeroOC || 'OC-2025-01-001'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <BuildingStorefrontIcon className="w-5 h-5 text-accent-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Proveedor</p>
                <p className="text-sm text-gray-700">
                  {formData.proveedor || 'No seleccionado'}
                </p>
                {formData.rucProveedor && (
                  <p className="text-xs text-secondary-500">
                    RUC: {formData.rucProveedor}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <CurrencyDollarIcon className="w-5 h-5 text-success-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Total General</p>
                <p className="text-2xl font-bold text-success-600">
                  {formatCurrency(total)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <ClipboardDocumentListIcon className="w-5 h-5 text-warning-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Items</p>
                <p className="text-sm text-gray-700">
                  {resumenItems.length} item(s) con descripción
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Detalles de la orden */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Detalles de la Orden</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-secondary-600">Unidad de Negocio:</p>
              <p className="font-medium">{getUnidadNegocioTexto(formData.unidadNegocio)}</p>
            </div>
            
            <div>
              <p className="text-secondary-600">Tipo de Orden:</p>
              <p className="font-medium">{getTipoOCTexto(formData.tipoOC)}</p>
            </div>
            
            <div>
              <p className="text-secondary-600">Fecha de Requerimiento:</p>
              <p className="font-medium">
                {formData.fechaRequerimiento ? formatDate(formData.fechaRequerimiento) : 'No especificada'}
              </p>
            </div>
            
            <div>
              <p className="text-secondary-600">Ubicación de Entrega:</p>
              <p className="font-medium">{formData.ubicacionEntrega || 'No especificada'}</p>
            </div>
          </div>
        </div>

        {/* Lista de items */}
        {resumenItems.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Items Incluidos</h4>
            
            <div className="space-y-2">
              {resumenItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.descripcion}</p>
                    <p className="text-sm text-secondary-600">
                      {item.cantidad} {item.unidad} × {formatCurrency(item.precio)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(item.subtotal)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Información de contacto del proveedor */}
        {(formData.contactoProveedor || formData.telefonoProveedor || formData.emailProveedor) && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Contacto del Proveedor</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {formData.contactoProveedor && (
                <div>
                  <p className="text-secondary-600">Contacto:</p>
                  <p className="font-medium">{formData.contactoProveedor}</p>
                </div>
              )}
              
              {formData.telefonoProveedor && (
                <div>
                  <p className="text-secondary-600">Teléfono:</p>
                  <p className="font-medium">{formData.telefonoProveedor}</p>
                </div>
              )}
              
              {formData.emailProveedor && (
                <div>
                  <p className="text-secondary-600">Email:</p>
                  <p className="font-medium">{formData.emailProveedor}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Resumen final */}
        <div className="bg-gradient-to-r from-success-50 to-accent-50 rounded-lg p-4 border border-success-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-success-900">Orden Lista para Generar</h4>
              <p className="text-sm text-success-700">
                Todos los campos requeridos han sido completados
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-success-600">
                {formatCurrency(total)}
              </p>
              <p className="text-xs text-success-700">Total final</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumenOrden;
