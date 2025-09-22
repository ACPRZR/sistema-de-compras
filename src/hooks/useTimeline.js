import React, { useState, useCallback, useMemo } from 'react';

/**
 * Hook para manejar el timeline de estados de la orden
 */
export const useTimeline = () => {
  const [estadoActual, setEstadoActual] = useState('creada');
  
  // Función para migrar datos del sistema anterior
  const migrarDatosTimeline = (datos) => {
    const nuevosDatos = {
      creada: { 
        fecha: new Date().toLocaleString('es-PE'), 
        responsable: 'A. Pérez', 
        completado: true 
      },
      lista: { 
        fecha: null, 
        responsable: 'A. Pérez', 
        completado: false 
      },
      completada: { 
        fecha: null, 
        responsable: 'A. Pérez', 
        completado: false 
      }
    };

    // Si hay datos antiguos, migrar el estado actual
    if (datos && typeof datos === 'object') {
      if (datos.creada?.completado) {
        nuevosDatos.creada = { ...nuevosDatos.creada, ...datos.creada };
      }
      if (datos.aprobada?.completado || datos.enviada?.completado) {
        nuevosDatos.lista = { 
          fecha: datos.aprobada?.fecha || datos.enviada?.fecha || new Date().toLocaleString('es-PE'),
          responsable: 'A. Pérez', 
          completado: true 
        };
      }
      if (datos.completada?.completado) {
        nuevosDatos.completada = { 
          fecha: datos.completada.fecha,
          responsable: 'A. Pérez', 
          completado: true 
        };
      }
    }

    return nuevosDatos;
  };

  const [timelineData, setTimelineData] = useState(migrarDatosTimeline);

  const estados = useMemo(() => ['creada', 'lista', 'completada'], []);

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
      lista: { 
        fecha: null, 
        responsable: 'A. Pérez', 
        completado: false 
      },
      completada: { 
        fecha: null, 
        responsable: 'A. Pérez', 
        completado: false 
      }
    };
    
    setTimelineData(newTimelineData);
    setEstadoActual('creada');
  }, [setTimelineData]);

  // Limpiar datos antiguos del localStorage
  const limpiarDatosAntiguos = useCallback(() => {
    // Limpiar datos del sistema anterior
    localStorage.removeItem('timeline_data');
    // Reiniciar con datos nuevos
    reiniciarTimeline();
  }, [reiniciarTimeline]);

  // Actualizar responsable del comprador (simplificado para uso local)
  const actualizarComprador = useCallback((comprador) => {
    // Para uso local, siempre es A. Pérez
    setTimelineData(prev => ({
      ...prev,
      creada: {
        ...prev.creada,
        responsable: 'A. Pérez'
      }
    }));
  }, [setTimelineData]);

  // Calcular progreso del timeline
  const progreso = useMemo(() => {
    return ((estadoActualIndex + 1) / estados.length) * 100;
  }, [estadoActualIndex, estados.length]);

  // Limpiar datos antiguos al cargar
  React.useEffect(() => {
    // Verificar si hay datos del sistema anterior
    const datosAntiguos = localStorage.getItem('timeline_data');
    if (datosAntiguos) {
      try {
        const parsed = JSON.parse(datosAntiguos);
        // Si tiene estados del sistema anterior, limpiar
        if (parsed.revision || parsed.aprobada || parsed.enviada) {
          limpiarDatosAntiguos();
        }
      } catch (error) {
        // Si hay error al parsear, limpiar
        limpiarDatosAntiguos();
      }
    }
  }, [limpiarDatosAntiguos]);

  return {
    estadoActual,
    timelineData,
    estados,
    estadoActualIndex,
    siguienteEstado,
    progreso,
    avanzarEstado,
    reiniciarTimeline,
    limpiarDatosAntiguos,
    actualizarComprador
  };
};
