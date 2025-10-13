import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Formatear moneda en soles peruanos
 * @param {number} amount - Cantidad a formatear
 * @returns {string} - Cantidad formateada
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Formatear fecha en formato peruano
 * @param {Date|string} date - Fecha a formatear
 * @param {string} formatStr - Formato deseado
 * @returns {string} - Fecha formateada
 */
export const formatDate = (date, formatStr = 'dd/MM/yyyy') => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, formatStr, { locale: es });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Generar número de orden de compra
 * NOTA: Este método usa localStorage como respaldo temporal.
 * En producción, debería obtenerse de la base de datos.
 * @returns {string} - Número de OC generado
 */
export const generateOCNumber = () => {
  const now = new Date();
  const year = now.getFullYear();
  
  // SIMPLIFICADO: Formato OC-{año}-{contador}
  // Obtener último número del año desde localStorage
  const key = `oc_${year}`;
  const lastNumber = parseInt(localStorage.getItem(key) || '0');
  const newNumber = lastNumber + 1;
  
  // Guardar nuevo número
  localStorage.setItem(key, newNumber.toString());
  
  return `OC-${year}-${String(newNumber).padStart(3, '0')}`;
};

/**
 * Resetear contador de OC (útil para desarrollo/testing)
 * @param {number} year - Año a resetear (opcional, usa año actual por defecto)
 */
export const resetOCCounter = (year = new Date().getFullYear()) => {
  const key = `oc_${year}`;
  localStorage.removeItem(key);
  console.log(`✅ Contador de OC ${year} reseteado`);
};

/**
 * Formatear número de teléfono
 * @param {string} phone - Número de teléfono
 * @returns {string} - Número formateado
 */
export const formatPhone = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 9) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})/, '$1-$2-$3');
  }
  return phone;
};

/**
 * Formatear RUC
 * @param {string} ruc - RUC a formatear
 * @returns {string} - RUC formateado
 */
export const formatRUC = (ruc) => {
  if (!ruc) return '';
  const cleaned = ruc.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{8})(\d{1})/, '$1$2$3');
  }
  return ruc;
};

/**
 * Validar formato de RUC
 * @param {string} ruc - RUC a validar
 * @returns {boolean} - True si es válido
 */
export const validateRUC = (ruc) => {
  if (!ruc) return false;
  const cleaned = ruc.replace(/\D/g, '');
  return cleaned.length === 11;
};

/**
 * Validar formato de email
 * @param {string} email - Email a validar
 * @returns {boolean} - True si es válido
 */
export const validateEmail = (email) => {
  if (!email) return true; // Email es opcional
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Obtener fecha de requerimiento por defecto (7 días)
 * @returns {string} - Fecha en formato YYYY-MM-DD
 */
export const getDefaultRequerimientoDate = () => {
  return addDays(new Date(), 7).toISOString().split('T')[0];
};

/**
 * Capitalizar primera letra de cada palabra
 * @param {string} str - String a capitalizar
 * @returns {string} - String capitalizado
 */
export const capitalizeWords = (str) => {
  if (!str) return '';
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

/**
 * Truncar texto con elipsis
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @returns {string} - Texto truncado
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
