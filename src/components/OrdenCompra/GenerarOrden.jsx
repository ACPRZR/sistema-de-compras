import React, { useState, useRef } from 'react';
import { 
  DocumentTextIcon, 
  ArrowDownTrayIcon,
  EnvelopeIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import html2canvas from 'html2canvas';
import Button from '../UI/Button';
import OrdenVisual from './OrdenVisual';
import { useOrdenCompraDB } from '../../hooks/useOrdenCompraDB';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { EMPRESA_CONFIG } from '../../utils/constants';

const GenerarOrden = ({ formData, onGenerarOrden, items, total }) => {
  const { resumenItems, calcularTotal } = useOrdenCompraDB();
  const [isGenerating, setIsGenerating] = useState(false);
  const [ordenGenerada, setOrdenGenerada] = useState('');
  const [mostrarVistaVisual, setMostrarVistaVisual] = useState(false);
  const visualRef = useRef(null);

  const generarOrdenCompra = async () => {
    setIsGenerating(true);
    
    try {
      // Simular delay de generación
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const totalCalculado = total || calcularTotal();
      const orden = crearOrdenCompra(formData, resumenItems, totalCalculado);
      
      setOrdenGenerada(orden);
      setMostrarVistaVisual(true);
      onGenerarOrden(orden);
    } catch (error) {
      console.error('Error generando orden:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const crearOrdenCompra = (formData, items, total) => {
    const fechaEmision = new Date().toLocaleDateString('es-PE');
    const fechaRequerimiento = formData.fechaRequerimiento ? 
      formatDate(formData.fechaRequerimiento) : 'No especificada';
    
    const tipoOCTexto = formData.tipoOC === 'blanket' ? 'ORDEN MARCO (BLANKET)' : 'ORDEN ESTÁNDAR';
    
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

    return `
${EMPRESA_CONFIG.nombreCompleto}

Inscrita en el Registro de Personas Jurídicas de Lima Partida N° ${EMPRESA_CONFIG.partida}. R.U.C. N° ${EMPRESA_CONFIG.ruc}
Registro de Entidades Religiosas N° ${EMPRESA_CONFIG.registro}
"${EMPRESA_CONFIG.lema}"

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
Unidad de Negocio: ${formData.unidadNegocio || 'No especificada'}
Unidad que Autoriza: ${formData.unidadAutoriza || 'No especificada'}
Ubicación de Entrega: ${formData.ubicacionEntrega || 'No especificada'}
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
                            Dirección: ${EMPRESA_CONFIG.direccion}
                             Teléfonos: ${EMPRESA_CONFIG.telefono}
                      Correo Electrónico: ${EMPRESA_CONFIG.email}`;
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
      // Para uso local, mostrar mensaje simple
      console.log('Email del proveedor no especificado');
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
            <h3 className="text-lg font-semibold text-gray-900">Generar Orden de Compra</h3>
            <p className="text-sm text-secondary-600">Crear y exportar la orden final</p>
          </div>
        </div>
      </div>
      
      <div className="card-body space-y-6">
        {/* Botón principal de generación */}
        <div className="text-center">
          <Button
            variant="primary"
            size="lg"
            onClick={generarOrdenCompra}
            loading={isGenerating}
            icon={DocumentTextIcon}
            className="px-8 py-4 text-lg"
          >
            {isGenerating ? 'Guardando Orden...' : 'Guardar y Generar Orden'}
          </Button>
          
          {isGenerating && (
            <p className="text-sm text-secondary-600 mt-2">
              Guardando en la base de datos y generando documento...
            </p>
          )}
        </div>

        {/* Orden generada */}
        {ordenGenerada && (
          <div className="space-y-4">
            <div className="bg-success-50 border border-success-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="w-5 h-5 text-success-600" />
                <div>
                  <span className="font-medium text-success-900">
                    ¡Orden guardada exitosamente!
                  </span>
                  <p className="text-sm text-success-700 mt-1">
                    La orden ha sido guardada en la base de datos y está lista para enviar al proveedor.
                  </p>
                </div>
              </div>
            </div>

            {/* Acciones disponibles */}
            <div className="flex flex-wrap gap-3">
              <Button
                variant="secondary"
                onClick={descargarOrden}
                icon={ArrowDownTrayIcon}
              >
                Descargar Orden
              </Button>
              
              <Button
                variant="primary"
                onClick={enviarEmail}
                icon={EnvelopeIcon}
              >
                Enviar al Proveedor
              </Button>
            </div>

            {/* Vista previa de la orden */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Vista Previa de la Orden</h4>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMostrarVistaVisual(!mostrarVistaVisual)}
                  >
                    {mostrarVistaVisual ? 'Ver Texto' : 'Ver Visual'}
                  </Button>
                </div>
              </div>
              
              {mostrarVistaVisual ? (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div ref={visualRef}>
                    <OrdenVisual 
                      formData={formData}
                      items={items}
                      total={total}
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="text-xs font-mono text-gray-700 whitespace-pre-wrap">
                    {ordenGenerada}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default GenerarOrden;
