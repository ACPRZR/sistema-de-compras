import React, { useState, useEffect } from 'react';
import { useReportes } from '../../hooks/useReportes';
import apiService from '../../services/api';
import ReportFilters from './Filters/ReportFilters';
import ExportButtons from './Export/ExportButtons';
import Dashboard from './Dashboard/Dashboard';
import ReportTable from './Tables/ReportTable';
import LineChart from './Charts/LineChart';
import BarChart from './Charts/BarChart';
import DoughnutChart from './Charts/DoughnutChart';
import { 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  BuildingOfficeIcon,
  TruckIcon,
  TagIcon,
  BoltIcon,
  DocumentTextIcon,
  ChartPieIcon
} from '@heroicons/react/24/outline';

const Reportes = () => {
  const {
    loading,
    error,
    data,
    filtros,
    vistaActual,
    filtrosAbiertos,
    exportando,
    actualizarFiltros,
    limpiarFiltros,
    cambiarVista,
    exportarPDF,
    exportarExcel,
    setFiltrosAbiertos,
    limpiarError
  } = useReportes();

  const [datosMaestros, setDatosMaestros] = useState({
    categorias: [],
    proveedores: [],
    unidadesNegocio: [],
    estados: []
  });

  // Cargar datos maestros
  useEffect(() => {
    const cargarDatosMaestros = async () => {
      try {
        const [categoriasRes, proveedoresRes, estadosRes] = await Promise.all([
          apiService.getCategorias(),
          apiService.getProveedores(),
          apiService.getEstadosOrden()
        ]);

        setDatosMaestros({
          categorias: categoriasRes.data || [],
          proveedores: proveedoresRes.data || [],
          unidadesNegocio: [], // TODO: Implementar endpoint
          estados: estadosRes.data || []
        });
      } catch (err) {
        console.error('Error cargando datos maestros:', err);
      }
    };

    cargarDatosMaestros();
  }, []);

  const vistas = [
    {
      id: 'dashboard',
      nombre: 'Dashboard',
      icono: ChartBarIcon,
      descripcion: 'Vista general del sistema'
    },
    {
      id: 'tendencias',
      nombre: 'Tendencias',
      icono: ArrowTrendingUpIcon,
      descripcion: 'Análisis temporal'
    },
    {
      id: 'categorias',
      nombre: 'Categorías',
      icono: TagIcon,
      descripcion: 'Análisis por categorías'
    },
    {
      id: 'proveedores',
      nombre: 'Proveedores',
      icono: BuildingOfficeIcon,
      descripcion: 'Análisis por proveedores'
    },
    {
      id: 'unidades',
      nombre: 'Unidades de Negocio',
      icono: TruckIcon,
      descripcion: 'Análisis por unidades'
    },
    {
      id: 'eficiencia',
      nombre: 'Eficiencia',
      icono: BoltIcon,
      descripcion: 'Métricas de rendimiento'
    },
    {
      id: 'resumen',
      nombre: 'Resumen Ejecutivo',
      icono: DocumentTextIcon,
      descripcion: 'Vista consolidada'
    },
    {
      id: 'proyecciones',
      nombre: 'Proyecciones',
      icono: ChartPieIcon,
      descripcion: 'Análisis predictivo'
    }
  ];

  const renderVista = () => {
    switch (vistaActual) {
      case 'dashboard':
        return <Dashboard data={data.dashboard} loading={loading} />;
      
      case 'tendencias':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Tendencias Temporales
              </h3>
              <LineChart 
                data={{
                  labels: data.tendencias?.map(t => t.mes) || [],
                  datasets: [
                    {
                      label: 'Total de Órdenes',
                      data: data.tendencias?.map(t => t.total_ordenes) || [],
                      borderColor: 'rgb(59, 130, 246)',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      tension: 0.4
                    }
                  ]
                }}
                height={400}
              />
            </div>
          </div>
        );
      
      case 'categorias':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Top Categorías por Volumen
              </h3>
              <BarChart 
                data={{
                  labels: data.categorias?.map(c => c.nombre) || [],
                  datasets: [
                    {
                      label: 'Total de Órdenes',
                      data: data.categorias?.map(c => c.total_ordenes) || [],
                      backgroundColor: 'rgba(59, 130, 246, 0.8)',
                      borderColor: 'rgb(59, 130, 246)',
                      borderWidth: 2
                    }
                  ]
                }}
                height={400}
              />
            </div>
            
            <ReportTable
              data={data.categorias}
              columns={[
                {
                  accessorKey: 'nombre',
                  header: 'Categoría'
                },
                {
                  accessorKey: 'total_ordenes',
                  header: 'Total Órdenes',
                  cell: ({ getValue }) => new Intl.NumberFormat('es-ES').format(getValue())
                },
                {
                  accessorKey: 'monto_total',
                  header: 'Monto Total',
                  cell: ({ getValue }) => new Intl.NumberFormat('es-ES', {
                    style: 'currency',
                    currency: 'PEN'
                  }).format(getValue())
                }
              ]}
              title="Detalle de Categorías"
              loading={loading}
            />
          </div>
        );
      
      case 'proveedores':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Top Proveedores por Volumen
              </h3>
              <BarChart 
                data={{
                  labels: data.proveedores?.map(p => p.nombre) || [],
                  datasets: [
                    {
                      label: 'Total de Órdenes',
                      data: data.proveedores?.map(p => p.total_ordenes) || [],
                      backgroundColor: 'rgba(16, 185, 129, 0.8)',
                      borderColor: 'rgb(16, 185, 129)',
                      borderWidth: 2
                    }
                  ]
                }}
                height={400}
              />
            </div>
            
            <ReportTable
              data={data.proveedores}
              columns={[
                {
                  accessorKey: 'nombre',
                  header: 'Proveedor'
                },
                {
                  accessorKey: 'total_ordenes',
                  header: 'Total Órdenes',
                  cell: ({ getValue }) => new Intl.NumberFormat('es-ES').format(getValue())
                },
                {
                  accessorKey: 'monto_total',
                  header: 'Monto Total',
                  cell: ({ getValue }) => new Intl.NumberFormat('es-ES', {
                    style: 'currency',
                    currency: 'PEN'
                  }).format(getValue())
                }
              ]}
              title="Detalle de Proveedores"
              loading={loading}
            />
          </div>
        );
      
      case 'unidades':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Análisis por Unidades de Negocio
              </h3>
              <DoughnutChart 
                data={{
                  labels: data.unidadesNegocio?.map(u => u.nombre) || [],
                  datasets: [
                    {
                      data: data.unidadesNegocio?.map(u => u.total_ordenes) || [],
                      backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(139, 92, 246, 0.8)'
                      ],
                      borderColor: [
                        'rgb(59, 130, 246)',
                        'rgb(16, 185, 129)',
                        'rgb(245, 158, 11)',
                        'rgb(239, 68, 68)',
                        'rgb(139, 92, 246)'
                      ],
                      borderWidth: 2
                    }
                  ]
                }}
                height={400}
                showPercentage={true}
              />
            </div>
            
            <ReportTable
              data={data.unidadesNegocio}
              columns={[
                {
                  accessorKey: 'nombre',
                  header: 'Unidad de Negocio'
                },
                {
                  accessorKey: 'total_ordenes',
                  header: 'Total Órdenes',
                  cell: ({ getValue }) => new Intl.NumberFormat('es-ES').format(getValue())
                },
                {
                  accessorKey: 'monto_total',
                  header: 'Monto Total',
                  cell: ({ getValue }) => new Intl.NumberFormat('es-ES', {
                    style: 'currency',
                    currency: 'PEN'
                  }).format(getValue())
                }
              ]}
              title="Detalle de Unidades de Negocio"
              loading={loading}
            />
          </div>
        );
      
      case 'eficiencia':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Total de Órdenes</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {data.eficiencia?.total_ordenes || 0}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Completadas</h3>
                <p className="text-3xl font-bold text-green-600">
                  {data.eficiencia?.ordenes_completadas || 0}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Canceladas</h3>
                <p className="text-3xl font-bold text-red-600">
                  {data.eficiencia?.ordenes_canceladas || 0}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Tasa de Completado</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {data.eficiencia?.tasa_completadas || 0}%
                </p>
              </div>
            </div>
          </div>
        );
      
      case 'resumen':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Resumen Ejecutivo
              </h3>
              <p className="text-gray-600">
                Vista consolidada de todos los indicadores principales del sistema.
              </p>
            </div>
          </div>
        );
      
      case 'proyecciones':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Proyecciones Futuras
              </h3>
              <p className="text-gray-600">
                Análisis predictivo basado en tendencias históricas.
              </p>
            </div>
          </div>
        );
      
      default:
        return <Dashboard data={data.dashboard} loading={loading} />;
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error al cargar reportes
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={limpiarError}
                    className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reportes y Análisis</h1>
          <p className="mt-2 text-gray-600">
            Visualiza y analiza el rendimiento del sistema de órdenes de compra
          </p>
        </div>

        {/* Filtros */}
        <ReportFilters
          filtros={filtros}
          onFiltrosChange={actualizarFiltros}
          onLimpiarFiltros={limpiarFiltros}
          isOpen={filtrosAbiertos}
          onToggle={() => setFiltrosAbiertos(!filtrosAbiertos)}
          categorias={datosMaestros.categorias}
          proveedores={datosMaestros.proveedores}
          unidadesNegocio={datosMaestros.unidadesNegocio}
          estados={datosMaestros.estados}
        />

        {/* Navegación de Vistas */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {vistas.map((vista) => (
              <button
                key={vista.id}
                onClick={() => cambiarVista(vista.id)}
                className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  vistaActual === vista.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <vista.icono className="w-4 h-4 mr-2" />
                {vista.nombre}
              </button>
            ))}
          </div>
        </div>

        {/* Botones de Exportación */}
        <div className="mb-6 flex justify-end">
          <ExportButtons
            onExportPDF={() => exportarPDF(vistaActual)}
            onExportExcel={() => exportarExcel(vistaActual)}
            onPrint={() => window.print()}
            loading={exportando}
          />
        </div>

        {/* Contenido Principal */}
        <div id={`reporte-${vistaActual}`}>
          {renderVista()}
        </div>
      </div>
    </div>
  );
};

export default Reportes;
