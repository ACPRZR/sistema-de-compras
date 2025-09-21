import { useState, useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';

/**
 * Hook para manejar el timeline de estados de la orden
 */
export const useTimeline = () => {
  const [estadoActual, setEstadoActual] = useState('creada');
  const [timelineData, setTimelineData] = useLocalStorage('timeline_data', {
    creada: { 
      fecha: new Date().toLocaleString('es-PE'), 
      responsable: 'A. Pérez', 
      completado: true 
    },
    revision: { 
      fecha: null, 
      responsable: 'Supervisor', 
      completado: false 
    },
    aprobada: { 
      fecha: null, 
      responsable: 'A Definir', 
      completado: false 
    },
    enviada: { 
      fecha: null, 
      responsable: 'Logística', 
      completado: false 
    },
    completada: { 
      fecha: null, 
      responsable: 'Proveedor', 
      completado: false 
    }
  });

  const estados = useMemo(() => ['creada', 'revision', 'aprobada', 'enviada', 'completada'], []);

  // Obtener índice del estado actual
  const estadoActualIndex = useMemo(() => {
    return estados.indexOf(estadoActual);
  }, [estadoActual, estados]);

  // Obtener siguiente estado
  const siguienteEstado = useMemo(() => {
    const nextIndex = estadoActualIndex + 1;
    return nextIndex < estados.length ? estados[nextIndex] : null;
  }, [estadoActualIndex, estados]);

  // Avanzar al siguiente estado
  const avanzarEstado = useCallback((nuevoEstado) => {
    const estadoIndex = estados.indexOf(nuevoEstado);
    const estadoActualIndex = estados.indexOf(estadoActual);
    
    if (estadoIndex <= estadoActualIndex) {
      throw new Error('No se puede retroceder en el timeline');
    }
    
    // Completar todos los estados hasta el nuevo estado
    const newTimelineData = { ...timelineData };
    for (let i = 0; i <= estadoIndex; i++) {
      const estado = estados[i];
      if (!newTimelineData[estado].completado) {
        newTimelineData[estado] = {
          ...newTimelineData[estado],
          fecha: new Date().toLocaleString('es-PE'),
          completado: true
        };
        
        // Definir responsable automáticamente según el estado
        if (estado === 'aprobada') {
          newTimelineData[estado].responsable = 'Supervisor';
        }
      }
    }
    
    setTimelineData(newTimelineData);
    setEstadoActual(nuevoEstado);
  }, [estadoActual, timelineData, setTimelineData, estados]);

  // Reiniciar timeline
  const reiniciarTimeline = useCallback(() => {
    const newTimelineData = {
      creada: { 
        fecha: new Date().toLocaleString('es-PE'), 
        responsable: 'A. Pérez', 
        completado: true 
      },
      revision: { 
        fecha: null, 
        responsable: 'Supervisor', 
        completado: false 
      },
      aprobada: { 
        fecha: null, 
        responsable: 'A Definir', 
        completado: false 
      },
      enviada: { 
        fecha: null, 
        responsable: 'Logística', 
        completado: false 
      },
      completada: { 
        fecha: null, 
        responsable: 'Proveedor', 
        completado: false 
      }
    };
    
    setTimelineData(newTimelineData);
    setEstadoActual('creada');
  }, [setTimelineData]);

  // Actualizar responsable del comprador
  const actualizarComprador = useCallback((comprador) => {
    const nombreComprador = {
      'alvaro_perez': 'A. Pérez',
      'maria_garcia': 'M. García', 
      'carlos_lopez': 'C. López',
      'ana_rodriguez': 'A. Rodríguez'
    }[comprador] || 'Comprador';
    
    setTimelineData(prev => ({
      ...prev,
      creada: {
        ...prev.creada,
        responsable: nombreComprador
      }
    }));
  }, [setTimelineData]);

  // Calcular progreso del timeline
  const progreso = useMemo(() => {
    return ((estadoActualIndex + 1) / estados.length) * 100;
  }, [estadoActualIndex, estados.length]);

  return {
    estadoActual,
    timelineData,
    estados,
    estadoActualIndex,
    siguienteEstado,
    progreso,
    avanzarEstado,
    reiniciarTimeline,
    actualizarComprador
  };
};
