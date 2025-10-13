import React, { useState, useEffect } from 'react';
import { 
  FunnelIcon, 
  XMarkIcon,
  CalendarDaysIcon,
  BuildingOfficeIcon,
  TagIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import { format, subDays, subMonths, subYears } from 'date-fns';
import { es } from 'date-fns/locale';

const ReportFilters = ({ 
  filtros, 
  onFiltrosChange, 
  onLimpiarFiltros,
  isOpen,
  onToggle,
  categorias = [],
  proveedores = [],
  unidadesNegocio = [],
  estados = []
}) => {
  const [filtrosLocales, setFiltrosLocales] = useState(filtros);

  useEffect(() => {
    setFiltrosLocales(filtros);
  }, [filtros]);

  const handleChange = (campo, valor) => {
    const nuevosFiltros = { ...filtrosLocales, [campo]: valor };
    setFiltrosLocales(nuevosFiltros);
    onFiltrosChange(nuevosFiltros);
  };

  const handleLimpiar = () => {
    const filtrosLimpios = {
      fecha_inicio: '',
      fecha_fin: '',
      categoria_id: '',
      proveedor_id: '',
      estado_id: '',
      unidad_negocio_id: '',
      tipo_periodo: 'mensual',
      tipo_analisis: 'volumen',
      limite: 10
    };
    setFiltrosLocales(filtrosLimpios);
    onLimpiarFiltros();
  };

  const presetsFechas = [
    {
      label: 'Últimos 7 días',
      getValue: () => ({
        fecha_inicio: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
        fecha_fin: format(new Date(), 'yyyy-MM-dd')
      })
    },
    {
      label: 'Últimos 30 días',
      getValue: () => ({
        fecha_inicio: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
        fecha_fin: format(new Date(), 'yyyy-MM-dd')
      })
    },
    {
      label: 'Últimos 3 meses',
      getValue: () => ({
        fecha_inicio: format(subMonths(new Date(), 3), 'yyyy-MM-dd'),
        fecha_fin: format(new Date(), 'yyyy-MM-dd')
      })
    },
    {
      label: 'Último año',
      getValue: () => ({
        fecha_inicio: format(subYears(new Date(), 1), 'yyyy-MM-dd'),
        fecha_fin: format(new Date(), 'yyyy-MM-dd')
      })
    }
  ];

  const aplicarPreset = (preset) => {
    const valores = preset.getValue();
    handleChange('fecha_inicio', valores.fecha_inicio);
    handleChange('fecha_fin', valores.fecha_fin);
  };

  const tieneFiltrosActivos = Object.values(filtrosLocales).some(valor => 
    valor !== '' && valor !== 'mensual' && valor !== 'volumen' && valor !== 10
  );

  if (!isOpen) {
    return (
      <div className="mb-6">
        <button
          onClick={onToggle}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FunnelIcon className="w-4 h-4 mr-2" />
          Filtros
          {tieneFiltrosActivos && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Activos
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Filtros de Reporte</h3>
        <div className="flex items-center space-x-2">
          {tieneFiltrosActivos && (
            <button
              onClick={handleLimpiar}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Limpiar filtros
            </button>
          )}
          <button
            onClick={onToggle}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Presets de Fechas */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Rango Rápido
          </label>
          <div className="space-y-1">
            {presetsFechas.map((preset, index) => (
              <button
                key={index}
                onClick={() => aplicarPreset(preset)}
                className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Fecha Inicio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha Inicio
          </label>
          <input
            type="date"
            value={filtrosLocales.fecha_inicio}
            onChange={(e) => handleChange('fecha_inicio', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Fecha Fin */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha Fin
          </label>
          <input
            type="date"
            value={filtrosLocales.fecha_fin}
            onChange={(e) => handleChange('fecha_fin', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoría
          </label>
          <select
            value={filtrosLocales.categoria_id}
            onChange={(value) => handleChange('categoria_id', value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todas las categorías</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Proveedor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Proveedor
          </label>
          <select
            value={filtrosLocales.proveedor_id}
            onChange={(value) => handleChange('proveedor_id', value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos los proveedores</option>
            {proveedores.map((proveedor) => (
              <option key={proveedor.id} value={proveedor.id}>
                {proveedor.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            value={filtrosLocales.estado_id}
            onChange={(value) => handleChange('estado_id', value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos los estados</option>
            {estados.map((estado) => (
              <option key={estado.id} value={estado.id}>
                {estado.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Unidad de Negocio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unidad de Negocio
          </label>
          <select
            value={filtrosLocales.unidad_negocio_id}
            onChange={(value) => handleChange('unidad_negocio_id', value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todas las unidades</option>
            {unidadesNegocio.map((unidad) => (
              <option key={unidad.id} value={unidad.id}>
                {unidad.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Tipo de Período */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Período
          </label>
          <select
            value={filtrosLocales.tipo_periodo}
            onChange={(value) => handleChange('tipo_periodo', value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="mensual">Mensual</option>
            <option value="trimestral">Trimestral</option>
            <option value="anual">Anual</option>
          </select>
        </div>

        {/* Tipo de Análisis */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Análisis
          </label>
          <select
            value={filtrosLocales.tipo_analisis}
            onChange={(value) => handleChange('tipo_analisis', value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="volumen">Por Volumen</option>
            <option value="monto">Por Monto</option>
            <option value="rendimiento">Por Rendimiento</option>
          </select>
        </div>

        {/* Límite */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Límite de Resultados
          </label>
          <select
            value={filtrosLocales.limite}
            onChange={(e) => handleChange('limite', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={5}>Top 5</option>
            <option value={10}>Top 10</option>
            <option value={20}>Top 20</option>
            <option value={50}>Top 50</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ReportFilters;
