import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  BuildingStorefrontIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import apiService from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';

/**
 * Página pública para aprobar/rechazar una orden
 * Accesible sin autenticación mediante token único
 */
const AprobarOrden = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [orden, setOrden] = useState(null);
  const [error, setError] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [procesado, setProcesado] = useState(false);
  const [resultado, setResultado] = useState(null);
  
  // Modal PIN
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [validandoPin, setValidandoPin] = useState(false);
  
  // Formulario
  const [observaciones, setObservaciones] = useState('');
  const [motivo, setMotivo] = useState('');
  const [accion, setAccion] = useState(null); // 'aprobar' o 'rechazar'

  useEffect(() => {
    cargarOrden();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const cargarOrden = async () => {
    try {
      setLoading(true);
      const response = await apiService.getOrdenByToken(token);
      
      if (response.success) {
        setOrden(response.data.orden);
      } else {
        setError({
          tipo: response.error,
          mensaje: response.message
        });
      }
    } catch (err) {
      setError({
        tipo: 'ERROR_CONEXION',
        mensaje: 'No se pudo conectar con el servidor'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClickAccion = (tipoAccion) => {
    if (tipoAccion === 'rechazar' && !motivo.trim()) {
      alert('Por favor indica el motivo del rechazo');
      return;
    }
    
    setAccion(tipoAccion);
    setShowPinModal(true);
    setPin('');
  };

  const handleValidarPin = async () => {
    if (!pin || pin.length !== 4) {
      alert('Por favor ingresa tu PIN de 4 dígitos');
      return;
    }

    setValidandoPin(true);
    try {
      const response = await apiService.validarPinAprobacion(token, pin);
      
      if (response.success) {
        setShowPinModal(false);
        await procesarAccion(response.data.aprobador);
      } else {
        alert('PIN incorrecto. Por favor intenta de nuevo.');
        setPin('');
      }
    } catch (err) {
      alert('Error al validar PIN: ' + err.message);
      setPin('');
    } finally {
      setValidandoPin(false);
    }
  };

  const procesarAccion = async (aprobador) => {
    console.log('🚀 Procesando', accion);
    console.log('🔗 Token:', token);
    console.log('👤 Aprobador:', aprobador.nombre_completo);
    
    setProcesando(true);
    try {
      const data = {
        nombre: aprobador.nombre_completo,
        ...(accion === 'aprobar' 
          ? { observaciones: observaciones.trim() }
          : { motivo: motivo.trim() }
        )
      };

      console.log('📦 Datos a enviar:', data);

      const response = accion === 'aprobar'
        ? await apiService.aprobarOrden(token, data)
        : await apiService.rechazarOrden(token, data);

      console.log('📥 Respuesta recibida:', response);

      if (response.success) {
        setProcesado(true);
        setResultado({
          tipo: accion,
          aprobador: aprobador,
          ...response.data
        });
      } else {
        console.error('❌ Error en respuesta:', response);
        alert(response.message || 'Error al procesar la orden');
        setProcesando(false);
      }
    } catch (err) {
      console.error('❌ Error capturado:', err);
      console.error('❌ Stack:', err.stack);
      alert('Error al procesar la orden: ' + err.message);
      setProcesando(false);
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando orden...</p>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-danger-50 to-warning-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ExclamationTriangleIcon className="w-8 h-8 text-danger-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {error.tipo === 'TOKEN_USADO' && 'Link Ya Utilizado'}
              {error.tipo === 'TOKEN_EXPIRADO' && 'Link Expirado'}
              {error.tipo === 'ORDEN_PROCESADA' && 'Orden Ya Procesada'}
              {error.tipo === 'TOKEN_INVALIDO' && 'Link Inválido'}
              {!['TOKEN_USADO', 'TOKEN_EXPIRADO', 'ORDEN_PROCESADA', 'TOKEN_INVALIDO'].includes(error.tipo) && 'Error'}
            </h2>
            <p className="text-gray-600">
              {error.mensaje}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Procesado exitosamente
  if (procesado && resultado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-success-50 to-primary-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className={`w-16 h-16 ${resultado.tipo === 'aprobar' ? 'bg-success-100' : 'bg-danger-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
              {resultado.tipo === 'aprobar' ? (
                <CheckCircleIcon className="w-10 h-10 text-success-600" />
              ) : (
                <XCircleIcon className="w-10 h-10 text-danger-600" />
              )}
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {resultado.tipo === 'aprobar' ? '¡Orden Aprobada!' : 'Orden Rechazada'}
            </h2>
            
            <p className="text-gray-600 mb-6">
              La orden <strong>{resultado.numero_oc}</strong> ha sido{' '}
              {resultado.tipo === 'aprobar' ? 'aprobada' : 'rechazada'} exitosamente.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-gray-600 mb-1">
                {resultado.tipo === 'aprobar' ? 'Aprobada por:' : 'Rechazada por:'}
              </p>
              <p className="font-medium text-gray-900">{resultado.aprobada_por || resultado.rechazada_por}</p>
              
              <p className="text-sm text-gray-600 mt-3 mb-1">Fecha:</p>
              <p className="font-medium text-gray-900">
                {formatDate(resultado.aprobada_fecha || resultado.rechazada_fecha)}
              </p>

              {resultado.motivo && (
                <>
                  <p className="text-sm text-gray-600 mt-3 mb-1">Motivo:</p>
                  <p className="font-medium text-gray-900">{resultado.motivo}</p>
                </>
              )}
            </div>

            <p className="text-sm text-gray-500">
              El encargado de logística será notificado automáticamente.
              Puedes cerrar esta página.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Formulario de aprobación/rechazo
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-8 text-white text-center">
            <h1 className="text-3xl font-bold mb-2">Las Asambleas de Dios del Perú</h1>
            <p className="text-primary-100">Sistema de Órdenes de Compra</p>
          </div>
        </div>

        {/* Información de la orden */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Orden de Compra</h2>
              <p className="text-lg text-primary-600 font-semibold">{orden.numero_oc}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Estado</p>
              <span className="inline-block px-3 py-1 bg-warning-100 text-warning-800 rounded-full text-sm font-medium">
                Pendiente de Aprobación
              </span>
            </div>
          </div>

          {/* Detalles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <div className="flex items-start space-x-3 mb-4">
                <BuildingStorefrontIcon className="w-5 h-5 text-primary-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Proveedor</p>
                  <p className="font-semibold text-gray-900">{orden.proveedor.nombre}</p>
                  {orden.proveedor.ruc && (
                    <p className="text-sm text-gray-500">RUC: {orden.proveedor.ruc}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <ClockIcon className="w-5 h-5 text-primary-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Fecha Requerida</p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(orden.fecha_requerimiento)}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-start space-x-3 mb-4">
                <CurrencyDollarIcon className="w-5 h-5 text-success-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-success-600">
                    {formatCurrency(orden.total)}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <DocumentTextIcon className="w-5 h-5 text-primary-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Categoría</p>
                  <p className="font-semibold text-gray-900">{orden.categoria}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          {orden.items && orden.items.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Items Solicitados</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Descripción
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Cantidad
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Precio Unit.
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orden.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.descripcion}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">
                          {item.cantidad} {item.unidad}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">
                          {formatCurrency(item.precio_unitario)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                          {formatCurrency(item.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Formulario */}
        {!accion ? (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              ¿Qué acción deseas realizar?
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setAccion('aprobar')}
                className="flex items-center justify-center space-x-3 px-6 py-4 bg-success-600 hover:bg-success-700 text-white rounded-lg font-semibold transition-colors"
              >
                <CheckIcon className="w-6 h-6" />
                <span>APROBAR ESTA ORDEN</span>
              </button>

              <button
                onClick={() => setAccion('rechazar')}
                className="flex items-center justify-center space-x-3 px-6 py-4 bg-danger-600 hover:bg-danger-700 text-white rounded-lg font-semibold transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
                <span>RECHAZAR ESTA ORDEN</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {accion === 'aprobar' ? 'Aprobar Orden' : 'Rechazar Orden'}
            </h3>

            <div className="space-y-4">
              {accion === 'aprobar' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observaciones (opcional)
                  </label>
                  <textarea
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Comentarios adicionales..."
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motivo del Rechazo <span className="text-danger-600">*</span>
                  </label>
                  <textarea
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Por favor indica por qué rechazas esta orden..."
                    required
                  />
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => handleClickAccion(accion)}
                  disabled={procesando}
                  className={`flex-1 px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
                    accion === 'aprobar'
                      ? 'bg-success-600 hover:bg-success-700'
                      : 'bg-danger-600 hover:bg-danger-700'
                  } ${procesando ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {procesando ? 'Procesando...' : `Confirmar ${accion === 'aprobar' ? 'Aprobación' : 'Rechazo'}`}
                </button>

                <button
                  onClick={() => setAccion(null)}
                  disabled={procesando}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal PIN */}
        {showPinModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🔒 Autenticación Requerida
              </h3>
              
              <p className="text-sm text-gray-600 mb-4">
                Para {accion === 'aprobar' ? 'aprobar' : 'rechazar'} esta orden, ingresa tu PIN de seguridad de 4 dígitos.
              </p>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PIN de Aprobación <span className="text-danger-600">*</span>
                </label>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  onKeyPress={(e) => e.key === 'Enter' && handleValidarPin()}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-center text-2xl tracking-widest font-mono focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="••••"
                  maxLength={4}
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-2">
                  Este PIN fue asignado por el administrador del sistema
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleValidarPin}
                  disabled={validandoPin || pin.length !== 4}
                  className={`flex-1 px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
                    validandoPin || pin.length !== 4
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-primary-600 hover:bg-primary-700'
                  }`}
                >
                  {validandoPin ? 'Validando...' : 'Confirmar'}
                </button>

                <button
                  onClick={() => {
                    setShowPinModal(false);
                    setPin('');
                  }}
                  disabled={validandoPin}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AprobarOrden;

