import React, { useState, useCallback } from 'react';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout/Layout';
import InformacionOrganizacional from './components/Forms/InformacionOrganizacional';
import InformacionGeneral from './components/Forms/InformacionGeneral';
import InformacionProveedor from './components/Forms/InformacionProveedor';
import ItemsOrden from './components/Forms/ItemsOrden';
import Timeline from './components/Timeline/Timeline';
import ResumenOrden from './components/OrdenCompra/ResumenOrden';
import GenerarOrden from './components/OrdenCompra/GenerarOrden';
import { useOrdenCompra } from './hooks/useOrdenCompra';
import { useTimeline } from './hooks/useTimeline';

const App = () => {
  const [formData, setFormData] = useState({
    // Información organizacional
    unidadNegocio: '',
    unidadAutoriza: '',
    ubicacionEntrega: '',
    lugarEntrega: '',
    datosProyecto: '',
    
    // Información general
    numeroOC: '',
    fechaRequerimiento: '',
    categoriaCompra: '',
    tipoOC: 'standard',
    
    // Información del proveedor
    proveedor: '',
    rucProveedor: '',
    contactoProveedor: '',
    telefonoProveedor: '',
    emailProveedor: '',
    
    // Condiciones comerciales
    condicionesPago: 'contado',
    
    // Control y aprobación
    compradorResponsable: 'alvaro_perez'
  });

  const [ordenGenerada, setOrdenGenerada] = useState('');
  const [showResumen, setShowResumen] = useState(false);

  const { items, calcularTotal } = useOrdenCompra();
  const { actualizarComprador } = useTimeline();

  const handleFormChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Actualizar comprador en timeline si es necesario
    if (field === 'compradorResponsable') {
      actualizarComprador(value);
    }
  }, [actualizarComprador]);

  const handleGenerarOrden = (orden) => {
    setOrdenGenerada(orden);
    setShowResumen(true);
  };

  const total = calcularTotal();
  const hasRequiredFields = formData.unidadNegocio && 
                           formData.unidadAutoriza && 
                           formData.ubicacionEntrega && 
                           formData.lugarEntrega && 
                           formData.categoriaCompra && 
                           formData.proveedor && 
                           formData.rucProveedor && 
                           Object.keys(items).length > 0;

  return (
    <div className="min-h-screen">
      <Layout>
        {/* Banner promocional */}

        {/* Formularios principales */}
        <div className="space-y-6">
          <InformacionOrganizacional 
            formData={formData} 
            onFormChange={handleFormChange} 
          />
          
          <InformacionGeneral 
            formData={formData} 
            onFormChange={handleFormChange} 
          />
          
          <InformacionProveedor 
            formData={formData} 
            onFormChange={handleFormChange}
            categoriaCompra={formData.categoriaCompra}
          />
          
          <ItemsOrden categoriaCompra={formData.categoriaCompra} />
          
          <Timeline />
        </div>

        {/* Resumen y generación */}
        {hasRequiredFields && (
          <div className="mt-8 space-y-6">
            <ResumenOrden formData={formData} />
            <GenerarOrden 
              formData={formData} 
              onGenerarOrden={handleGenerarOrden}
            />
          </div>
        )}

        {/* Mensaje de campos requeridos */}
        {!hasRequiredFields && (
          <div className="mt-8">
            <div className="bg-warning-50 border border-warning-200 rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-lg font-semibold text-warning-900 mb-2">
                Complete los campos requeridos
              </h3>
              <p className="text-warning-700">
                Para generar la orden de compra, complete todos los campos obligatorios marcados con *
              </p>
            </div>
          </div>
        )}

        {/* Estadísticas rápidas */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-soft border border-secondary-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <span className="text-primary-600 font-bold text-sm">📋</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Items</p>
                <p className="text-lg font-semibold text-primary-600">
                  {Object.keys(items).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-soft border border-secondary-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                <span className="text-success-600 font-bold text-sm">₡</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Total</p>
                <p className="text-lg font-semibold text-success-600">
                  S/ {total.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-soft border border-secondary-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center">
                <span className="text-warning-600 font-bold text-sm">📊</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Progreso</p>
                <p className="text-lg font-semibold text-warning-600">
                  {hasRequiredFields ? '100%' : '75%'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-soft border border-secondary-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-accent-100 rounded-lg flex items-center justify-center">
                <span className="text-accent-600 font-bold text-sm">⚡</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Estado</p>
                <p className="text-lg font-semibold text-accent-600">
                  {hasRequiredFields ? 'Listo' : 'En proceso'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Layout>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
};

export default App;
