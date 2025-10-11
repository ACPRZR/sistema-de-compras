import React, { useState, useEffect } from 'react';
import { 
  DocumentTextIcon, 
  CalendarDaysIcon, 
  TagIcon,
  ClockIcon 
} from '@heroicons/react/24/outline';
import Select from '../UI/Select';
import Input from '../UI/Input';
import { useMaestros } from '../../hooks/useMaestros';
import { generateOCNumber, getDefaultRequerimientoDate } from '../../utils/formatters';

const InformacionGeneral = ({ formData, onFormChange }) => {
  const [numeroOC, setNumeroOC] = useState('');
  const { 
    loading, 
    getCategoriasOptions,
    getTiposOrdenOptions
  } = useMaestros();
  
  // Obtener opciones formateadas desde el hook
  const categoriasOptions = getCategoriasOptions();
  const tiposOrdenOptions = getTiposOrdenOptions();
  
  console.log('🔍 Opciones generadas en InformacionGeneral:', {
    categorias: categoriasOptions.length,
    tiposOrden: tiposOrdenOptions.length,
    loading,
    categoriasSample: categoriasOptions[0]
  });

  useEffect(() => {
    // Generar número de OC automáticamente solo una vez
    if (!numeroOC) {
      const nuevoNumero = generateOCNumber();
      setNumeroOC(nuevoNumero);
      onFormChange('numeroOC', nuevoNumero);
    }
    
    // Establecer fecha de requerimiento por defecto solo si no existe
    if (!formData.fechaRequerimiento) {
      const fechaRequerimiento = getDefaultRequerimientoDate();
      onFormChange('fechaRequerimiento', fechaRequerimiento);
    }
  }, [formData.fechaRequerimiento, numeroOC, onFormChange]);

  const handleCategoriaChange = (categoria) => {
    onFormChange('categoriaCompra', categoria);
    // Aquí se podría actualizar la lista de proveedores automáticamente
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-accent-600 rounded-lg flex items-center justify-center">
            <DocumentTextIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Información General de la Orden</h3>
            <p className="text-sm text-secondary-600">Datos básicos y configuración de la orden</p>
          </div>
        </div>
      </div>
      
      <div className="card-body space-y-6">
        {/* Número de OC */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Número de Orden de Compra
          </label>
          <Input
            value={numeroOC}
            readOnly
            className="bg-secondary-50 border-secondary-200 font-mono font-semibold"
          />
          <p className="text-xs text-secondary-500 flex items-center">
            <ClockIcon className="w-3 h-3 mr-1" />
            Formato: OC-YYYY-MM-NNN (generado automáticamente)
          </p>
        </div>

        {/* Primera fila */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Input
              label="Fecha de Requerimiento"
              type="date"
              value={formData.fechaRequerimiento || ''}
              onChange={(e) => onFormChange('fechaRequerimiento', e.target.value)}
              required
            />
            <p className="text-xs text-secondary-500 flex items-center">
              <CalendarDaysIcon className="w-3 h-3 mr-1" />
              Fecha en que se necesitan los productos/servicios
            </p>
          </div>
          
          <Select
            label="Categoría de Compra"
            value={formData.categoriaCompra || ''}
            onChange={(value) => handleCategoriaChange(value)}
            options={categoriasOptions}
            placeholder="Seleccione categoría"
            disabled={loading}
            required
          />
        </div>

        {/* Segunda fila */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Select
              label="Tipo de Orden"
              value={formData.tipoOC || 'standard'}
              onChange={(value) => onFormChange('tipoOC', value)}
              options={tiposOrdenOptions}
              disabled={loading}
            />
            <div className="text-xs text-secondary-500 space-y-1">
              <p className="flex items-center">
                <TagIcon className="w-3 h-3 mr-1" />
                <strong>Standard:</strong> Orden única
              </p>
              <p className="ml-4">
                <strong>Blanket:</strong> Orden marco para múltiples entregas
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Estado de la Orden
            </label>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 px-3 py-2 bg-success-50 border border-success-200 rounded-lg">
                <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                <span className="text-sm font-medium text-success-700">Creada</span>
              </div>
              <span className="text-xs text-secondary-500">
                {new Date().toLocaleDateString('es-PE')} - A. Pérez
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default InformacionGeneral;
