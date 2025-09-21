import React, { useState, useEffect } from 'react';
import { 
  BuildingStorefrontIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  UserIcon,
  PlusIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import Select from '../UI/Select';
import Input from '../UI/Input';
import Button from '../UI/Button';
import { getProveedoresByCategoria } from '../../data/proveedores';
import { validateRUC, validateEmail, formatRUC, formatPhone } from '../../utils/formatters';

const InformacionProveedor = ({ formData, onFormChange, categoriaCompra }) => {
  const [proveedores, setProveedores] = useState([]);
  const [showContacto, setShowContacto] = useState(false);
  const [errors, setErrors] = useState({});

  // Cargar proveedores cuando cambie la categoría
  useEffect(() => {
    if (categoriaCompra) {
      const proveedoresCategoria = getProveedoresByCategoria(categoriaCompra);
      setProveedores(proveedoresCategoria);
    } else {
      setProveedores([]);
    }
  }, [categoriaCompra]);

  const handleProveedorChange = (proveedorData) => {
    if (proveedorData === 'nuevo') {
      // Limpiar campos para nuevo proveedor
      onFormChange('proveedor', '');
      onFormChange('rucProveedor', '');
      onFormChange('contactoProveedor', '');
      onFormChange('telefonoProveedor', '');
      onFormChange('emailProveedor', '');
    } else if (proveedorData === 'varios') {
      // Configurar para varios proveedores
      onFormChange('proveedor', 'Varios');
      onFormChange('rucProveedor', 'Sin RUC');
      onFormChange('contactoProveedor', '');
      onFormChange('telefonoProveedor', '');
      onFormChange('emailProveedor', '');
    } else {
      // Completar datos del proveedor seleccionado
      const proveedor = JSON.parse(proveedorData);
      onFormChange('proveedor', proveedor.nombre);
      onFormChange('rucProveedor', proveedor.ruc);
      onFormChange('contactoProveedor', proveedor.contacto || '');
      onFormChange('telefonoProveedor', proveedor.telefono || '');
      onFormChange('emailProveedor', proveedor.email || '');
      
      // Mostrar sección de contacto si hay datos
      if (proveedor.contacto || proveedor.telefono || proveedor.email) {
        setShowContacto(true);
      }
    }
  };

  const handleRUCChange = (ruc) => {
    const formattedRUC = formatRUC(ruc);
    onFormChange('rucProveedor', formattedRUC);
    
    // Validar RUC
    if (formattedRUC && !validateRUC(formattedRUC)) {
      setErrors(prev => ({ ...prev, ruc: 'RUC inválido' }));
    } else {
      setErrors(prev => ({ ...prev, ruc: null }));
    }
  };

  const handleEmailChange = (email) => {
    onFormChange('emailProveedor', email);
    
    // Validar email
    if (email && !validateEmail(email)) {
      setErrors(prev => ({ ...prev, email: 'Email inválido' }));
    } else {
      setErrors(prev => ({ ...prev, email: null }));
    }
  };

  const handleTelefonoChange = (telefono) => {
    const formattedPhone = formatPhone(telefono);
    onFormChange('telefonoProveedor', formattedPhone);
  };

  const agregarProveedorRapido = () => {
    const nombre = prompt('Nombre del proveedor:');
    if (nombre) {
      const ruc = prompt('RUC del proveedor:') || '';
      const contacto = prompt('Contacto:') || '';
      const telefono = prompt('Teléfono:') || '';
      const email = prompt('Email:') || '';
      
      onFormChange('proveedor', nombre);
      onFormChange('rucProveedor', ruc);
      onFormChange('contactoProveedor', contacto);
      onFormChange('telefonoProveedor', telefono);
      onFormChange('emailProveedor', email);
      
      if (contacto || telefono || email) {
        setShowContacto(true);
      }
    }
  };

  const opcionesProveedores = [
    { value: '', label: 'Seleccione proveedor' },
    { value: 'varios', label: 'Varios (Sin RUC)' },
    ...proveedores.map(proveedor => ({
      value: JSON.stringify(proveedor),
      label: proveedor.nombre
    })),
    { value: 'nuevo', label: '+ Agregar Nuevo Proveedor' }
  ];

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-success-500 to-success-600 rounded-lg flex items-center justify-center">
            <BuildingStorefrontIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Información del Proveedor</h3>
            <p className="text-sm text-secondary-600">Datos del proveedor y contacto</p>
          </div>
        </div>
      </div>
      
      <div className="card-body space-y-6">
        {/* Información básica del proveedor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Select
              label="Proveedor"
              value={proveedores.find(p => p.nombre === formData.proveedor) ? 
                JSON.stringify(proveedores.find(p => p.nombre === formData.proveedor)) : 
                formData.proveedor || ''
              }
              onChange={(e) => handleProveedorChange(e.target.value)}
              options={opcionesProveedores}
              placeholder="Seleccione proveedor"
              required
            />
            {categoriaCompra && proveedores.length > 0 && (
              <p className="text-xs text-secondary-500">
                {proveedores.length} proveedor(es) disponible(s) para esta categoría
              </p>
            )}
          </div>
          
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <Input
                label="RUC"
                value={formData.rucProveedor || ''}
                onChange={(e) => handleRUCChange(e.target.value)}
                placeholder={formData.proveedor === 'Varios' ? 'Sin RUC' : '20123456789'}
                error={errors.ruc}
                required={formData.proveedor !== 'Varios'}
                readOnly={formData.proveedor === 'Varios'}
                className={formData.proveedor === 'Varios' ? 'bg-secondary-50' : ''}
              />
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={agregarProveedorRapido}
              icon={PlusIcon}
            >
              Rápido
            </Button>
          </div>
        </div>

        {/* Sección de contacto colapsable */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setShowContacto(!showContacto)}
            className="flex items-center justify-between w-full p-3 text-left bg-secondary-50 hover:bg-secondary-100 rounded-lg transition-colors duration-200"
          >
            <div className="flex items-center space-x-2">
              <UserIcon className="w-4 h-4 text-secondary-600" />
              <span className="text-sm font-medium text-secondary-700">
                Información de Contacto (Opcional)
              </span>
            </div>
            {showContacto ? (
              <ChevronUpIcon className="w-4 h-4 text-secondary-600" />
            ) : (
              <ChevronDownIcon className="w-4 h-4 text-secondary-600" />
            )}
          </button>

          {showContacto && (
            <div className="space-y-4 p-4 bg-white border border-secondary-200 rounded-lg animate-slide-down">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Contacto"
                  value={formData.contactoProveedor || ''}
                  onChange={(e) => onFormChange('contactoProveedor', e.target.value)}
                  placeholder="Nombre del contacto"
                  leftIcon={UserIcon}
                />
                
                <Input
                  label="Teléfono"
                  value={formData.telefonoProveedor || ''}
                  onChange={(e) => handleTelefonoChange(e.target.value)}
                  placeholder="999-999-999"
                  leftIcon={PhoneIcon}
                />
              </div>
              
              <Input
                label="Email"
                type="email"
                value={formData.emailProveedor || ''}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="contacto@proveedor.com"
                leftIcon={EnvelopeIcon}
                error={errors.email}
              />
            </div>
          )}
        </div>

        {/* Información adicional */}
        {categoriaCompra && proveedores.length > 0 && (
          <div className="bg-gradient-to-r from-success-50 to-accent-50 rounded-lg p-4 border border-success-200">
            <div className="flex items-start space-x-3">
              <BuildingStorefrontIcon className="w-5 h-5 text-success-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-success-900 mb-1">
                  Proveedores Preferenciales
                </h4>
                <p className="text-xs text-success-700">
                  Se han encontrado {proveedores.length} proveedor(es) especializados en {categoriaCompra}.
                  Seleccione uno para completar automáticamente los datos.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InformacionProveedor;
