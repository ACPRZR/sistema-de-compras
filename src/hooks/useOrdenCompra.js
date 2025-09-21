import { useState, useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { generateOCNumber, formatCurrency } from '../utils/formatters';

/**
 * Hook principal para manejar el estado de la orden de compra
 */
export const useOrdenCompra = () => {
  // Estado de items
  const [items, setItems] = useState({});
  const [contadorItems, setContadorItems] = useState(0);
  
  // Estado de la orden
  const [ordenCompleta, setOrdenCompleta] = useState('');
  const [showOrden, setShowOrden] = useState(false);
  
  // Persistencia
  const [savedItems, setSavedItems] = useLocalStorage('orden_items', {});
  const [savedContador, setSavedContador] = useLocalStorage('orden_contador', 0);

  // Cargar datos guardados al inicializar
  useState(() => {
    if (Object.keys(savedItems).length > 0) {
      setItems(savedItems);
      setContadorItems(savedContador);
    }
  }, [savedItems, savedContador]);

  // Agregar nuevo item
  const agregarItem = useCallback(() => {
    const nuevoId = `item_${contadorItems + 1}`;
    const nuevoItem = {
      id: nuevoId,
      descripcion: '',
      unidad: 'Unidad',
      cantidad: 1,
      precio: 0,
      subtotal: 0
    };
    
    setItems(prev => {
      const newItems = { ...prev, [nuevoId]: nuevoItem };
      setSavedItems(newItems);
      return newItems;
    });
    setContadorItems(prev => {
      const newCount = prev + 1;
      setSavedContador(newCount);
      return newCount;
    });
  }, [contadorItems, setSavedItems, setSavedContador]);

  // Actualizar item existente
  const actualizarItem = useCallback((itemId, updates) => {
    setItems(prev => {
      const updatedItem = { ...prev[itemId], ...updates };
      
      // Recalcular subtotal si cambió cantidad o precio
      if (updates.cantidad !== undefined || updates.precio !== undefined) {
        updatedItem.subtotal = updatedItem.cantidad * updatedItem.precio;
      }
      
      const newItems = { ...prev, [itemId]: updatedItem };
      setSavedItems(newItems);
      return newItems;
    });
  }, [setSavedItems]);

  // Eliminar item
  const eliminarItem = useCallback((itemId) => {
    setItems(prev => {
      const newItems = { ...prev };
      delete newItems[itemId];
      setSavedItems(newItems);
      return newItems;
    });
  }, [setSavedItems]);

  // Calcular total de la orden
  const calcularTotal = useCallback(() => {
    return Object.values(items).reduce((total, item) => {
      return total + (item.cantidad * item.precio);
    }, 0);
  }, [items]);

  // Obtener resumen de items
  const resumenItems = useMemo(() => {
    return Object.values(items)
      .filter(item => item.descripcion && item.descripcion.trim() !== '')
      .map(item => ({
        ...item,
        subtotalFormatted: formatCurrency(item.subtotal)
      }));
  }, [items]);

  // Limpiar todos los items
  const limpiarItems = useCallback(() => {
    setItems({});
    setContadorItems(0);
    setSavedItems({});
    setSavedContador(0);
  }, [setSavedItems, setSavedContador]);

  // Generar número de OC
  const generarNumeroOC = useCallback(() => {
    return generateOCNumber();
  }, []);

  return {
    // Estado
    items,
    contadorItems,
    ordenCompleta,
    showOrden,
    resumenItems,
    
    // Acciones
    agregarItem,
    actualizarItem,
    eliminarItem,
    limpiarItems,
    calcularTotal,
    generarNumeroOC,
    
    // Setters
    setOrdenCompleta,
    setShowOrden
  };
};
