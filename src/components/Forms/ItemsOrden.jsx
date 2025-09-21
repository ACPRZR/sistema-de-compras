import React, { useState } from 'react';
import { 
  PlusIcon, 
  TrashIcon, 
  ClipboardDocumentListIcon,
  DocumentArrowDownIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Select from '../UI/Select';
import { getTemplatesByCategoria } from '../../data/templates';
import { UNIDADES_MEDIDA } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';

const ItemsOrden = ({ 
  categoriaCompra, 
  items, 
  contadorItems, 
  agregarItem, 
  actualizarItem, 
  eliminarItem, 
  calcularTotal, 
  resumenItems 
}) => {

  const [showTemplates, setShowTemplates] = useState(false);
  const [templates, setTemplates] = useState([]);

  // Cargar templates cuando cambie la categoría
  React.useEffect(() => {
    if (categoriaCompra) {
      const templatesCategoria = getTemplatesByCategoria(categoriaCompra);
      setTemplates(templatesCategoria);
    } else {
      setTemplates([]);
    }
  }, [categoriaCompra]);

  const handleItemChange = (itemId, field, value) => {
    const updates = { [field]: value };
    
    // Recalcular subtotal si cambió cantidad o precio
    if (field === 'cantidad' || field === 'precio') {
      const item = items[itemId];
      const cantidad = field === 'cantidad' ? parseFloat(value) || 0 : item.cantidad;
      const precio = field === 'precio' ? parseFloat(value) || 0 : item.precio;
      updates.subtotal = cantidad * precio;
    }
    
    actualizarItem(itemId, updates);
  };

  const agregarItemTemplate = (template) => {
    agregarItem();
    const nuevoItemId = `item_${contadorItems + 1}`;
    
    // Actualizar el nuevo item con los datos del template
    setTimeout(() => {
      actualizarItem(nuevoItemId, {
        descripcion: template.descripcion,
        unidad: template.unidad,
        precio: template.precio,
        subtotal: template.precio
      });
    }, 100);
    
    setShowTemplates(false);
  };

  const importarCSV = () => {
    // Funcionalidad no necesaria para uso local
    console.log('Importación CSV no disponible en versión local');
  };

  const total = calcularTotal();

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-warning-500 to-warning-600 rounded-lg flex items-center justify-center">
              <ClipboardDocumentListIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Items de la Orden</h3>
              <p className="text-sm text-secondary-600">
                {Object.keys(items).length} item(s) agregado(s)
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="primary"
              size="sm"
              onClick={agregarItem}
              icon={PlusIcon}
            >
              Agregar Item
            </Button>
            
            {templates.length > 0 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowTemplates(true)}
                icon={ClipboardDocumentListIcon}
              >
                Templates
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={importarCSV}
              icon={DocumentArrowDownIcon}
            >
              CSV
            </Button>
          </div>
        </div>
      </div>
      
      <div className="card-body space-y-4">
        {/* Lista de items */}
        {Object.keys(items).length === 0 ? (
          <div className="text-center py-12">
            <ClipboardDocumentListIcon className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-secondary-600 mb-2">
              No hay items agregados
            </h4>
            <p className="text-sm text-secondary-500 mb-4">
              Comience agregando items a su orden de compra
            </p>
            <Button
              variant="primary"
              onClick={agregarItem}
              icon={PlusIcon}
            >
              Agregar Primer Item
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(items).map(([itemId, item]) => (
              <div key={itemId} className="bg-secondary-50 rounded-lg p-4 border border-secondary-200 hover:border-primary-300 transition-colors duration-200">
                {/* Header del item */}
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">
                    Item {itemId.split('_')[1]}
                  </h4>
                  <button
                    onClick={() => eliminarItem(itemId)}
                    className="p-1 text-danger-600 hover:text-danger-800 hover:bg-danger-50 rounded transition-colors duration-200"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>

                {/* Campos del item */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Descripción */}
                  <div className="md:col-span-2">
                    <Input
                      label="Descripción"
                      value={item.descripcion || ''}
                      onChange={(e) => handleItemChange(itemId, 'descripcion', e.target.value)}
                      placeholder="Descripción detallada del producto o servicio"
                      required
                    />
                  </div>

                  {/* Unidad */}
                  <div>
                    <Select
                      label="Unidad"
                      value={item.unidad || 'Unidad'}
                      onChange={(e) => handleItemChange(itemId, 'unidad', e.target.value)}
                      options={UNIDADES_MEDIDA}
                    />
                  </div>

                  {/* Cantidad */}
                  <div>
                    <Input
                      label="Cantidad"
                      type="number"
                      min="1"
                      value={item.cantidad || 1}
                      onChange={(e) => handleItemChange(itemId, 'cantidad', parseFloat(e.target.value))}
                      required
                    />
                  </div>

                  {/* Precio */}
                  <div>
                    <Input
                      label="Precio Unitario"
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.precio || 0}
                      onChange={(e) => handleItemChange(itemId, 'precio', parseFloat(e.target.value))}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                {/* Subtotal */}
                <div className="mt-4 flex justify-end">
                  <div className="w-48">
                    <Input
                      label="Subtotal"
                      value={formatCurrency(item.subtotal || 0)}
                      readOnly
                      className="bg-secondary-100 font-semibold text-right"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Resumen total */}
        {Object.keys(items).length > 0 && (
          <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-lg p-4 border border-primary-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">₡</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-primary-900">Total General</p>
                  <p className="text-xs text-primary-700">
                    {Object.keys(items).length} item(s) • {resumenItems.length} con descripción
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary-600">
                  {formatCurrency(total)}
                </p>
                <p className="text-xs text-primary-700">Soles peruanos</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de templates */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-secondary-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Templates de Items - {categoriaCompra}
              </h3>
              <button
                onClick={() => setShowTemplates(false)}
                className="p-2 text-secondary-400 hover:text-secondary-600 rounded-lg hover:bg-secondary-100"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 gap-3">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="flex items-center justify-between p-3 border border-secondary-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors duration-200"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{template.descripcion}</h4>
                      <p className="text-sm text-secondary-600">
                        {template.unidad} • {formatCurrency(template.precio)} • {template.proveedor}
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => agregarItemTemplate(template)}
                    >
                      Agregar
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemsOrden;
