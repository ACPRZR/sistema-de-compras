import React from 'react';
import MetricCard from './MetricCard';
import { 
  ChartBarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTrendingUpIcon,
  BuildingOfficeIcon,
  TruckIcon
} from '@heroicons/react/24/outline';

const KPIGrid = ({ data, loading = false }) => {
  if (!data && !loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="col-span-full text-center py-8">
          <p className="text-gray-500">No hay datos disponibles</p>
        </div>
      </div>
    );
  }

  const kpis = [
    {
      title: 'Total de Órdenes',
      value: data?.estadisticas_generales?.total_ordenes || 0,
      format: 'number',
      icon: ChartBarIcon,
      subtitle: 'Órdenes procesadas'
    },
    {
      title: 'Monto Total',
      value: data?.estadisticas_generales?.monto_total || 0,
      format: 'currency',
      icon: CurrencyDollarIcon,
      subtitle: 'Valor total en soles'
    },
    {
      title: 'Monto Promedio',
      value: data?.estadisticas_generales?.monto_promedio || 0,
      format: 'currency',
      icon: ArrowTrendingUpIcon,
      subtitle: 'Por orden'
    },
    {
      title: 'Tiempo Promedio',
      value: data?.estadisticas_generales?.tiempo_promedio_horas || 0,
      format: 'number',
      icon: ClockIcon,
      subtitle: 'Horas por orden'
    }
  ];

  const statusKpis = [
    {
      title: 'Completadas',
      value: data?.ordenes_por_estado?.completadas || 0,
      format: 'number',
      icon: CheckCircleIcon,
      changeType: 'positive',
      subtitle: 'Órdenes finalizadas'
    },
    {
      title: 'Canceladas',
      value: data?.ordenes_por_estado?.canceladas || 0,
      format: 'number',
      icon: XCircleIcon,
      changeType: 'negative',
      subtitle: 'Órdenes canceladas'
    },
    {
      title: 'En Revisión',
      value: data?.ordenes_por_estado?.revision || 0,
      format: 'number',
      icon: ClockIcon,
      changeType: 'neutral',
      subtitle: 'Pendientes de aprobación'
    },
    {
      title: 'Aprobadas',
      value: data?.ordenes_por_estado?.aprobadas || 0,
      format: 'number',
      icon: CheckCircleIcon,
      changeType: 'positive',
      subtitle: 'Listas para envío'
    }
  ];

  return (
    <div className="space-y-8">
      {/* KPIs Principales */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Métricas Generales</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi, index) => (
            <MetricCard
              key={index}
              {...kpi}
              loading={loading}
            />
          ))}
        </div>
      </div>

      {/* KPIs de Estado */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de Órdenes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statusKpis.map((kpi, index) => (
            <MetricCard
              key={index}
              {...kpi}
              loading={loading}
            />
          ))}
        </div>
      </div>

      {/* Porcentajes de Estado */}
      {data?.porcentajes_estado && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Estado</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(data.porcentajes_estado).map(([estado, porcentaje]) => (
              <MetricCard
                key={estado}
                title={estado.charAt(0).toUpperCase() + estado.slice(1)}
                value={parseFloat(porcentaje)}
                format="percentage"
                icon={estado === 'completadas' ? CheckCircleIcon : 
                      estado === 'canceladas' ? XCircleIcon : ClockIcon}
                changeType={estado === 'completadas' ? 'positive' : 
                           estado === 'canceladas' ? 'negative' : 'neutral'}
                subtitle={`${porcentaje}% del total`}
                loading={loading}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default KPIGrid;
