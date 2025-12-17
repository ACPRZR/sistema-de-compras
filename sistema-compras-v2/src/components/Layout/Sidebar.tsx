import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, FileText, Settings, Users, LogOut, Building2, Package } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = () => {
    const { signOut } = useAuth();

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', to: '/' },
        { icon: ShoppingCart, label: 'Nueva Orden', to: '/ordenes/nueva' },
        { icon: FileText, label: 'Historial', to: '/ordenes/historial' },
        { icon: Package, label: 'Proveedores', to: '/proveedores' },
        { icon: Users, label: 'Usuarios', to: '/usuarios' }, // Admin only later
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 z-50">
            {/* Logo Area */}
            <div className="h-16 flex items-center px-6 border-b border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center mr-3 shadow-lg shadow-sky-500/20">
                    <span className="text-white font-bold text-xl">L</span>
                </div>
                <span className="text-white font-bold text-lg tracking-tight">LADP Logist</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) => `
              flex items-center px-3 py-3 rounded-lg transition-all duration-200 group
              ${isActive
                                ? 'bg-sky-500/10 text-sky-400 font-medium'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }
            `}
                    >
                        <item.icon className="w-5 h-5 mr-3 transition-colors duration-200" />
                        <span className="text-sm">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Footer / User Profile */}
            <div className="p-4 border-t border-slate-800">
                <button
                    onClick={signOut}
                    className="flex items-center w-full px-3 py-2 text-slate-400 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-all duration-200"
                >
                    <LogOut className="w-5 h-5 mr-3" />
                    <span className="text-sm font-medium">Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
