import { useState, useCallback } from 'react';
import apiService from '../services/api';
import { useApi, useForm } from './useApi';

/**
 * Hook para manejar órdenes de compra con base de datos
 * Reemplaza el hook original useOrdenCompra.js
 */

export const useOrdenCompraDB = () => {
  const [items, setItems] = useState({});
  const [contadorItems, setContadorItems] = useState(0);
  const [ordenCompleta, setOrdenCompleta] = useState('');
  const [showOrden, setShowOrden] = useState(false);
  const [ordenId, setOrdenId] = useState(null);
  
  const { loading, error, clearError } = useApi();

  // Cargar items de una orden existente
  const loadOrdenItems = useCallback(async (ordenId) => {
    if (!ordenId) return;
    
    try {
      const result = await apiService.getOrdenItems(ordenId);
      const itemsData = {};
      let maxItemNumber = 0;
      
      result.data.forEach((item, index) => {
        const itemId = `item_${item.item_numero}`;
        itemsData[itemId] = {
          id: itemId,
          descripcion: item.descripcion,
          unidad: item.unidad_nombre || 'Unidad',
          cantidad: item.cantidad,
          precio: item.precio_unitario,
          subtotal: item.subtotal,
          producto_id: item.producto_id
        };
        maxItemNumber = Math.max(maxItemNumber, item.item_numero);
      });
      
      setItems(itemsData);
      setContadorItems(maxItemNumber);
    } catch (err) {
      console.error('Error cargando items de la orden:', err);
    }
  }, []);

  // Agregar nuevo item
  const agregarItem = useCallback(async () => {
    const nuevoId = `item_${contadorItems + 1}`;
    const nuevoItem = {
      id: nuevoId,
      descripcion: '',
      unidad: 'Unidad',
      cantidad: 1,
      precio: 0,
      subtotal: 0
    };
    
    setItems(prev => ({
      ...prev,
      [nuevoId]: nuevoItem
    }));
    setContadorItems(prev => prev + 1);
  }, [contadorItems]);

  // Actualizar item existente
  const actualizarItem = useCallback(async (itemId, updates) => {
    const updatedItem = { ...items[itemId], ...updates };
    
    // Recalcular subtotal si cambió cantidad o precio
    if (updates.cantidad !== undefined || updates.precio !== undefined) {
      updatedItem.subtotal = updatedItem.cantidad * updatedItem.precio;
    }
    
    setItems(prev => ({
      ...prev,
      [itemId]: updatedItem
    }));

    // Si hay una orden guardada, actualizar en la base de datos
    if (ordenId && updatedItem.descripcion) {
      try {
        const itemData = {
          descripcion: updatedItem.descripcion,
          unidad_id: 1, // TODO: Obtener ID real de la unidad
          cantidad: updatedItem.cantidad,
          precio_unitario: updatedItem.precio,
          subtotal: updatedItem.subtotal
        };

        if (updatedItem.producto_id) {
          itemData.producto_id = updatedItem.producto_id;
        }

        await apiService.updateOrdenItem(ordenId, itemId, itemData);
      } catch (err) {
        console.error('Error actualizando item en BD:', err);
      }
    }
  }, [items, ordenId]);

  // Eliminar item
  const eliminarItem = useCallback(async (itemId) => {
    setItems(prev => {
      const newItems = { ...prev };
      delete newItems[itemId];
      return newItems;
    });

    // Si hay una orden guardada, eliminar de la base de datos
    if (ordenId) {
      try {
        await apiService.deleteOrdenItem(ordenId, itemId);
      } catch (err) {
        console.error('Error eliminando item de BD:', err);
      }
    }
  }, [ordenId]);

  // Calcular total de la orden
  const calcularTotal = useCallback(() => {
    return Object.values(items).reduce((total, item) => {
      return total + (item.cantidad * item.precio);
    }, 0);
  }, [items]);

  // Obtener resumen de items
  const resumenItems = Object.values(items)
    .filter(item => item.descripcion && item.descripcion.trim() !== '')
    .map(item => ({
      ...item,
      subtotalFormatted: new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
        minimumFractionDigits: 2
      }).format(item.subtotal)
    }));

  // Limpiar todos los items
  const limpiarItems = useCallback(() => {
    setItems({});
    setContadorItems(0);
  }, []);

  // Generar número de OC
  const generarNumeroOC = useCallback(async () => {
    try {
      const result = await apiService.generateOCNumber();
      return result.data.numero_oc;
    } catch (err) {
      console.error('Error generando número de OC:', err);
      // Fallback a generación local
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      return `OC-${year}-${month}-${random}`;
    }
  }, []);

  // Guardar orden en la base de datos
  const guardarOrden = useCallback(async (ordenData) => {
    try {
      const result = await apiService.createOrden(ordenData);
      setOrdenId(result.data.id);
      return result.data;
    } catch (err) {
      console.error('Error guardando orden:', err);
      throw err;
    }
  }, []);

  // Actualizar orden en la base de datos
  const actualizarOrden = useCallback(async (ordenData) => {
    if (!ordenId) return;
    
    try {
      const result = await apiService.updateOrden(ordenId, ordenData);
      return result.data;
    } catch (err) {
      console.error('Error actualizando orden:', err);
      throw err;
    }
  }, [ordenId]);

  // Sincronizar items con la base de datos
  const sincronizarItems = useCallback(async () => {
    if (!ordenId) return;

    try {
      const itemsArray = Object.values(items).map(item => ({
        descripcion: item.descripcion,
        unidad_id: 1, // TODO: Obtener ID real de la unidad
        cantidad: item.cantidad,
        precio_unitario: item.precio,
        subtotal: item.subtotal,
        producto_id: item.producto_id
      }));

      await apiService.addOrdenItems(ordenId, itemsArray);
    } catch (err) {
      console.error('Error sincronizando items:', err);
    }
  }, [ordenId, items]);

  return {
    // Estado
    items,
    contadorItems,
    ordenCompleta,
    showOrden,
    resumenItems,
    ordenId,
    loading,
    error,
    
    // Acciones
    agregarItem,
    actualizarItem,
    eliminarItem,
    limpiarItems,
    calcularTotal,
    generarNumeroOC,
    guardarOrden,
    actualizarOrden,
    sincronizarItems,
    loadOrdenItems,
    
    // Setters
    setOrdenCompleta,
    setShowOrden,
    setOrdenId,
    clearError
  };
};

/**
 * Hook para manejar formularios de órdenes con validación
 */
export const useOrdenForm = (initialValues = {}) => {
  const validationRules = {
    fecha_requerimiento: [
      (value) => !value ? 'Fecha de requerimiento es requerida' : null
    ],
    categoria_id: [
      (value) => !value ? 'Categoría es requerida' : null
    ],
    proveedor_nombre: [
      (value) => !value ? 'Proveedor es requerido' : null
    ],
    proveedor_ruc: [
      (value) => !value ? 'RUC es requerido' : null,
      (value) => value && value.length !== 11 ? 'RUC debe tener 11 dígitos' : null
    ],
    lugar_entrega: [
      (value) => !value ? 'Lugar de entrega es requerido' : null
    ],
    datos_proyecto: [
      (value) => !value ? 'Datos del proyecto son requeridos' : null
    ]
  };

  return useForm(initialValues, validationRules);
};
