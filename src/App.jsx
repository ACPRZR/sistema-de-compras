import React, { useState, useCallback } from 'react';
import Layout from './components/Layout/Layout';
import InformacionOrganizacional from './components/Forms/InformacionOrganizacional';
import InformacionGeneral from './components/Forms/InformacionGeneral';
import InformacionProveedorDB from './components/Forms/InformacionProveedorDB';
import ItemsOrdenDB from './components/Forms/ItemsOrdenDB';
import Timeline from './components/Timeline/Timeline';
import ResumenOrden from './components/OrdenCompra/ResumenOrden';
import GenerarOrden from './components/OrdenCompra/GenerarOrden';
import OrdenesPendientes from './components/Pages/OrdenesPendientes';
import Historial from './components/Pages/Historial';
import Reportes from './components/Pages/Reportes';
import { useOrdenCompraDB } from './hooks/useOrdenCompraDB';
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
    
    // Control y aprobación (fijo para uso local)
    compradorResponsable: 'alvaro_perez'
  });

  const [currentPage, setCurrentPage] = useState('nueva-orden');

  const { 
    items, 
    contadorItems, 
    agregarItem, 
    actualizarItem, 
    eliminarItem, 
    calcularTotal, 
    resumenItems,
    loading,
    error,
    guardarOrden,
    generarNumeroOC
  } = useOrdenCompraDB();
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

  const handleGenerarOrden = async (orden) => {
    try {
      // Guardar orden en la base de datos
      const ordenData = {
        numero_oc: formData.numeroOC || await generarNumeroOC(),
        fecha_requerimiento: formData.fechaRequerimiento || new Date().toISOString().split('T')[0],
        categoria_id: 1, // Categoría por defecto
        tipo_oc_id: 1, // Tipo estándar por defecto
        estado_id: 1, // Estado "Creada" por defecto
        prioridad_id: 1, // Prioridad "Normal" por defecto
        unidad_negocio_id: 1, // Unidad de negocio por defecto
        unidad_autoriza_id: 1, // Unidad autorizadora por defecto
        ubicacion_entrega_id: 1, // Ubicación por defecto
        lugar_entrega: formData.lugarEntrega || 'Oficina Principal',
        datos_proyecto: formData.datosProyecto || 'Proyecto General',
        proveedor_nombre: formData.proveedor || 'Proveedor Genérico',
        proveedor_ruc: formData.rucProveedor || '12345678901',
        proveedor_contacto: formData.contactoProveedor || 'Contacto',
        proveedor_telefono: formData.telefonoProveedor || '999999999',
        proveedor_email: formData.emailProveedor || 'proveedor@email.com',
        condiciones_pago_id: 1, // Condiciones por defecto
        comprador_responsable_id: 1, // Comprador por defecto
        total: calcularTotal()
      };

      const respuesta = await guardarOrden(ordenData);
      
      // Mostrar mensaje de éxito
      alert('Orden de compra guardada exitosamente en la base de datos');
      
      // Retornar la respuesta para que GenerarOrden pueda capturar el ID
      return respuesta;
    } catch (err) {
      console.error('Error guardando orden:', err);
      alert('Error al guardar la orden: ' + err.message);
      throw err;
    }
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  const total = calcularTotal();
  const hasRequiredFields = formData.unidadNegocio && 
                           formData.unidadAutoriza && 
                           formData.ubicacionEntrega && 
                           formData.lugarEntrega && 
                           formData.datosProyecto &&
                           formData.categoriaCompra && 
                           formData.proveedor && 
                           (formData.proveedor === 'Varios' || formData.rucProveedor) && 
                           Object.keys(items).length > 0;

  return (
    <div className="min-h-screen">
      <Layout 
        currentPage={currentPage}
        onNavigate={handleNavigate}
      >
        {/* Contenido dinámico según la página actual */}
        {currentPage === 'nueva-orden' && (
          <div className="space-y-6">
            <InformacionOrganizacional 
              formData={formData} 
              onFormChange={handleFormChange} 
            />
            
            <InformacionGeneral 
              formData={formData} 
              onFormChange={handleFormChange} 
            />
            
            <InformacionProveedorDB 
              formData={formData} 
              onFormChange={handleFormChange}
              categoriaCompra={formData.categoriaCompra}
            />
            
            <ItemsOrdenDB 
              categoriaCompra={formData.categoriaCompra}
              items={items}
              contadorItems={contadorItems}
              agregarItem={agregarItem}
              actualizarItem={actualizarItem}
              eliminarItem={eliminarItem}
              calcularTotal={calcularTotal}
              resumenItems={resumenItems}
            />
            
            <Timeline />
            
            {/* Resumen y generación */}
            {hasRequiredFields && (
              <div className="mt-8 space-y-6">
                <ResumenOrden 
                  formData={formData} 
                  items={items}
                  total={total}
                />
                <GenerarOrden 
                  formData={formData} 
                  onGenerarOrden={handleGenerarOrden}
                  items={items}
                  total={total}
                />
              </div>
            )}

            {/* Indicadores de estado */}
            {loading && (
              <div className="mt-8">
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 text-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                  </div>
                  <h3 className="text-lg font-semibold text-primary-900 mb-2">
                    Procesando...
                  </h3>
                  <p className="text-primary-700">
                    Guardando orden en la base de datos
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-8">
                <div className="bg-danger-50 border border-danger-200 rounded-lg p-6 text-center">
                  <div className="w-12 h-12 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">❌</span>
                  </div>
                  <h3 className="text-lg font-semibold text-danger-900 mb-2">
                    Error
                  </h3>
                  <p className="text-danger-700">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* Mensaje de campos requeridos */}
            {!hasRequiredFields && !loading && (
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

            {/* Estadísticas rápidas - Solo en nueva orden */}
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
          </div>
        )}
        
        {currentPage === 'ordenes-pendientes' && <OrdenesPendientes />}
        {currentPage === 'historial' && <Historial />}
        {currentPage === 'reportes' && <Reportes />}
      </Layout>
    </div>
  );
};

export default App;
