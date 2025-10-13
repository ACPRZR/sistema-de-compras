import React from 'react';
import KPIGrid from '../Metrics/KPIGrid';
import LineChart from '../Charts/LineChart';
import BarChart from '../Charts/BarChart';
import DoughnutChart from '../Charts/DoughnutChart';
import AreaChart from '../Charts/AreaChart';

const Dashboard = ({ data, loading = false }) => {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No hay datos disponibles para el dashboard</p>
      </div>
    );
  }

  // Preparar datos para gráficos
  const tendenciasData = {
    labels: data.tendencias?.map(t => t.mes) || [],
    datasets: [
      {
        label: 'Total de Órdenes',
        data: data.tendencias?.map(t => t.total_ordenes) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      },
      {
        label: 'Monto Total',
        data: data.tendencias?.map(t => t.monto_total) || [],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        yAxisID: 'y1'
      }
    ]
  };

  const tendenciasOptions = {
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Cantidad de Órdenes'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Monto (S/)'
        },
        grid: {
          drawOnChartArea: false,
        },
      }
    }
  };

  const estadoData = {
    labels: ['Completadas', 'Canceladas', 'En Revisión', 'Aprobadas', 'Enviadas', 'Creadas'],
    datasets: [
      {
        data: [
          data.ordenes_por_estado?.completadas || 0,
          data.ordenes_por_estado?.canceladas || 0,
          data.ordenes_por_estado?.revision || 0,
          data.ordenes_por_estado?.aprobadas || 0,
          data.ordenes_por_estado?.enviadas || 0,
          data.ordenes_por_estado?.creadas || 0
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(107, 114, 128, 0.8)'
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(239, 68, 68)',
          'rgb(245, 158, 11)',
          'rgb(59, 130, 246)',
          'rgb(139, 92, 246)',
          'rgb(107, 114, 128)'
        ],
        borderWidth: 2
      }
    ]
  };

  const montosData = {
    labels: ['Completadas', 'Canceladas', 'En Revisión', 'Aprobadas', 'Enviadas', 'Creadas'],
    datasets: [
      {
        label: 'Monto por Estado',
        data: [
          data.montos_por_estado?.completadas || 0,
          data.montos_por_estado?.canceladas || 0,
          data.montos_por_estado?.revision || 0,
          data.montos_por_estado?.aprobadas || 0,
          data.montos_por_estado?.enviadas || 0,
          data.montos_por_estado?.creadas || 0
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(107, 114, 128, 0.8)'
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(239, 68, 68)',
          'rgb(245, 158, 11)',
          'rgb(59, 130, 246)',
          'rgb(139, 92, 246)',
          'rgb(107, 114, 128)'
        ],
        borderWidth: 2
      }
    ]
  };

  return (
    <div className="space-y-8">
      {/* KPIs Principales */}
      <KPIGrid data={data} loading={loading} />

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tendencias Temporales */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Tendencias Temporales
          </h3>
          <LineChart 
            data={tendenciasData} 
            height={300}
            showLegend={true}
          />
        </div>

        {/* Distribución por Estado */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Distribución por Estado
          </h3>
          <DoughnutChart 
            data={estadoData} 
            height={300}
            showLegend={true}
            showPercentage={true}
          />
        </div>
      </div>

      {/* Gráfico de Montos por Estado */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Montos por Estado
        </h3>
        <BarChart 
          data={montosData} 
          height={400}
          showLegend={false}
        />
      </div>

      {/* Métricas Temporales */}
      {data.metricas_temporales && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Actividad Reciente
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Última Semana</span>
                <span className="text-lg font-semibold text-gray-900">
                  {data.metricas_temporales.ultima_semana || 0} órdenes
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Último Mes</span>
                <span className="text-lg font-semibold text-gray-900">
                  {data.metricas_temporales.ultimo_mes || 0} órdenes
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Resumen Ejecutivo
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total de Órdenes</span>
                <span className="text-lg font-semibold text-gray-900">
                  {data.estadisticas_generales?.total_ordenes || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Monto Total</span>
                <span className="text-lg font-semibold text-gray-900">
                  {new Intl.NumberFormat('es-ES', {
                    style: 'currency',
                    currency: 'PEN'
                  }).format(data.estadisticas_generales?.monto_total || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
