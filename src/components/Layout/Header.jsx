import React from 'react';
import { 
  BuildingOffice2Icon, 
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { EMPRESA_CONFIG } from '../../utils/constants';

const Header = () => {
  return (
    <header className="bg-white shadow-soft border-b border-secondary-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo y título */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-glow-primary">
                <BuildingOffice2Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Sistema de Órdenes de Compra
                </h1>
                <p className="text-sm text-secondary-600">
                  {EMPRESA_CONFIG.nombre}
                </p>
              </div>
            </div>
          </div>

          {/* Información del usuario */}
          <div className="flex items-center space-x-4">
            {/* Perfil del usuario */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Álvaro Pérez Román</p>
                <p className="text-xs text-secondary-600">Departamento de Logística</p>
              </div>
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                <UserCircleIcon className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
