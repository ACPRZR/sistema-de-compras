
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import MainLayout from './layouts/MainLayout';
import CreateOrder from './pages/CreateOrder';
import Dashboard from './pages/Dashboard';
import OrderDetails from './pages/OrderDetails';
import Suppliers from './pages/Suppliers';

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/ordenes/nueva" element={
            <ProtectedRoute>
              <MainLayout>
                <CreateOrder />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/ordenes/:id" element={
            <ProtectedRoute>
              <MainLayout>
                <OrderDetails />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/proveedores" element={
            <ProtectedRoute>
              <MainLayout>
                <Suppliers />
              </MainLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
