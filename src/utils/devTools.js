/**
 * Utilidades para desarrollo y testing
 * SOLO PARA DESARROLLO - NO usar en producción
 */

/**
 * Resetear contador de órdenes de compra
 * Útil después de limpiar la base de datos
 */
export const resetOCCounter = (year = new Date().getFullYear()) => {
  const key = `oc_${year}`;
  localStorage.removeItem(key);
  console.log(`✅ Contador de OC ${year} reseteado a 0`);
  console.log(`📋 Próxima OC será: OC-${year}-001`);
};

/**
 * Ver estado actual del contador de OC
 */
export const verContadorOC = (year = new Date().getFullYear()) => {
  const key = `oc_${year}`;
  const current = localStorage.getItem(key) || '0';
  console.log(`📊 Contador actual OC ${year}: ${current}`);
  console.log(`📋 Próxima OC será: OC-${year}-${String(parseInt(current) + 1).padStart(3, '0')}`);
  return parseInt(current);
};

/**
 * Establecer manualmente el contador de OC
 */
export const setContadorOC = (numero, year = new Date().getFullYear()) => {
  const key = `oc_${year}`;
  localStorage.setItem(key, numero.toString());
  console.log(`✅ Contador de OC ${year} establecido en: ${numero}`);
  console.log(`📋 Próxima OC será: OC-${year}-${String(numero + 1).padStart(3, '0')}`);
};

/**
 * Limpiar TODO el localStorage (usar con cuidado)
 */
export const limpiarTodoLocalStorage = () => {
  if (window.confirm('⚠️ Esto limpiará TODOS los datos del localStorage. ¿Continuar?')) {
    localStorage.clear();
    console.log('✅ LocalStorage limpiado completamente');
  }
};

// Exponer en window para acceso desde consola (solo en desarrollo)
if (process.env.NODE_ENV === 'development') {
  window.devTools = {
    resetOCCounter,
    verContadorOC,
    setContadorOC,
    limpiarTodoLocalStorage,
    // Atajos
    resetOC: resetOCCounter,
    verOC: verContadorOC,
    setOC: setContadorOC,
    limpiarTodo: limpiarTodoLocalStorage
  };
  
  console.log('🛠️ DevTools disponibles en window.devTools:');
  console.log('  - resetOC()        : Resetear contador OC');
  console.log('  - verOC()          : Ver contador actual');
  console.log('  - setOC(numero)    : Establecer contador manualmente');
  console.log('  - limpiarTodo()    : Limpiar todo el localStorage');
}

