import React, { useState, useEffect } from 'react';
import { 
  DocumentTextIcon, 
  CalendarDaysIcon, 
  TagIcon,
  ClockIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import Select from '../UI/Select';
import Input from '../UI/Input';
import { useMaestros } from '../../hooks/useMaestros';
import { getDefaultRequerimientoDate } from '../../utils/formatters';
import apiService from '../../services/api';

const InformacionGeneral = ({ formData, onFormChange }) => {
  const [numeroOC, setNumeroOC] = useState('');
  const [aprobadores, setAprobadores] = useState([]);
  const [loadingAprobadores, setLoadingAprobadores] = useState(true);
  const { 
    loading, 
    getCategoriasOptions,
    getTiposOrdenOptions
  } = useMaestros();
  
  // Obtener opciones formateadas desde el hook
  const categoriasOptions = getCategoriasOptions();
  const tiposOrdenOptions = getTiposOrdenOptions();
  
  console.log('🔍 Opciones generadas en InformacionGeneral:', {
    categorias: categoriasOptions.length,
    tiposOrden: tiposOrdenOptions.length,
    loading,
    categoriasSample: categoriasOptions[0]
  });

  useEffect(() => {
    // Generar número de OC desde la base de datos
    const generarNumeroOC = async () => {
      if (!numeroOC) {
        try {
          console.log('📋 Solicitando número de OC desde la base de datos...');
          const response = await apiService.getSiguienteNumeroOC();
          
          if (response.success) {
            const nuevoNumero = response.data.numero;
            console.log(`✅ Número de OC generado: ${nuevoNumero}`);
            setNumeroOC(nuevoNumero);
            onFormChange('numeroOC', nuevoNumero);
          } else {
            console.error('❌ Error al generar número de OC:', response.message);
            // Fallback: usar método local si falla el servidor
            const { generateOCNumber } = require('../../utils/formatters');
            const nuevoNumero = generateOCNumber();
            console.warn('⚠️ Usando número de OC local:', nuevoNumero);
            setNumeroOC(nuevoNumero);
            onFormChange('numeroOC', nuevoNumero);
          }
        } catch (error) {
          console.error('❌ Error conectando con el servidor:', error);
          // Fallback: usar método local si falla el servidor
          const { generateOCNumber } = require('../../utils/formatters');
          const nuevoNumero = generateOCNumber();
          console.warn('⚠️ Usando número de OC local:', nuevoNumero);
          setNumeroOC(nuevoNumero);
          onFormChange('numeroOC', nuevoNumero);
        }
      }
    };

    generarNumeroOC();
    
    // Establecer fecha de requerimiento por defecto solo si no existe
    if (!formData.fechaRequerimiento) {
      const fechaRequerimiento = getDefaultRequerimientoDate();
      onFormChange('fechaRequerimiento', fechaRequerimiento);
    }
  }, [formData.fechaRequerimiento, numeroOC, onFormChange]);

  // Cargar aprobadores
  useEffect(() => {
    const cargarAprobadores = async () => {
      try {
        const response = await apiService.getAprobadores();
        if (response.success) {
          setAprobadores(response.data);
          console.log('👔 Aprobadores cargados:', response.data);
        }
      } catch (error) {
        console.error('Error cargando aprobadores:', error);
      } finally {
        setLoadingAprobadores(false);
      }
    };

    cargarAprobadores();
  }, []);

  // Debug: Log cuando cambie el aprobadorId
  useEffect(() => {
    console.log('🔄 aprobadorId cambió:', formData.aprobadorId);
  }, [formData.aprobadorId]);

  const handleCategoriaChange = (categoria) => {
    onFormChange('categoriaCompra', categoria);
    // Aquí se podría actualizar la lista de proveedores automáticamente
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-accent-600 rounded-lg flex items-center justify-center">
            <DocumentTextIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Información General de la Orden</h3>
            <p className="text-sm text-secondary-600">Datos básicos y configuración de la orden</p>
          </div>
        </div>
      </div>
      
      <div className="card-body space-y-6">
        {/* Número de OC */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Número de Orden de Compra
          </label>
          <Input
            value={numeroOC}
            readOnly
            className="bg-secondary-50 border-secondary-200 font-mono font-semibold"
          />
          <p className="text-xs text-secondary-500 flex items-center">
            <ClockIcon className="w-3 h-3 mr-1" />
            Formato: OC-YYYY-MM-NNN (generado automáticamente)
          </p>
        </div>

        {/* Primera fila */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Input
              label="Fecha de Requerimiento"
              type="date"
              value={formData.fechaRequerimiento || ''}
              onChange={(e) => onFormChange('fechaRequerimiento', e.target.value)}
              required
            />
            <p className="text-xs text-secondary-500 flex items-center">
              <CalendarDaysIcon className="w-3 h-3 mr-1" />
              Fecha en que se necesitan los productos/servicios
            </p>
          </div>
          
          <Select
            label="Categoría de Compra"
            value={formData.categoriaCompra || ''}
            onChange={(value) => handleCategoriaChange(value)}
            options={categoriasOptions}
            placeholder="Seleccione categoría"
            disabled={loading}
            required
          />
        </div>

        {/* Segunda fila */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Select
              label="Tipo de Orden"
              value={formData.tipoOC || 'standard'}
              onChange={(value) => onFormChange('tipoOC', value)}
              options={tiposOrdenOptions}
              disabled={loading}
            />
            <div className="text-xs text-secondary-500 space-y-1">
              <p className="flex items-center">
                <TagIcon className="w-3 h-3 mr-1" />
                <strong>Standard:</strong> Orden única
              </p>
              <p className="ml-4">
                <strong>Blanket:</strong> Orden marco para múltiples entregas
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Estado de la Orden
            </label>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 px-3 py-2 bg-success-50 border border-success-200 rounded-lg">
                <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                <span className="text-sm font-medium text-success-700">Creada</span>
              </div>
              <span className="text-xs text-secondary-500">
                {new Date().toLocaleDateString('es-PE')} - A. Pérez
              </span>
            </div>
          </div>
        </div>

        {/* Tercera fila - Aprobador */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <UserCircleIcon className="w-5 h-5 text-blue-600" />
            <h4 className="text-sm font-semibold text-blue-900">Aprobación Requerida</h4>
          </div>
          
          <Select
            label="¿Quién debe aprobar esta orden? *"
            value={formData.aprobadorId || ''}
            onChange={(value) => {
              console.log('👤 Aprobador seleccionado:', value);
              console.log('👤 Tipo de valor:', typeof value);
              console.log('👤 Valor antes de onFormChange:', formData.aprobadorId);
              
              // Usar setTimeout para asegurar que el estado se actualice
              onFormChange('aprobadorId', value);
              
              // Verificar después de un pequeño delay
              setTimeout(() => {
                console.log('👤 Después de onFormChange (con delay), formData.aprobadorId:', formData.aprobadorId);
              }, 100);
            }}
            options={aprobadores.map(aprobador => ({
              value: aprobador.id.toString(),
              label: `${aprobador.nombre_completo} - ${aprobador.cargo}`
            }))}
            placeholder=""
            disabled={loadingAprobadores}
            required
          />
          
          <p className="text-xs text-blue-700 mt-2">
            ℹ️ Esta persona recibirá el link de WhatsApp para aprobar la orden.
          </p>
        </div>

      </div>
    </div>
  );
};

export default InformacionGeneral;
