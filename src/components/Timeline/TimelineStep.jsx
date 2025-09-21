import React from 'react';
import { 
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const TimelineStep = ({ 
  estado, 
  data, 
  isActive, 
  isCompleted, 
  isNext, 
  isLast = false 
}) => {
  const getEstadoConfig = (estado) => {
    const configs = {
      creada: {
        icon: CheckCircleIcon,
        label: 'Creada',
        color: 'success',
        bgColor: 'bg-success-500',
        textColor: 'text-success-600',
        borderColor: 'border-success-500'
      },
      lista: {
        icon: CheckCircleIcon,
        label: 'Lista',
        color: 'primary',
        bgColor: 'bg-primary-500',
        textColor: 'text-primary-600',
        borderColor: 'border-primary-500'
      },
      completada: {
        icon: CheckCircleIcon,
        label: 'Completada',
        color: 'accent',
        bgColor: 'bg-accent-500',
        textColor: 'text-accent-600',
        borderColor: 'border-accent-500'
      }
    };
    return configs[estado] || configs.creada;
  };

  const config = getEstadoConfig(estado);
  const Icon = config.icon;

  // Determinar el estado visual del paso
  let stepClasses = '';
  let iconClasses = '';
  let textClasses = '';

  if (isCompleted) {
    stepClasses = `bg-white border-2 ${config.borderColor} shadow-glow`;
    iconClasses = `w-6 h-6 text-white ${config.bgColor}`;
    textClasses = `font-semibold ${config.textColor}`;
  } else if (isActive) {
    stepClasses = `bg-white border-2 ${config.borderColor} shadow-medium`;
    iconClasses = `w-6 h-6 text-white ${config.bgColor}`;
    textClasses = `font-semibold ${config.textColor}`;
  } else if (isNext) {
    stepClasses = 'bg-white border-2 border-warning-300 shadow-soft';
    iconClasses = 'w-6 h-6 text-white bg-warning-500';
    textClasses = 'font-medium text-warning-600';
  } else {
    stepClasses = 'bg-white border-2 border-secondary-200';
    iconClasses = 'w-6 h-6 text-secondary-400 bg-secondary-200';
    textClasses = 'font-medium text-secondary-500';
  }

  return (
    <div className="flex flex-col items-center relative">
      {/* Línea conectora */}
      {!isLast && (
        <div className={`absolute top-6 left-1/2 w-full h-0.5 ${
          isCompleted ? 'bg-success-500' : 
          isActive ? 'bg-primary-500' : 
          'bg-secondary-200'
        }`} style={{ transform: 'translateX(50%)' }} />
      )}

      {/* Círculo del paso */}
      <div className={`relative z-10 w-12 h-12 rounded-full ${stepClasses} flex items-center justify-center transition-all duration-300`}>
        <Icon className={iconClasses} />
      </div>

      {/* Información del paso */}
      <div className="mt-3 text-center min-w-[120px]">
        <p className={`text-sm ${textClasses}`}>
          {config.label}
        </p>
        
        {data?.fecha && (
          <p className="text-xs text-secondary-500 mt-1">
            {data.fecha}
          </p>
        )}
        
        {data?.responsable && (
          <p className="text-xs font-medium text-secondary-600 mt-1">
            {data.responsable}
          </p>
        )}
      </div>

      {/* Indicador de progreso */}
      {isActive && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        </div>
      )}
    </div>
  );
};

export default TimelineStep;
