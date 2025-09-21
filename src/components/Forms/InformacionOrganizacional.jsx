import React from 'react';
import { BuildingOffice2Icon, MapPinIcon, FolderIcon } from '@heroicons/react/24/outline';
import Select from '../UI/Select';
import Input from '../UI/Input';
import { UNIDADES_NEGOCIO, UNIDADES_AUTORIZA, UBICACIONES_ENTREGA } from '../../utils/constants';

const InformacionOrganizacional = ({ formData, onFormChange }) => {
  const handleChange = (field, value) => {
    onFormChange(field, value);
    
    // Auto-completar dirección de entrega cuando se selecciona ubicación
    if (field === 'ubicacionEntrega') {
      const ubicacion = UBICACIONES_ENTREGA.find(u => u.value === value);
      if (ubicacion) {
        onFormChange('lugarEntrega', ubicacion.direccion);
      }
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
            <BuildingOffice2Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Información Organizacional</h3>
            <p className="text-sm text-secondary-600">Datos de la organización y ubicación</p>
          </div>
        </div>
      </div>
      
      <div className="card-body space-y-6">
        {/* Primera fila */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Unidad de Negocio"
            value={formData.unidadNegocio || ''}
            onChange={(e) => handleChange('unidadNegocio', e.target.value)}
            options={UNIDADES_NEGOCIO}
            placeholder="Seleccione unidad"
            required
          />
          
          <Select
            label="Unidad que Autoriza"
            value={formData.unidadAutoriza || ''}
            onChange={(e) => handleChange('unidadAutoriza', e.target.value)}
            options={UNIDADES_AUTORIZA}
            placeholder="Seleccione autorización"
            required
          />
        </div>

        {/* Segunda fila */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Select
              label="Ubicación de Entrega"
              value={formData.ubicacionEntrega || ''}
              onChange={(e) => handleChange('ubicacionEntrega', e.target.value)}
              options={UBICACIONES_ENTREGA}
              placeholder="Seleccione ubicación"
              required
            />
            <p className="text-xs text-secondary-500 flex items-center">
              <MapPinIcon className="w-3 h-3 mr-1" />
              Se completará automáticamente la dirección
            </p>
          </div>
          
          <Input
            label="Detalles del Proyecto"
            value={formData.datosProyecto || ''}
            onChange={(e) => handleChange('datosProyecto', e.target.value)}
            placeholder="Nombre del proyecto, código de referencia o descripción"
            helperText="Información del proyecto asociado a esta compra"
            required
          />
        </div>

        {/* Dirección de entrega */}
        <div className="space-y-2">
          <Input
            label="Lugar de Entrega"
            value={formData.lugarEntrega || ''}
            onChange={(e) => handleChange('lugarEntrega', e.target.value)}
            placeholder="Dirección completa de entrega"
            required
          />
          <p className="text-xs text-secondary-500">
            Esta dirección aparecerá en la orden de compra generada
          </p>
        </div>

        {/* Información adicional */}
        <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-lg p-4 border border-primary-200">
          <div className="flex items-start space-x-3">
            <FolderIcon className="w-5 h-5 text-primary-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-primary-900 mb-1">
                Información de la Organización
              </h4>
              <p className="text-xs text-primary-700">
                Las Asambleas de Dios del Perú - RUC: 20144538570<br />
                Registro de Entidades Religiosas N° 023-2016-JUS/REG - MINJUSDH
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InformacionOrganizacional;
