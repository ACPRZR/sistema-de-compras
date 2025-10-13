import React, { useState, useEffect, useMemo } from 'react';
import { 
  BuildingStorefrontIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  UserIcon,
  PlusIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import Select from '../UI/Select';
import Input from '../UI/Input';
import Button from '../UI/Button';
import apiService from '../../services/api';

const InformacionProveedorDB = ({ formData, onFormChange, categoriaCompra }) => {
  const [proveedores, setProveedores] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [showContacto, setShowContacto] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [nuevoProveedor, setNuevoProveedor] = useState({
    nombre: '',
    ruc: '',
    contacto: '',
    telefono: '',
    email: '',
    categoria_id: ''
  });
  

  // Mapeo de códigos de categoría a IDs de la base de datos
  const mapeoCategoriaId = useMemo(() => ({
    'tecnologia': 1,
    'oficina': 2,
    'limpieza': 3,
    'mantenimiento': 4,
    'audiovisuales': 5,
    'mobiliario': 6,
    'servicios': 7,
    'otros': 8
  }), []);

  // Cargar categorías
  useEffect(() => {
    const loadCategorias = async () => {
      try {
        const result = await apiService.getCategorias();
        setCategorias(result.data || []);
      } catch (error) {
        console.error('Error cargando categorías:', error);
        setCategorias([]);
      }
    };

    loadCategorias();
  }, []);

  // Cargar proveedores filtrados por categoría
  useEffect(() => {
    const loadProveedores = async () => {
      if (!categoriaCompra) {
        setProveedores([]);
        return;
      }

      setLoading(true);
      try {
        const result = await apiService.getProveedores();
        const todosProveedores = result.data || [];
        
        // Obtener ID de categoría desde el mapeo
        const categoriaId = mapeoCategoriaId[categoriaCompra];
        
        // Filtrar proveedores por categoría
        const proveedoresFiltrados = todosProveedores.filter(proveedor => 
          proveedor.categoria_id === categoriaId
        );
        
        setProveedores(proveedoresFiltrados);
      } catch (error) {
        console.error('Error cargando proveedores:', error);
        setProveedores([]);
      } finally {
        setLoading(false);
      }
    };

    loadProveedores();
  }, [categoriaCompra, mapeoCategoriaId]);

  const handleProveedorChange = (proveedorData) => {
    // Si no seleccionó nada o es el placeholder
    if (!proveedorData || proveedorData === '') {
      return;
    }
    
    if (proveedorData === 'varios') {
      // Configurar para varios proveedores
      onFormChange('proveedor', 'Varios');
      onFormChange('rucProveedor', '');
      onFormChange('contactoProveedor', '');
      onFormChange('telefonoProveedor', '');
      onFormChange('emailProveedor', '');
    } else {
      // Completar datos del proveedor seleccionado
      const proveedor = JSON.parse(proveedorData);
      onFormChange('proveedor', proveedor.nombre);
      onFormChange('rucProveedor', proveedor.ruc || '');
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
    const formattedRUC = ruc.replace(/\D/g, '');
    onFormChange('rucProveedor', formattedRUC);
    
    // Validar RUC
    if (formattedRUC && formattedRUC.length !== 11) {
      setErrors(prev => ({ ...prev, ruc: 'RUC inválido' }));
    } else {
      setErrors(prev => ({ ...prev, ruc: null }));
    }
  };

  const handleEmailChange = (email) => {
    onFormChange('emailProveedor', email);
    
    // Validar email
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors(prev => ({ ...prev, email: 'Email inválido' }));
    } else {
      setErrors(prev => ({ ...prev, email: null }));
    }
  };

  const handleTelefonoChange = (telefono) => {
    const formattedPhone = telefono.replace(/\D/g, '');
    if (formattedPhone.length === 9) {
      const formatted = formattedPhone.replace(/(\d{3})(\d{3})(\d{3})/, '$1-$2-$3');
      onFormChange('telefonoProveedor', formatted);
    } else {
      onFormChange('telefonoProveedor', telefono);
    }
  };

  const abrirModalProveedor = () => {
    const categoriaId = mapeoCategoriaId[categoriaCompra] || '';
    setNuevoProveedor({
      nombre: '',
      ruc: '',
      contacto: '',
      telefono: '',
      email: '',
      categoria_id: categoriaId
    });
    setErrors({});
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setNuevoProveedor({
      nombre: '',
      ruc: '',
      contacto: '',
      telefono: '',
      email: '',
      categoria_id: ''
    });
    setErrors({});
  };

  const handleNuevoProveedorChange = (field, value) => {
    setNuevoProveedor(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validarProveedor = () => {
    const newErrors = {};
    
    if (!nuevoProveedor.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }
    
    if (!nuevoProveedor.categoria_id) {
      newErrors.categoria_id = 'La categoría es requerida';
    }
    
    if (nuevoProveedor.ruc && !/^\d{11}$/.test(nuevoProveedor.ruc)) {
      newErrors.ruc = 'El RUC debe tener 11 dígitos';
    }
    
    if (nuevoProveedor.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nuevoProveedor.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (nuevoProveedor.telefono && !/^[\d\s\-()+]+$/.test(nuevoProveedor.telefono)) {
      newErrors.telefono = 'Teléfono inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const guardarProveedor = async () => {
    if (!validarProveedor()) return;
    
    setLoading(true);
    try {
      const proveedorData = {
        ...nuevoProveedor,
        categoria_id: parseInt(nuevoProveedor.categoria_id),
        activo: true
      };
      
      console.log('📤 Creando proveedor:', proveedorData);
      const result = await apiService.createProveedor(proveedorData);
      
      if (result.success) {
        console.log('✅ Proveedor creado:', result.data);
        
        // Recargar proveedores
        const updatedResult = await apiService.getProveedores();
        const todosProveedores = updatedResult.data || [];
        
        console.log('📋 Total proveedores en BD:', todosProveedores.length);
        console.log('📋 Categoria orden actual (código):', categoriaCompra);
        
        const categoriaId = mapeoCategoriaId[categoriaCompra];
        console.log('📋 Categoria orden actual (ID numérico):', categoriaId);
        console.log('📋 Categoria del nuevo proveedor (ID):', result.data.categoria_id);
        
        const proveedoresFiltrados = todosProveedores.filter(p => {
          console.log(`   🔍 Proveedor "${p.nombre}" - categoria_id: ${p.categoria_id} === ${categoriaId}?`, p.categoria_id === categoriaId);
          return p.categoria_id === categoriaId;
        });
        console.log('📋 Proveedores filtrados:', proveedoresFiltrados.length);
        
        setProveedores(proveedoresFiltrados);
        
        // Seleccionar el nuevo proveedor automáticamente (renombrar variable para evitar colisión)
        const proveedorCreado = result.data;
        onFormChange('proveedor', proveedorCreado.nombre);
        onFormChange('rucProveedor', proveedorCreado.ruc || '');
        onFormChange('contactoProveedor', proveedorCreado.contacto || '');
        onFormChange('telefonoProveedor', proveedorCreado.telefono || '');
        onFormChange('emailProveedor', proveedorCreado.email || '');
        
        // Mostrar contacto si hay datos
        if (proveedorCreado.contacto || proveedorCreado.telefono || proveedorCreado.email) {
          setShowContacto(true);
        }
        
        cerrarModal();
      } else {
        setErrors({ general: result.error || 'Error al crear proveedor' });
      }
    } catch (error) {
      console.error('❌ Error agregando proveedor:', error);
      setErrors({ general: 'Error al crear proveedor' });
    } finally {
      setLoading(false);
    }
  };

  const opcionesProveedores = [
    { value: '', label: 'Seleccione proveedor' },
    { value: 'varios', label: 'Varios (Sin RUC)' },
    ...proveedores.map(proveedor => ({
      value: JSON.stringify(proveedor),
      label: proveedor.nombre
    }))
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
              onChange={(value) => handleProveedorChange(value)}
              options={opcionesProveedores}
              placeholder="Seleccione proveedor"
              required
              disabled={loading}
            />
            {proveedores.length > 0 && (
              <p className="text-xs text-secondary-500">
                {proveedores.length} proveedor(es) disponible(s)
              </p>
            )}
            {loading && (
              <p className="text-xs text-blue-500">Cargando proveedores...</p>
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
              onClick={abrirModalProveedor}
              icon={PlusIcon}
            >
              Nuevo
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

        {/* Modal para agregar nuevo proveedor */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Agregar Nuevo Proveedor
                  </h3>
                  <button
                    onClick={cerrarModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  {errors.general && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                      {errors.general}
                    </div>
                  )}

                  {/* Mensaje informativo sobre la categoría */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-800">
                      <strong>ℹ️ Nota:</strong> Este proveedor se creará para la categoría <strong>{categorias.find(c => c.id === parseInt(nuevoProveedor.categoria_id))?.nombre || categoriaCompra}</strong> de la orden actual.
                    </p>
                  </div>

                  <Input
                    label="Nombre del Proveedor *"
                    value={nuevoProveedor.nombre}
                    onChange={(e) => handleNuevoProveedorChange('nombre', e.target.value)}
                    placeholder="Ej: Empresa ABC S.A.C."
                    error={errors.nombre}
                    required
                  />

                  <Select
                    label="Categoría de Compra *"
                    value={nuevoProveedor.categoria_id}
                    onChange={(value) => handleNuevoProveedorChange('categoria_id', value)}
                    options={[
                      { value: '', label: 'Seleccione categoría' },
                      ...categorias.map(categoria => ({
                        value: categoria.id.toString(),
                        label: categoria.nombre
                      }))
                    ]}
                    error={errors.categoria_id}
                    leftIcon={TagIcon}
                    required
                    disabled={!!categoriaCompra}
                  />

                  <Input
                    label="RUC"
                    value={nuevoProveedor.ruc}
                    onChange={(e) => handleNuevoProveedorChange('ruc', e.target.value)}
                    placeholder="12345678901"
                    error={errors.ruc}
                    maxLength={11}
                  />

                  <Input
                    label="Contacto"
                    value={nuevoProveedor.contacto}
                    onChange={(e) => handleNuevoProveedorChange('contacto', e.target.value)}
                    placeholder="Nombre del contacto"
                    error={errors.contacto}
                  />

                  <Input
                    label="Teléfono"
                    value={nuevoProveedor.telefono}
                    onChange={(e) => handleNuevoProveedorChange('telefono', e.target.value)}
                    placeholder="999-888-777"
                    error={errors.telefono}
                  />

                  <Input
                    label="Email"
                    type="email"
                    value={nuevoProveedor.email}
                    onChange={(e) => handleNuevoProveedorChange('email', e.target.value)}
                    placeholder="contacto@empresa.com"
                    error={errors.email}
                  />
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={cerrarModal}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={guardarProveedor}
                    loading={loading}
                    disabled={loading}
                  >
                    {loading ? 'Guardando...' : 'Guardar Proveedor'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default InformacionProveedorDB;
