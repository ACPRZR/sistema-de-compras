import React, { useState, useRef } from 'react';
import { 
  DocumentTextIcon, 
  ArrowDownTrayIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import html2canvas from 'html2canvas';
import Button from '../UI/Button';
import OrdenVisual from './OrdenVisual';
import LinksAprobacionModal from '../Modals/LinksAprobacionModal';
import { useOrdenCompraDB } from '../../hooks/useOrdenCompraDB';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useMaestros } from '../../hooks/useMaestros';
import apiService from '../../services/api';

const GenerarOrden = ({ formData, onGenerarOrden, onNavigate, items, total }) => {
  const { resumenItems, calcularTotal } = useOrdenCompraDB();
  const { maestros } = useMaestros();
  const [isGenerating, setIsGenerating] = useState(false);
  const [ordenGenerada, setOrdenGenerada] = useState('');
  const [mostrarVistaVisual, setMostrarVistaVisual] = useState(false);
  const [ordenGuardadaId, setOrdenGuardadaId] = useState(null);
  const [numeroOcGuardado, setNumeroOcGuardado] = useState(null);
  const [showLinksModal, setShowLinksModal] = useState(false);
  const [linksAprobacion, setLinksAprobacion] = useState(null);
  const [generandoLinks, setGenerandoLinks] = useState(false);
  const visualRef = useRef(null);

  const generarOrdenCompra = async () => {
    setIsGenerating(true);
    
    try {
      const totalCalculado = total || calcularTotal();
      const orden = crearOrdenCompra(formData, resumenItems, totalCalculado);
      
      // Guardar orden en la base de datos (ahora onGenerarOrden debe devolver la respuesta)
      const respuesta = await onGenerarOrden(orden);
      
      console.log('🔍 Respuesta recibida en GenerarOrden:', respuesta);
      console.log('🔍 Estructura de respuesta:', {
        tipo: typeof respuesta,
        tieneId: respuesta?.id,
        id: respuesta?.id,
        numeroOC: respuesta?.numero_oc
      });
      
      // Si la orden fue guardada exitosamente, capturar el ID
      if (respuesta && respuesta.id) {
        console.log('✅ Guardando ID de orden:', respuesta.id);
        setOrdenGuardadaId(respuesta.id);
        setNumeroOcGuardado(respuesta.numero_oc || formData.numeroOC);
      } else {
        console.warn('⚠️ No se pudo obtener el ID de la orden de la respuesta');
      }
      
      setOrdenGenerada(orden);
      setMostrarVistaVisual(true);
    } catch (error) {
      console.error('Error generando orden:', error);
      alert('Error al guardar la orden: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const crearOrdenCompra = (formData, items, total) => {
    const fechaEmision = new Date().toLocaleDateString('es-PE');
    const fechaRequerimiento = formData.fechaRequerimiento ? 
      formatDate(formData.fechaRequerimiento) : 'No especificada';
    
    // Helper functions para obtener nombres legibles
    const getUnidadNegocioTexto = (codigo) => {
      if (!codigo) return 'No especificada';
      const unidad = maestros.unidadesNegocio.find(u => u.codigo === codigo);
      return unidad ? unidad.nombre : codigo;
    };

    const getTipoOCTexto = (codigo) => {
      if (!codigo) return 'ORDEN ESTÁNDAR';
      const tipo = maestros.tiposOrden.find(t => t.codigo === codigo);
      return tipo ? tipo.nombre.toUpperCase() : codigo.toUpperCase();
    };
    
    const getUbicacionEntregaTexto = (codigo) => {
      if (!codigo) return 'No especificada';
      const ubicacion = maestros.ubicacionesEntrega.find(u => u.codigo === codigo);
      return ubicacion ? ubicacion.nombre : codigo;
    };
    
    const getUnidadAutorizaTexto = (codigo) => {
      if (!codigo) return 'No especificada';
      const unidad = maestros.unidadesAutoriza.find(u => u.codigo === codigo);
      return unidad ? unidad.nombre : codigo;
    };
    
    const tipoOCTexto = getTipoOCTexto(formData.tipoOC);
    
    // Construir detalle de items
    let detalleItems = '';
    items.forEach((item, index) => {
      detalleItems += `${(index + 1).toString().padStart(2, '0')}. ${item.descripcion}
    Cantidad: ${item.cantidad} ${item.unidad}
    Precio Unitario: ${formatCurrency(item.precio)}
    Subtotal: ${formatCurrency(item.subtotal)}

`;
    });

    // Información del proveedor
    let infoProveedor = `Razón Social: ${formData.proveedor || 'No especificado'}
RUC: ${formData.rucProveedor || 'No especificado'}`;

    if (formData.contactoProveedor || formData.telefonoProveedor || formData.emailProveedor) {
      infoProveedor += `\nContacto: ${formData.contactoProveedor || 'No especificado'}`;
      if (formData.telefonoProveedor) infoProveedor += `\nTeléfono: ${formData.telefonoProveedor}`;
      if (formData.emailProveedor) infoProveedor += `\nEmail: ${formData.emailProveedor}`;
    }

    const empresa = maestros.configuracionEmpresa || {};
    
    return `
${empresa.nombre_completo || empresa.nombre || 'Las Asambleas de Dios del Perú'}

Inscrita en el Registro de Personas Jurídicas de Lima Partida N° ${empresa.partida || 'N/A'}. R.U.C. N° ${empresa.ruc || 'N/A'}
Registro de Entidades Religiosas N° ${empresa.registro || 'N/A'}
"${empresa.lema || ''}"

                                    LOGÍSTICA

                              ORDEN DE COMPRA

═══════════════════════════════════════════════════════════════════════════════

ORDEN DE COMPRA N°: ${formData.numeroOC || 'OC-2025-01-001'}
TIPO DE ORDEN: ${tipoOCTexto}
FECHA DE EMISIÓN: ${fechaEmision}
FECHA DE REQUERIMIENTO: ${fechaRequerimiento}
CATEGORÍA: ${formData.categoriaCompra?.toUpperCase() || 'NO ESPECIFICADA'}
ESTADO: 📝 Creada

═══════════════════════════════════════════════════════════════════════════════

INFORMACIÓN ORGANIZACIONAL:
Unidad de Negocio: ${getUnidadNegocioTexto(formData.unidadNegocio)}
Unidad que Autoriza: ${getUnidadAutorizaTexto(formData.unidadAutoriza)}
Ubicación de Entrega: ${getUbicacionEntregaTexto(formData.ubicacionEntrega)}
${formData.datosProyecto ? `Proyecto Asociado: ${formData.datosProyecto}` : ''}

═══════════════════════════════════════════════════════════════════════════════

DATOS DEL PROVEEDOR:
${infoProveedor}

═══════════════════════════════════════════════════════════════════════════════

DETALLE DE ITEMS SOLICITADOS:

${detalleItems}

═══════════════════════════════════════════════════════════════════════════════

                           TOTAL GENERAL: ${formatCurrency(total)}

═══════════════════════════════════════════════════════════════════════════════

CONDICIONES COMERCIALES:
• Condiciones de Pago: ${formData.condicionesPago || 'Contado'}
• Lugar de Entrega: ${formData.lugarEntrega || 'No especificado'}
• Fecha de Requerimiento: ${fechaRequerimiento}
• Validez de la orden: 30 días
• Los precios incluyen IGV
${formData.tipoOC === 'blanket' ? '• ORDEN MARCO: Válida para múltiples entregas según requerimientos' : '• ORDEN ESTÁNDAR: Entrega única según especificaciones'}

═══════════════════════════════════════════════════════════════════════════════

FIRMAS Y APROBACIONES:

Solicitado por:                    Aprobado por:
_________________                  _________________
Álvaro Pérez Román                 [Supervisor]
Fecha: ${fechaEmision}             Fecha: ___________

═══════════════════════════════════════════════════════════════════════════════
                            Dirección: ${empresa.direccion || 'N/A'}
                             Teléfonos: ${empresa.telefono || 'N/A'}
                      Correo Electrónico: ${empresa.email || 'N/A'}`;
  };


  const descargarOrden = async () => {
    try {
      // Capturar la vista visual como imagen
      if (!visualRef.current) {
        throw new Error('No se puede capturar la vista previa');
      }

      const canvas = await html2canvas(visualRef.current, {
        scale: 2, // Mayor calidad
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Convertir canvas a base64
      const imageData = canvas.toDataURL('image/png');

      // Preparar datos para el PDF
      const ordenData = {
        numero_oc: formData.numeroOC || 'OC-2025-01-001',
        fecha_requerimiento: formData.fechaRequerimiento,
        categoria_nombre: formData.categoriaCompra?.toUpperCase() || 'NO ESPECIFICADA',
        tipo_oc_id: formData.tipoOC === 'blanket' ? 2 : 1,
        proveedor_nombre: formData.proveedor || 'No especificado',
        proveedor_ruc: formData.rucProveedor || 'No especificado',
        proveedor_contacto: formData.contactoProveedor || 'No especificado',
        proveedor_telefono: formData.telefonoProveedor || 'No especificado',
        proveedor_email: formData.emailProveedor || 'No especificado',
        lugar_entrega: formData.lugarEntrega || 'No especificado',
        condiciones_pago_nombre: formData.condicionesPago || 'Contado'
      };

      // Preparar items para el PDF
      const itemsData = Object.values(items).map(item => ({
        descripcion: item.descripcion,
        cantidad: item.cantidad,
        unidad: item.unidad,
        precio: item.precio,
        subtotal: item.subtotal
      }));

      // Llamar al endpoint de PDF con imagen
      const response = await fetch('http://localhost:3001/api/pdf/orden', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ordenData,
          items: itemsData,
          visualPreview: imageData // Enviar la imagen capturada
        })
      });

      if (!response.ok) {
        throw new Error('Error generando PDF');
      }

      // Descargar el PDF
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${formData.numeroOC || 'OC-2025-01-001'}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error descargando PDF:', error);
      alert('Error al generar el PDF. Inténtalo de nuevo.');
    }
  };

  const enviarEmail = () => {
    const email = formData.emailProveedor;
    const numeroOC = formData.numeroOC || 'OC-2025-01-001';
    const asunto = `Orden de Compra ${numeroOC} - LADP`;
    const cuerpo = `Estimados,

Adjunto encontrarán la Orden de Compra ${numeroOC} para su procesamiento.

Por favor confirmen recepción y tiempo estimado de entrega.

Saludos cordiales,
Álvaro Pérez Román
Departamento de Logística
Las Asambleas de Dios del Perú`;

    if (email) {
      window.open(`mailto:${email}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`);
    } else {
      alert('Por favor especifique el email del proveedor');
    }
  };

  /**
   * Generar links de aprobación para enviar por WhatsApp
   */
  const generarLinksAprobacion = async () => {
    console.log('🔗 Intentando generar links...');
    console.log('🔗 ordenGuardadaId:', ordenGuardadaId);
    console.log('🔗 numeroOcGuardado:', numeroOcGuardado);
    
    if (!ordenGuardadaId) {
      alert('Primero debes guardar la orden');
      return;
    }

    setGenerandoLinks(true);
    try {
      const baseUrl = window.location.origin;
      console.log('🔗 Llamando al backend con ordenId:', ordenGuardadaId);
      const response = await apiService.generarTokenAprobacion(ordenGuardadaId, baseUrl);

      console.log('🔗 Respuesta del backend:', response);

      if (response.success) {
        setLinksAprobacion({
          urls: response.data.urls,
          whatsappMessage: response.data.whatsappMessage,
          numero_oc: numeroOcGuardado
        });
        setShowLinksModal(true);
      } else {
        alert('Error al generar links: ' + response.message);
      }
    } catch (error) {
      console.error('❌ Error generando links:', error);
      alert('Error al generar los links de aprobación: ' + error.message);
    } finally {
      setGenerandoLinks(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-accent-600 rounded-lg flex items-center justify-center">
            <DocumentTextIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Crear Orden de Compra</h3>
            <p className="text-sm text-secondary-600">Guardar orden en el sistema</p>
          </div>
        </div>
      </div>
      
      <div className="card-body space-y-6">
        {/* Mensaje informativo */}
        {!ordenGenerada && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-blue-900">
                  <strong>💡 ¿Qué sigue después?</strong>
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Una vez guardada la orden, podrás gestionarla desde <strong>"Órdenes Pendientes"</strong>, donde podrás ver el PDF, generar links de aprobación, y hacer seguimiento del proceso.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Botón principal de guardado */}
        <div className="text-center">
          <Button
            variant="primary"
            size="lg"
            onClick={generarOrdenCompra}
            loading={isGenerating}
            icon={DocumentTextIcon}
            className="px-8 py-4 text-lg"
          >
            {isGenerating ? 'Guardando Orden...' : 'Guardar Orden'}
          </Button>
          
          {isGenerating && (
            <p className="text-sm text-secondary-600 mt-2">
              Guardando en la base de datos...
            </p>
          )}
        </div>

        {/* Orden guardada - Mensaje de éxito */}
        {ordenGenerada && (
          <div className="space-y-4">
            <div className="bg-success-50 border border-success-200 rounded-lg p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center">
                  <CheckCircleIcon className="w-10 h-10 text-success-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-success-900 mb-2">
                    ¡Orden Creada Exitosamente!
                  </h3>
                  <p className="text-lg font-semibold text-success-800 mb-2">
                    {numeroOcGuardado || formData.numeroOC}
                  </p>
                  <p className="text-sm text-success-700">
                    La orden ha sido guardada en el sistema y está lista para su gestión.
                  </p>
                </div>
                
                {/* Acciones rápidas */}
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <Button
                    variant="primary"
                    onClick={() => window.location.reload()}
                  >
                    Crear Nueva Orden
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => onNavigate && onNavigate('ordenes-pendientes')}
                  >
                    Ver Órdenes Pendientes
                  </Button>
                </div>

                {/* Mensaje informativo */}
                <div className="bg-white border border-success-200 rounded-lg p-4 mt-4 w-full">
                  <p className="text-sm text-gray-700">
                    <strong>📋 Próximos pasos:</strong>
                  </p>
                  <ul className="text-sm text-gray-600 mt-2 space-y-1 text-left list-disc list-inside">
                    <li>Ve a <strong>"Órdenes Pendientes"</strong></li>
                    <li>Haz clic en el ícono 👁️ para ver el resumen y descargar el PDF</li>
                    <li>Haz clic en el ícono 📊 para generar links de aprobación</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default GenerarOrden;



