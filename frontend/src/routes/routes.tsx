import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import App from "../pages/App";
import LoginPage from "../pages/LoginPage";
import WorkerLoginPage from "../pages/WorkerLoginPage";
import LandingPage from "../pages/LandingPage";
import RegisterPage from "../pages/RegisterPage";
import CrearDietaPage from "../pages/CrearDietaPage";
import EditarDietaPage from "../pages/EditarDietaPage";
import VerDietaPage from "../pages/VerDietaPage";
import Layout from "../components/layout/Layout";
import { isAuthenticated } from "../services/authService";

// Componente para rutas protegidas de cliente
const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/landingPage" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/worker/login" element={<WorkerLoginPage />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Layout><App /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/crear-dieta/:clienteId" element={
        <ProtectedRoute>
          <Layout><CrearDietaPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/editar-dieta/:dietaId" element={
        <ProtectedRoute>
          <Layout><EditarDietaPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/ver-dieta/:dietaId" element={
        <ProtectedRoute>
          <Layout><VerDietaPage /></Layout>
        </ProtectedRoute>
      } />
      
      {/* Ruta por defecto */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;