import React, { useState, useCallback } from 'react';
import Layout from './components/Layout/Layout';
import InformacionOrganizacional from './components/Forms/InformacionOrganizacional';
import InformacionGeneral from './components/Forms/InformacionGeneral';
import InformacionProveedorDB from './components/Forms/InformacionProveedorDB';
import ItemsOrdenDB from './components/Forms/ItemsOrdenDB';
import ResumenOrden from './components/OrdenCompra/ResumenOrden';
import GenerarOrden from './components/OrdenCompra/GenerarOrden';
import OrdenesPendientes from './components/Pages/OrdenesPendientes';
import Historial from './components/Pages/Historial';
import Reportes from './components/Pages/Reportes';
import { useOrdenCompraDB } from './hooks/useOrdenCompraDB';
import apiService from './services/api';

// Importar utilidades de desarrollo (solo en modo desarrollo)
if (process.env.NODE_ENV === 'development') {
  import('./utils/devTools');
}

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
    compradorResponsable: 'alvaro_perez',
    aprobadorId: '' // ID del usuario que aprobará la orden
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

  const handleFormChange = useCallback((field, value) => {
    console.log(`🔄 handleFormChange: ${field} = ${value} (${typeof value})`);
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      console.log(`🔄 Nuevo formData:`, newData);
      return newData;
    });
  }, []);

  const handleGenerarOrden = async (orden) => {
    try {
      // Obtener el formData actual directamente del estado
      console.log('🚀 handleGenerarOrden ejecutándose con formData:', formData);
      
      // Validar que exista proveedor
      if (!formData.proveedor) {
        throw new Error('Debe seleccionar un proveedor');
      }

      // Validar que se haya seleccionado un aprobador
      if (!formData.aprobadorId || formData.aprobadorId === '') {
        console.log('❌ AprobadorId no válido:', formData.aprobadorId);
        throw new Error('Debe seleccionar quién aprobará esta orden');
      }

      // Guardar orden en la base de datos con los valores reales del formulario
      const ordenData = {
        numero_oc: formData.numeroOC || await generarNumeroOC(),
        fecha_requerimiento: formData.fechaRequerimiento || new Date().toISOString().split('T')[0],
        categoria_id: parseInt(formData.categoriaCompra) || 1,
        tipo_oc_id: parseInt(formData.tipoOC) || 1,
        estado_id: 1, // Siempre inicia en "Creada"
        prioridad_id: 1, // Por defecto: Normal
        unidad_negocio_id: parseInt(formData.unidadNegocio) || 1,
        unidad_autoriza_id: parseInt(formData.unidadAutoriza) || 1,
        ubicacion_entrega_id: parseInt(formData.ubicacionEntrega) || 1,
        lugar_entrega: formData.lugarEntrega,
        datos_proyecto: formData.datosProyecto,
        proveedor_nombre: formData.proveedor,
        proveedor_ruc: formData.rucProveedor && formData.rucProveedor.trim() && formData.rucProveedor !== 'Sin RUC' ? formData.rucProveedor : null,
        proveedor_contacto: formData.contactoProveedor && formData.contactoProveedor.trim() ? formData.contactoProveedor : null,
        proveedor_telefono: formData.telefonoProveedor && formData.telefonoProveedor.trim() ? formData.telefonoProveedor : null,
        proveedor_email: formData.emailProveedor && formData.emailProveedor.trim() ? formData.emailProveedor : null,
        condiciones_pago_id: parseInt(formData.condicionesPago) || 1,
        comprador_responsable_id: 1, // Álvaro por defecto
        aprobador_id: parseInt(formData.aprobadorId) || null, // Usuario que aprobará la orden
        total: calcularTotal()
      };

      console.log('📤 Enviando orden al backend:', ordenData);
      console.log('🔍 FormData completo:', formData);
      console.log('👤 Aprobador:', {
        aprobadorId: formData.aprobadorId,
        tipo: typeof formData.aprobadorId,
        parseado: parseInt(formData.aprobadorId),
        esNaN: isNaN(parseInt(formData.aprobadorId)),
        esVacio: formData.aprobadorId === '',
        esNull: formData.aprobadorId === null,
        esUndefined: formData.aprobadorId === undefined
      });
      
      // Log específico para debugging del aprobadorId
      console.log('🔍 DEBUG APROBADOR_ID:', {
        valorOriginal: formData.aprobadorId,
        valorParseado: parseInt(formData.aprobadorId),
        valorFinal: parseInt(formData.aprobadorId) || null,
        formDataCompleto: formData
      });
      console.log('🔍 RUC específico:', {
        valor: formData.rucProveedor,
        tipo: typeof formData.rucProveedor,
        longitud: formData.rucProveedor?.length,
        procesado: ordenData.proveedor_ruc
      });

      const respuesta = await guardarOrden(ordenData);
      
      console.log('✅ Respuesta del backend:', respuesta);
      
      // Guardar los items de la orden si hay items
      if (respuesta && respuesta.id && Object.keys(items).length > 0) {
        console.log('📦 Guardando items de la orden...');
        
        const itemsArray = Object.values(items).map((item, index) => ({
          descripcion: item.descripcion,
          unidad_id: parseInt(item.unidad) || 1,
          cantidad: parseFloat(item.cantidad),
          precio_unitario: parseFloat(item.precio),
          subtotal: parseFloat(item.subtotal)
        }));
        
        try {
          await apiService.addOrdenItems(respuesta.id, itemsArray);
          console.log('✅ Items guardados exitosamente');
        } catch (itemError) {
          console.error('❌ Error guardando items:', itemError);
          // Continuar aunque falle guardado de items
        }
      }
      
      // Mostrar mensaje de éxito
      alert('Orden de compra guardada exitosamente en la base de datos');
      
      // Retornar la respuesta para que GenerarOrden pueda capturar el ID
      return respuesta;
    } catch (err) {
      console.error('❌ Error guardando orden:', err);
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
                           formData.aprobadorId && // Agregar validación del aprobador
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
                  onNavigate={handleNavigate}
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
