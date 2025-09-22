/**
 * Servicio de API para comunicación con el backend
 * Sistema de Órdenes de Compra
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Método genérico para hacer requests
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const config = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // =====================================================
  // MÉTODOS PARA ÓRDENES DE COMPRA
  // =====================================================

  // Obtener todas las órdenes
  async getOrdenes(filters = {}) {
    const queryParams = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/ordenes?${queryString}` : '/ordenes';
    
    return this.request(endpoint);
  }

  // Obtener orden por ID
  async getOrden(id) {
    return this.request(`/ordenes/${id}`);
  }

  // Crear nueva orden
  async createOrden(ordenData) {
    return this.request('/ordenes', {
      method: 'POST',
      body: JSON.stringify(ordenData),
    });
  }

  // Actualizar orden
  async updateOrden(id, updateData) {
    return this.request(`/ordenes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  // Eliminar orden
  async deleteOrden(id) {
    return this.request(`/ordenes/${id}`, {
      method: 'DELETE',
    });
  }

  // Obtener estadísticas de órdenes
  async getOrdenesStats() {
    return this.request('/ordenes/stats');
  }

  // Generar número de orden
  async generateOCNumber() {
    return this.request('/ordenes/generate-number');
  }

  // =====================================================
  // MÉTODOS PARA ITEMS DE ÓRDENES
  // =====================================================

  // Obtener items de una orden
  async getOrdenItems(ordenId) {
    return this.request(`/ordenes/${ordenId}/items`);
  }

  // Agregar item a una orden
  async addOrdenItem(ordenId, itemData) {
    return this.request(`/ordenes/${ordenId}/items`, {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  }

  // Agregar múltiples items a una orden
  async addOrdenItems(ordenId, items) {
    return this.request(`/ordenes/${ordenId}/items/bulk`, {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  }

  // Actualizar item de una orden
  async updateOrdenItem(ordenId, itemId, updateData) {
    return this.request(`/ordenes/${ordenId}/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  // Eliminar item de una orden
  async deleteOrdenItem(ordenId, itemId) {
    return this.request(`/ordenes/${ordenId}/items/${itemId}`, {
      method: 'DELETE',
    });
  }

  // =====================================================
  // MÉTODOS PARA PROVEEDORES
  // =====================================================

  // Obtener todos los proveedores
  async getProveedores(filters = {}) {
    const queryParams = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/proveedores?${queryString}` : '/proveedores';
    
    return this.request(endpoint);
  }

  // Obtener proveedor por ID
  async getProveedor(id) {
    return this.request(`/proveedores/${id}`);
  }

  // Obtener proveedor por RUC
  async getProveedorByRUC(ruc) {
    return this.request(`/proveedores/ruc/${ruc}`);
  }

  // Obtener proveedores por categoría
  async getProveedoresByCategoria(categoriaId) {
    return this.request(`/proveedores/categoria/${categoriaId}`);
  }

  // Buscar proveedores
  async searchProveedores(searchTerm) {
    return this.request(`/proveedores/search?q=${encodeURIComponent(searchTerm)}`);
  }

  // Crear proveedor
  async createProveedor(proveedorData) {
    return this.request('/proveedores', {
      method: 'POST',
      body: JSON.stringify(proveedorData),
    });
  }

  // Actualizar proveedor
  async updateProveedor(id, updateData) {
    return this.request(`/proveedores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  // Eliminar proveedor
  async deleteProveedor(id) {
    return this.request(`/proveedores/${id}`, {
      method: 'DELETE',
    });
  }

  // Obtener estadísticas de proveedores
  async getProveedoresStats() {
    return this.request('/proveedores/stats');
  }

  // =====================================================
  // MÉTODOS PARA DATOS MAESTROS
  // =====================================================

  // Obtener categorías de compra
  async getCategorias() {
    return this.request('/categorias');
  }

  // Obtener unidades de medida
  async getUnidadesMedida() {
    return this.request('/unidades-medida');
  }

  // Obtener unidades de negocio
  async getUnidadesNegocio() {
    return this.request('/unidades-negocio');
  }

  // Obtener ubicaciones de entrega
  async getUbicacionesEntrega() {
    return this.request('/ubicaciones-entrega');
  }

  // Obtener condiciones de pago
  async getCondicionesPago() {
    return this.request('/condiciones-pago');
  }

  // Obtener tipos de orden
  async getTiposOrden() {
    return this.request('/tipos-orden');
  }

  // Obtener estados de orden
  async getEstadosOrden() {
    return this.request('/estados-orden');
  }

  // Obtener prioridades
  async getPrioridades() {
    return this.request('/prioridades');
  }

  // Obtener productos/servicios
  async getProductos(filters = {}) {
    const queryParams = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/productos?${queryString}` : '/productos';
    
    return this.request(endpoint);
  }

  // Obtener productos por categoría
  async getProductosByCategoria(categoriaId) {
    return this.request(`/productos/categoria/${categoriaId}`);
  }

  // =====================================================
  // MÉTODOS DE UTILIDAD
  // =====================================================

  // Verificar salud del servidor
  async healthCheck() {
    return this.request('/health', { baseURL: this.baseURL.replace('/api', '') });
  }

  // Obtener configuración de la empresa
  async getConfiguracionEmpresa() {
    return this.request('/configuracion');
  }
}

// Crear instancia singleton
const apiService = new ApiService();

export default apiService;
