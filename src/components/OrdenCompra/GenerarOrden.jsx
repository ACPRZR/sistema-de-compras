import React, { useState } from 'react';
import { 
  DocumentTextIcon, 
  ClipboardDocumentListIcon,
  ArrowDownTrayIcon,
  EnvelopeIcon,
  ShareIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import Button from '../UI/Button';
import { useOrdenCompra } from '../../hooks/useOrdenCompra';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { EMPRESA_CONFIG } from '../../utils/constants';

const GenerarOrden = ({ formData, onGenerarOrden }) => {
  const { resumenItems, calcularTotal } = useOrdenCompra();
  const [isGenerating, setIsGenerating] = useState(false);
  const [ordenGenerada, setOrdenGenerada] = useState('');

  const generarOrdenCompra = async () => {
    setIsGenerating(true);
    
    try {
      // Simular delay de generación
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const total = calcularTotal();
      const orden = crearOrdenCompra(formData, resumenItems, total);
      
      setOrdenGenerada(orden);
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

  const copiarOrden = async () => {
    try {
      await navigator.clipboard.writeText(ordenGenerada);
      // Aquí podrías mostrar una notificación de éxito
    } catch (error) {
      console.error('Error copiando orden:', error);
    }
  };

  const descargarOrden = () => {
    const blob = new Blob([ordenGenerada], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.numeroOC || 'OC-2025-01-001'}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
      alert('Ingrese el email del proveedor primero');
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
            {isGenerating ? 'Generando Orden...' : 'Generar Orden de Compra'}
          </Button>
          
          {isGenerating && (
            <p className="text-sm text-secondary-600 mt-2">
              Procesando información y generando documento...
            </p>
          )}
        </div>

        {/* Orden generada */}
        {ordenGenerada && (
          <div className="space-y-4">
            <div className="bg-success-50 border border-success-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="w-5 h-5 text-success-600" />
                <span className="font-medium text-success-900">
                  ¡Orden generada exitosamente!
                </span>
              </div>
            </div>

            {/* Acciones disponibles */}
            <div className="flex flex-wrap gap-3">
              <Button
                variant="success"
                onClick={copiarOrden}
                icon={ClipboardDocumentListIcon}
              >
                Copiar Orden
              </Button>
              
              <Button
                variant="secondary"
                onClick={descargarOrden}
                icon={ArrowDownTrayIcon}
              >
                Descargar TXT
              </Button>
              
              <Button
                variant="primary"
                onClick={enviarEmail}
                icon={EnvelopeIcon}
              >
                Enviar por Email
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => navigator.share?.({ text: ordenGenerada })}
                icon={ShareIcon}
              >
                Compartir
              </Button>
            </div>

            {/* Vista previa de la orden */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Vista Previa de la Orden</h4>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="text-xs font-mono text-gray-700 whitespace-pre-wrap">
                  {ordenGenerada}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Información adicional */}
        <div className="bg-gradient-to-r from-accent-50 to-primary-50 rounded-lg p-4 border border-accent-200">
          <div className="flex items-start space-x-3">
            <DocumentTextIcon className="w-5 h-5 text-accent-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-accent-900 mb-1">
                Documento Profesional
              </h4>
              <p className="text-xs text-accent-700">
                La orden generada incluye toda la información necesaria para el procesamiento 
                y cumple con los estándares de documentación empresarial.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerarOrden;
