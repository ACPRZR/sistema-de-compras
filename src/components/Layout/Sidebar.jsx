import React from 'react';
import { 
  DocumentTextIcon,
  PlusIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ isCollapsed, onToggle, currentPage, onNavigate }) => {
  const menuItems = [
    {
      id: 'nueva-orden',
      label: 'Nueva Orden',
      icon: PlusIcon,
      badge: null
    },
    {
      id: 'ordenes-pendientes',
      label: 'Órdenes Pendientes',
      icon: ClipboardDocumentListIcon,
      badge: '3'
    },
    {
      id: 'historial',
      label: 'Historial',
      icon: DocumentTextIcon,
      badge: null
    },
    {
      id: 'reportes',
      label: 'Reportes',
      icon: ChartBarIcon,
      badge: null
    },
  ];

  return (
    <div className={`bg-white border-r border-secondary-200 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header del sidebar */}
      <div className="flex items-center justify-between p-4 border-b border-secondary-200">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold text-gray-900">Menú Principal</h2>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 text-secondary-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
        >
          {isCollapsed ? (
            <ChevronRightIcon className="w-4 h-4" />
          ) : (
            <ChevronLeftIcon className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navegación */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-primary-50 text-primary-700 border border-primary-200'
                  : 'text-secondary-700 hover:bg-secondary-50 hover:text-primary-600'
              }`}
            >
              <Icon className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : 'mr-3'} ${
                isActive ? 'text-primary-600' : 'text-secondary-500 group-hover:text-primary-600'
              }`} />
              
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-danger-100 text-danger-800">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

    </div>
  );
};

export default Sidebar;
