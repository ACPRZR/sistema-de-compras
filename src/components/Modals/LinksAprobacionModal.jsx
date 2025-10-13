import React, { useState } from 'react';
import {
  XMarkIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  LinkIcon,
  ChatBubbleBottomCenterTextIcon
} from '@heroicons/react/24/outline';
import Button from '../UI/Button';

/**
 * Modal para mostrar links de aprobación/rechazo de una orden
 * Incluye funcionalidad para copiar al portapapeles
 */
const LinksAprobacionModal = ({ isOpen, onClose, linksData }) => {
  const [copiedField, setCopiedField] = useState(null);

  if (!isOpen || !linksData) return null;

  const { urls, whatsappMessage, numero_oc } = linksData;

  /**
   * Copiar texto al portapapeles
   */
  const copyToClipboard = async (text, fieldName) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Error copiando al portapapeles:', err);
      // Fallback para navegadores antiguos
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  /**
   * Botón de copiar con estado
   */
  const CopyButton = ({ text, fieldName }) => {
    const isCopied = copiedField === fieldName;
    
    return (
      <button
        onClick={() => copyToClipboard(text, fieldName)}
        className={`
          inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg
          transition-all duration-200
          ${isCopied
            ? 'bg-success-100 text-success-700 border border-success-300'
            : 'bg-secondary-100 text-secondary-700 border border-secondary-300 hover:bg-secondary-200'
          }
        `}
        title="Copiar al portapapeles"
      >
        {isCopied ? (
          <>
            <CheckIcon className="w-4 h-4 mr-1" />
            Copiado!
          </>
        ) : (
          <>
            <ClipboardDocumentIcon className="w-4 h-4 mr-1" />
            Copiar
          </>
        )}
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div 
          className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <LinkIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Links de Aprobación Generados
                  </h3>
                  <p className="text-sm text-primary-100">
                    Orden: {numero_oc}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-primary-100 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Instrucciones */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Instrucciones:</strong> Copia y envía estos links por WhatsApp
                al autorizador. Ellos solo necesitan hacer clic para aprobar o rechazar.
              </p>
            </div>

            {/* Link de Aprobar */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <span className="w-6 h-6 rounded-full bg-success-100 text-success-700 flex items-center justify-center text-xs font-bold mr-2">
                  ✓
                </span>
                Link para APROBAR
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={urls.aprobar}
                  readOnly
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono text-gray-700 cursor-pointer hover:bg-gray-100"
                  onClick={() => copyToClipboard(urls.aprobar, 'aprobar')}
                />
                <CopyButton text={urls.aprobar} fieldName="aprobar" />
              </div>
            </div>

            {/* Link de Rechazar */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <span className="w-6 h-6 rounded-full bg-danger-100 text-danger-700 flex items-center justify-center text-xs font-bold mr-2">
                  ✕
                </span>
                Link para RECHAZAR
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={urls.rechazar}
                  readOnly
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono text-gray-700 cursor-pointer hover:bg-gray-100"
                  onClick={() => copyToClipboard(urls.rechazar, 'rechazar')}
                />
                <CopyButton text={urls.rechazar} fieldName="rechazar" />
              </div>
            </div>

            {/* Mensaje de WhatsApp */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <ChatBubbleBottomCenterTextIcon className="w-5 h-5 mr-2 text-success-600" />
                Mensaje Completo para WhatsApp
              </label>
              <div className="space-y-2">
                <textarea
                  value={whatsappMessage}
                  readOnly
                  rows={12}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-700 font-mono cursor-pointer hover:bg-gray-100 resize-none"
                  onClick={() => copyToClipboard(whatsappMessage, 'mensaje')}
                />
                <CopyButton text={whatsappMessage} fieldName="mensaje" />
              </div>
            </div>

            {/* Información adicional */}
            <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
              <p className="text-sm text-warning-800">
                <strong>⏰ Importante:</strong> Los links expiran en 48 horas y solo pueden
                usarse una vez. Después de que el autorizador apruebe o rechace, verás
                el cambio automáticamente en tu panel.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={onClose}
            >
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinksAprobacionModal;

