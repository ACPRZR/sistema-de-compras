
import React from 'react';
import Sidebar from '../components/Layout/Sidebar';

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar />

            {/* Main Content Area */}
            <main className="ml-64 min-h-screen transition-all duration-300">
                <div className="p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
