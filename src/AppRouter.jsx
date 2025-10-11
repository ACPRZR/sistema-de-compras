import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import AprobarOrden from './components/Public/AprobarOrden';

/**
 * Router principal de la aplicación
 * Maneja rutas privadas (sistema interno) y públicas (aprobación)
 */
const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas (sin autenticación) */}
        <Route path="/aprobar/:token" element={<AprobarOrden />} />
        <Route path="/rechazar/:token" element={<AprobarOrden />} />
        
        {/* Ruta principal (sistema interno) */}
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;

