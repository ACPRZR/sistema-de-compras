import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

/**
 * Hook personalizado para manejar llamadas a la API
 * Incluye estados de carga, errores y funciones de utilidad
 */

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Función genérica para ejecutar llamadas a la API
  const executeApiCall = useCallback(async (apiCall, ...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiCall(...args);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Limpiar error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    executeApiCall,
    clearError
  };
};

/**
 * Hook para manejar datos con paginación
 */
export const usePaginatedData = (apiCall, initialFilters = {}) => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState(initialFilters);
  const { loading, error, executeApiCall, clearError } = useApi();

  // Cargar datos
  const loadData = useCallback(async (newFilters = {}) => {
    const currentFilters = { ...filters, ...newFilters };
    setFilters(currentFilters);
    
    try {
      const result = await executeApiCall(apiCall, currentFilters);
      setData(result.data || []);
      setPagination(result.pagination || {
        page: 1,
        limit: 10,
        total: result.data?.length || 0,
        totalPages: 1
      });
    } catch (err) {
      console.error('Error cargando datos:', err);
    }
  }, [apiCall, filters, executeApiCall]);

  // Cambiar página
  const changePage = useCallback((newPage) => {
    loadData({ page: newPage });
  }, [loadData]);

  // Cambiar límite de elementos por página
  const changeLimit = useCallback((newLimit) => {
    loadData({ limit: newLimit, page: 1 });
  }, [loadData]);

  // Aplicar filtros
  const applyFilters = useCallback((newFilters) => {
    loadData({ ...newFilters, page: 1 });
  }, [loadData]);

  // Recargar datos
  const reload = useCallback(() => {
    loadData();
  }, [loadData]);

  // Cargar datos iniciales
  useEffect(() => {
    loadData();
  }, []);

  return {
    data,
    pagination,
    filters,
    loading,
    error,
    changePage,
    changeLimit,
    applyFilters,
    reload,
    clearError
  };
};

/**
 * Hook para manejar un elemento individual
 */
export const useItem = (apiCall, id) => {
  const [item, setItem] = useState(null);
  const { loading, error, executeApiCall, clearError } = useApi();

  // Cargar elemento
  const loadItem = useCallback(async (itemId = id) => {
    if (!itemId) return;
    
    try {
      const result = await executeApiCall(apiCall, itemId);
      setItem(result.data);
    } catch (err) {
      console.error('Error cargando elemento:', err);
    }
  }, [apiCall, id, executeApiCall]);

  // Cargar elemento inicial
  useEffect(() => {
    loadItem();
  }, [loadItem]);

  return {
    item,
    loading,
    error,
    loadItem,
    clearError
  };
};

/**
 * Hook para operaciones CRUD
 */
export const useCrud = (apiService, resourceName) => {
  const { loading, error, executeApiCall, clearError } = useApi();

  // Crear elemento
  const create = useCallback(async (data) => {
    try {
      const result = await executeApiCall(apiService.create, data);
      return result;
    } catch (err) {
      console.error(`Error creando ${resourceName}:`, err);
      throw err;
    }
  }, [apiService.create, executeApiCall, resourceName]);

  // Actualizar elemento
  const update = useCallback(async (id, data) => {
    try {
      const result = await executeApiCall(apiService.update, id, data);
      return result;
    } catch (err) {
      console.error(`Error actualizando ${resourceName}:`, err);
      throw err;
    }
  }, [apiService.update, executeApiCall, resourceName]);

  // Eliminar elemento
  const remove = useCallback(async (id) => {
    try {
      const result = await executeApiCall(apiService.delete, id);
      return result;
    } catch (err) {
      console.error(`Error eliminando ${resourceName}:`, err);
      throw err;
    }
  }, [apiService.delete, executeApiCall, resourceName]);

  return {
    loading,
    error,
    create,
    update,
    remove,
    clearError
  };
};

/**
 * Hook para manejar formularios con validación
 */
export const useForm = (initialValues = {}, validationRules = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Actualizar valor
  const setValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error si existe
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [errors]);

  // Marcar campo como tocado
  const setTouchedField = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  // Validar campo individual
  const validateField = useCallback((name, value) => {
    const rules = validationRules[name];
    if (!rules) return null;

    for (const rule of rules) {
      const error = rule(value, values);
      if (error) return error;
    }

    return null;
  }, [validationRules, values]);

  // Validar todos los campos
  const validate = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(name => {
      const error = validateField(name, values[name]);
      if (error) {
        newErrors[name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validateField, validationRules]);

  // Resetear formulario
  const reset = useCallback((newValues = initialValues) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  // Manejar cambio de input
  const handleChange = useCallback((name) => (value) => {
    setValue(name, value);
    setTouchedField(name);
  }, [setValue, setTouchedField]);

  // Manejar blur de input
  const handleBlur = useCallback((name) => () => {
    setTouchedField(name);
    const error = validateField(name, values[name]);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [setTouchedField, validateField, values]);

  return {
    values,
    errors,
    touched,
    setValue,
    setTouchedField,
    validateField,
    validate,
    reset,
    handleChange,
    handleBlur,
    isValid: Object.keys(errors).length === 0
  };
};
