import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import App from '../pages/App';
import RegisterPage from '../pages/RegisterPage';
import LandingPage from '../pages/LandingPage';
import CrearDietaPage from '../pages/CrearDietaPage';
import EditarDietaPage from '../pages/EditarDietaPage';
import VerDietaPage from '../pages/VerDietaPage';
import ProfilePage from '../pages/ProfilePage';
import DashboardPage from '../pages/DashboardPage';
import WorkerLoginPage from '../pages/WorkerLoginPage';
import Layout from '../components/layout/Layout';
import { useAuth } from '../hooks/useAuth';
import LoginPage from '../pages/LoginPage';

// Componente para proteger rutas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Verificando autenticación...
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/landingPage" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/worker/login" element={<WorkerLoginPage />} />
      
      {/* Rutas protegidas */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout>
            <App />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout>
            <DashboardPage />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute>
          <Layout>
            <ProfilePage />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/crear-dieta/:clienteId" element={
        <ProtectedRoute>
          <Layout>
            <CrearDietaPage />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/editar-dieta/:dietaId" element={
        <ProtectedRoute>
          <Layout>
            <EditarDietaPage />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/ver-dieta/:dietaId" element={
        <ProtectedRoute>
          <Layout>
            <VerDietaPage />
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Redirigir rutas no encontradas */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;