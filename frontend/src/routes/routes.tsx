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
import { ChatPage } from '../pages/ChatPage';
import WorkerLoginPage from '../pages/WorkerLoginPage';
import Layout from '../components/layout/Layout';
import { useAuth } from '../hooks/useAuth';
import LoginPage from '../pages/LoginPage';

// Componente para proteger rutas
const ProtectedRoute: React.FC<{ children: React.ReactNode, workerRoute?: boolean }> = ({ children, workerRoute = false }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  
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
    // Si es una ruta de trabajador, redirigir a la página de login de trabajador
    if (workerRoute) {
      return <Navigate to="/worker/login" replace />;
    }
    // Para otras rutas, redirigir al login normal
    return <Navigate to="/login" replace />;
  }
  
  // Si es una ruta de trabajador pero el usuario no es worker/admin
  if (workerRoute && user && user.role !== 'worker' && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Eliminamos esta restricción para permitir que los trabajadores accedan a todas las rutas
  // Los trabajadores/admin deben poder acceder a crear dietas, ver dietas, etc.
  
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
      
      <Route path="/worker/dashboard" element={
        <ProtectedRoute workerRoute={true}>
          <Layout>
            <DashboardPage />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/clients" element={
        <ProtectedRoute workerRoute={true}>
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
        <ProtectedRoute workerRoute={true}>
          <Layout>
            <CrearDietaPage />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/chat" element={
        <ProtectedRoute>
          <Layout>
            <ChatPage />
            </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/editar-dieta/:dietaId" element={
        <ProtectedRoute workerRoute={true}>
          <Layout>
            <EditarDietaPage />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/ver-dieta/:dietaId" element={
        <ProtectedRoute workerRoute={true}>
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