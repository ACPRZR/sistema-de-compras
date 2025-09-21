import React from 'react';
import { 
  ChartBarIcon, 
  ArrowRightIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import TimelineStep from './TimelineStep';
import Button from '../UI/Button';
import { useTimeline } from '../../hooks/useTimeline';

const Timeline = () => {
  const {
    estadoActual,
    timelineData,
    estados,
    estadoActualIndex,
    siguienteEstado,
    progreso,
    avanzarEstado,
    reiniciarTimeline
  } = useTimeline();

  const handleAvanzarEstado = async (nuevoEstado) => {
    try {
      await avanzarEstado(nuevoEstado);
    } catch (error) {
      alert(error.message);
    }
  };

  const getBotonConfig = (estado) => {
    const configs = {
      lista: {
        label: 'Marcar como Lista',
        variant: 'success',
        icon: ArrowRightIcon
      },
      completada: {
        label: 'Completar Orden',
        variant: 'accent',
        icon: ArrowRightIcon
      }
    };
    return configs[estado] || {};
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-accent-600 rounded-lg flex items-center justify-center">
            <ChartBarIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Estado de la Orden</h3>
            <p className="text-sm text-secondary-600">Timeline de progreso y aprobaciones</p>
          </div>
        </div>
      </div>
      
      <div className="card-body space-y-6">
        {/* Barra de progreso */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-gray-700">Progreso General</span>
            <span className="text-secondary-600">{Math.round(progreso)}%</span>
          </div>
          <div className="w-full bg-secondary-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-success-500 via-primary-500 to-accent-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progreso}%` }}
            />
          </div>
        </div>

        {/* Timeline visual */}
        <div className="relative">
          <div className="flex justify-between items-start">
            {estados.map((estado, index) => {
              const data = timelineData[estado];
              const isActive = estado === estadoActual;
              const isCompleted = data?.completado || false;
              const isNext = index === estadoActualIndex + 1;
              const isLast = index === estados.length - 1;

              return (
                <TimelineStep
                  key={estado}
                  estado={estado}
                  data={data}
                  isActive={isActive}
                  isCompleted={isCompleted}
                  isNext={isNext}
                  isLast={isLast}
                />
              );
            })}
          </div>
        </div>

        {/* Información del estado actual */}
        <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-lg p-4 border border-primary-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {estadoActualIndex + 1}
              </span>
            </div>
            <div>
              <h4 className="font-medium text-primary-900">
                Estado Actual: {timelineData[estadoActual]?.label || estadoActual}
              </h4>
              <p className="text-sm text-primary-700">
                {timelineData[estadoActual]?.completado 
                  ? `Completado el ${timelineData[estadoActual].fecha} por ${timelineData[estadoActual].responsable}`
                  : `Pendiente de completar`
                }
              </p>
            </div>
          </div>
        </div>

        {/* Controles de timeline */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {siguienteEstado && (
              <Button
                {...getBotonConfig(siguienteEstado)}
                onClick={() => handleAvanzarEstado(siguienteEstado)}
                size="sm"
              >
                {getBotonConfig(siguienteEstado).label}
              </Button>
            )}
            
          </div>

          {/* Botón de reinicio */}
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (window.confirm('¿Está seguro de reiniciar el timeline? Esto borrará todo el progreso.')) {
                  reiniciarTimeline();
                }
              }}
              icon={ArrowPathIcon}
            >
              Reiniciar Timeline
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Timeline;
