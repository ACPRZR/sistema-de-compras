import React from 'react';
import { 
  ChartBarIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import Button from '../UI/Button';

const Reportes = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <ChartBarIcon className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
            <p className="text-gray-600">Análisis y estadísticas de órdenes de compra</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="secondary" size="sm">
            <CalendarIcon className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button variant="primary" size="sm">
            <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 shadow-soft border border-secondary-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <CurrencyDollarIcon className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Gasto Total</p>
              <p className="text-3xl font-bold text-gray-900">S/ 125,500</p>
              <p className="text-sm text-success-600">+12% vs mes anterior</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-soft border border-secondary-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
              <ChartBarIcon className="w-6 h-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Órdenes Completadas</p>
              <p className="text-3xl font-bold text-gray-900">24</p>
              <p className="text-sm text-success-600">+8% vs mes anterior</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-soft border border-secondary-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tiempo Promedio</p>
              <p className="text-3xl font-bold text-gray-900">5.2 días</p>
              <p className="text-sm text-danger-600">-0.8 días vs mes anterior</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-soft border border-secondary-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center">
              <ChartBarIcon className="w-6 h-6 text-accent-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Proveedores Activos</p>
              <p className="text-3xl font-bold text-gray-900">12</p>
              <p className="text-sm text-success-600">+2 nuevos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos y reportes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de gastos por mes */}
        <div className="bg-white rounded-lg p-6 shadow-soft border border-secondary-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Gastos por Mes</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Gráfico de gastos por mes</p>
              <p className="text-sm text-gray-400">Los datos se cargarán aquí</p>
            </div>
          </div>
        </div>

        {/* Top proveedores */}
        <div className="bg-white rounded-lg p-6 shadow-soft border border-secondary-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Proveedores</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-600">1</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Proveedor ABC S.A.C.</p>
                  <p className="text-xs text-gray-500">15 órdenes</p>
                </div>
              </div>
              <span className="text-sm font-medium text-gray-900">S/ 45,200</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-success-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-success-600">2</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Distribuidora XYZ Ltda.</p>
                  <p className="text-xs text-gray-500">12 órdenes</p>
                </div>
              </div>
              <span className="text-sm font-medium text-gray-900">S/ 32,800</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-warning-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-warning-600">3</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Servicios Generales S.A.</p>
                  <p className="text-xs text-gray-500">8 órdenes</p>
                </div>
              </div>
              <span className="text-sm font-medium text-gray-900">S/ 28,500</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reportes disponibles */}
      <div className="bg-white rounded-lg shadow-soft border border-secondary-200">
        <div className="px-6 py-4 border-b border-secondary-200">
          <h3 className="text-lg font-semibold text-gray-900">Reportes Disponibles</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="border border-secondary-200 rounded-lg p-4 hover:bg-secondary-50 transition-colors">
              <div className="flex items-center mb-2">
                <DocumentArrowDownIcon className="w-5 h-5 text-primary-600 mr-2" />
                <h4 className="font-medium text-gray-900">Reporte Mensual</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">Resumen completo de órdenes del mes</p>
              <Button variant="primary" size="sm" className="w-full">
                Generar PDF
              </Button>
            </div>
            
            <div className="border border-secondary-200 rounded-lg p-4 hover:bg-secondary-50 transition-colors">
              <div className="flex items-center mb-2">
                <DocumentArrowDownIcon className="w-5 h-5 text-success-600 mr-2" />
                <h4 className="font-medium text-gray-900">Análisis de Proveedores</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">Evaluación de rendimiento de proveedores</p>
              <Button variant="primary" size="sm" className="w-full">
                Generar Excel
              </Button>
            </div>
            
            <div className="border border-secondary-200 rounded-lg p-4 hover:bg-secondary-50 transition-colors">
              <div className="flex items-center mb-2">
                <DocumentArrowDownIcon className="w-5 h-5 text-warning-600 mr-2" />
                <h4 className="font-medium text-gray-900">Reporte de Tiempos</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">Análisis de tiempos de procesamiento</p>
              <Button variant="primary" size="sm" className="w-full">
                Generar PDF
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reportes;
