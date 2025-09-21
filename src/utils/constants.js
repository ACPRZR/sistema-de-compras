/**
 * Constantes del sistema de órdenes de compra
 */

// Unidades de medida
export const UNIDADES_MEDIDA = [
  { value: 'Unidad', label: 'Unidad' },
  { value: 'Caja', label: 'Caja' },
  { value: 'Paquete', label: 'Paquete' },
  { value: 'Kilogramo', label: 'Kilogramo' },
  { value: 'Litro', label: 'Litro' },
  { value: 'Metro', label: 'Metro' },
  { value: 'Galón', label: 'Galón' },
  { value: 'Millar', label: 'Millar' },
  { value: 'Docena', label: 'Docena' },
  { value: 'Servicio', label: 'Servicio' },
  { value: 'Hora', label: 'Hora' },
  { value: 'Día', label: 'Día' }
];

// Categorías de compra
export const CATEGORIAS_COMPRA = [
  { value: 'tecnologia', label: 'Tecnología e Informática' },
  { value: 'oficina', label: 'Útiles de Oficina' },
  { value: 'limpieza', label: 'Insumos de Limpieza' },
  { value: 'mantenimiento', label: 'Mantenimiento e Infraestructura' },
  { value: 'audiovisuales', label: 'Equipos Audiovisuales' },
  { value: 'mobiliario', label: 'Mobiliario y Equipamiento' },
  { value: 'servicios', label: 'Servicios Generales' },
  { value: 'otros', label: 'Otros' }
];

// Unidades de negocio
export const UNIDADES_NEGOCIO = [
  { value: 'oficina_nacional', label: 'Oficina Nacional' },
  { value: 'logistica', label: 'Logística' },
  { value: 'legal', label: 'Legal' },
  { value: 'sistemas', label: 'Sistemas' },
  { value: 'mantenimiento', label: 'Mantenimiento' }
];

// Unidades que autorizan
export const UNIDADES_AUTORIZA = [
  { value: 'tesoreria_nacional', label: 'Tesorería Nacional' },
  { value: 'presidencia_nacional', label: 'Presidencia Nacional' }
];

// Ubicaciones de entrega
export const UBICACIONES_ENTREGA = [
  { 
    value: 'sede_nacional', 
    label: 'Sede Nacional',
    direccion: 'Av. Colombia 325, San Isidro, Lima'
  },
  { 
    value: 'carapongo', 
    label: 'Carapongo',
    direccion: 'Carretera Central Km 20.5, Carapongo, Lima'
  },
  { 
    value: 'diego_thompson', 
    label: 'Diego Thompson',
    direccion: 'Av. Diego Thompson 142, San Luis, Lima'
  },
  { 
    value: 'chorrillos', 
    label: 'Chorrillos',
    direccion: 'Av. Defensores del Morro 1245, Chorrillos, Lima'
  }
];

// Tipos de orden
export const TIPOS_ORDEN = [
  { value: 'standard', label: 'Standard OC', description: 'Orden única' },
  { value: 'blanket', label: 'Blanket OC', description: 'Orden marco para múltiples entregas' }
];

// Condiciones de pago
export const CONDICIONES_PAGO = [
  { value: 'contado', label: 'Contado' },
  { value: '15dias', label: '15 días' },
  { value: '30dias', label: '30 días' },
  { value: '45dias', label: '45 días' },
  { value: '60dias', label: '60 días' }
];

// Compradores responsables
export const COMPRADORES_RESPONSABLES = [
  { 
    value: 'alvaro_perez', 
    label: 'Álvaro Pérez Román',
    cargo: 'Logística',
    codigo: 'A. Pérez'
  },
  { 
    value: 'maria_garcia', 
    label: 'María García',
    cargo: 'Adquisiciones',
    codigo: 'M. García'
  },
  { 
    value: 'carlos_lopez', 
    label: 'Carlos López',
    cargo: 'Compras Generales',
    codigo: 'C. López'
  },
  { 
    value: 'ana_rodriguez', 
    label: 'Ana Rodríguez',
    cargo: 'Compras Especializadas',
    codigo: 'A. Rodríguez'
  }
];

// Estados de la orden
export const ESTADOS_ORDEN = [
  { value: 'creada', label: 'Creada', color: 'success', icon: '📝' },
  { value: 'revision', label: 'En Revisión', color: 'warning', icon: '👀' },
  { value: 'aprobada', label: 'Aprobada', color: 'success', icon: '✅' },
  { value: 'enviada', label: 'Enviada', color: 'primary', icon: '📤' },
  { value: 'completada', label: 'Completada', color: 'accent', icon: '🎉' }
];

// Reglas de aprobación por monto
export const REGLAS_APROBACION = [
  { min: 0, max: 1000, aprobador: 'Supervisor Directo', nivel: 1 },
  { min: 1001, max: 5000, aprobador: 'Gerente de Área', nivel: 2 },
  { min: 5001, max: 15000, aprobador: 'Gerencia General', nivel: 3 },
  { min: 15001, max: 50000, aprobador: 'Presidencia', nivel: 4 },
  { min: 50001, max: Infinity, aprobador: 'Consejo Directivo', nivel: 5 }
];

// Configuración de la empresa
export const EMPRESA_CONFIG = {
  nombre: 'Las Asambleas de Dios del Perú',
  nombreCompleto: 'Las Asambleas de Dios del Perú - Iglesia Cristiana Evangélica Pentecostal',
  ruc: '20144538570',
  partida: '11010820',
  registro: '023-2016-JUS/REG - MINJUSDH',
  lema: 'Cristo salva, sana, santifica, bautiza con el Espíritu Santo y viene otra vez con poder',
  direccion: 'Av. Colombia 325, San Isidro, Lima',
  telefono: '915359876',
  email: 'logistica@ladp.org.pe'
};

// Configuración de validaciones
export const VALIDACIONES = {
  ruc: {
    pattern: /^\d{11}$/,
    message: 'El RUC debe tener 11 dígitos'
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Ingrese un email válido'
  },
  telefono: {
    pattern: /^[\d\s\-()]+$/,
    message: 'Ingrese un teléfono válido'
  },
  cantidad: {
    min: 1,
    message: 'La cantidad debe ser mayor a 0'
  },
  precio: {
    min: 0,
    message: 'El precio debe ser mayor o igual a 0'
  }
};
