/**
 * Constantes del sistema de órdenes de compra
 */

// Unidades de medida - MIGRADAS A BASE DE DATOS
// Las unidades de medida ahora se cargan dinámicamente desde /api/unidades-medida
// Ver: ItemsOrdenDB.jsx línea 40-56

// =====================================================
// DATOS MAESTROS MIGRADOS A BASE DE DATOS
// =====================================================
// Los siguientes datos ahora se cargan dinámicamente desde la BD:
// - Categorías de compra → /api/categorias
// - Unidades de negocio → /api/maestros/unidades-negocio
// - Unidades que autorizan → /api/maestros/unidades-autoriza
// - Ubicaciones de entrega → /api/maestros/ubicaciones-entrega
// - Tipos de orden → /api/maestros/tipos-orden
// - Condiciones de pago → /api/maestros/condiciones-pago
// - Estados de orden → /api/maestros/estados-orden
// - Prioridades → /api/maestros/prioridades
// - Usuarios → /api/maestros/usuarios
// - Configuración empresa → /api/maestros/configuracion-empresa
// 
// Ver: src/hooks/useMaestros.js para uso en componentes

// =====================================================
// CONSTANTES QUE PERMANECEN HARDCODEADAS
// =====================================================
// Estas son constantes de UI o lógica de negocio que no necesitan estar en BD

// Comprador responsable (simplificado para uso local)
export const COMPRADOR_RESPONSABLE = {
  value: 'alvaro_perez',
  label: 'Álvaro Pérez Román',
  cargo: 'Logística',
  codigo: 'A. Pérez'
};

// Reglas de aprobación simplificadas para uso local
export const REGLAS_APROBACION = [
  { min: 0, max: Infinity, aprobador: 'A. Pérez', nivel: 1 }
];

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
