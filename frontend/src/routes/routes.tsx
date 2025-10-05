import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import RegisterPage from '../pages/RegisterPage';
import LandingPage from '../pages/LandingPage';
import CrearDietaPage from '../pages/CrearDietaPage';
import EditarDietaPage from '../pages/EditarDietaPage';
import VerDietaPage from '../pages/VerDietaPage';
import DetalleDiaPage from '../pages/DetalleDiaPage';
import ProfilePage from '../pages/ProfilePage';
import DashboardPage from '../pages/DashboardPage';
import { ChatPage } from '../pages/ChatPage';
import WorkerClientsDashboard from '../pages/WorkerClientsDashboard';
import Layout from '../components/layout/Layout';
import { useAuth } from '../hooks/useAuth';
import LoginPage from '../pages/LoginPage';
import SuscriptionPlansPage from '../pages/SuscriptionPlansPage';
import PaymentConfirmationPage from '../pages/ConfirmarPagoPage';
import PaymentCancellationPage from '../pages/CancelarPagoPage';
import RegisterWorkerPage from '../pages/RegisterWorkerPage';
import UserManagementPage from '../pages/UserManagementPage';
import UserDetailPage from '../pages/UserDetailPage';
import WorkerManagementPage from '../pages/WorkerManagementPage';
import WorkerDetailPage from '../pages/WorkerDetailPage';

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
    return <Navigate to="/" replace />;
  }
  
  // Si es una ruta de trabajador pero el usuario no es worker/admin
  if (workerRoute && user && user.role !== 'worker' && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Eliminamos esta restricción para permitir que los trabajadores accedan a todas las rutas
  // Los trabajadores/admin deben poder acceder a crear dietas, ver dietas, etc.
  
  return <>{children}</>;
};

// Componente para proteger rutas solo para admin
const AdminProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
    return <Navigate to="/login" replace />;
  }
  
  // Solo admin puede acceder
  if (user && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

import WorkerClientDietsList from '../pages/WorkerClientDietsList';
import WorkerClientTrainingPlansList from '../pages/WorkerClientTrainingPlansList';
import CrearPlanEntrenamientoPage from '../pages/CrearPlanEntrenamientoPage';
import EditarPlanEntrenamientoPage from '../pages/EditarPlanEntrenamientoPage';
import VerPlanEntrenamientoPage from '../pages/VerPlanEntrenamientoPage';
import SeleccionarTipoPlanPage from '../pages/SeleccionarTipoPlanPage';
import SeleccionarPlanExistentePage from '../pages/SeleccionarPlanExistentePage';
import SeleccionarObjetivoPlantillaPage from '../pages/SeleccionarObjetivoPlantillaPage';
import ConfigurarPlantillaPage from '../pages/ConfigurarPlantillaPage';
import CrearRecetaPage from '../pages/CrearRecetaPage';
import EditarRecetaPage from '../pages/EditarRecetaPage';
import MisRecetasPage from '../pages/MisRecetasPage';
import VerRecetaPage from '../pages/VerRecetaPage';
import AcercaDePage from '../pages/AcercaDePage';
import ProfessionalsPage from '../pages/ProfessionalsPage';
import MyWorkersPage from '../pages/MyWorkersPage';
import ClientTrainingPlansPage from '../pages/ClientTrainingPlansPage';
import ClientTrainingPlanDetailPage from '../pages/ClientTrainingPlanDetailPage';
import ClientTrainingSessionPage from '../pages/ClientTrainingSessionPage';
import ClientExerciseDetailPage from '../pages/ClientExerciseDetailPage';
import MyDietsPage from '../pages/MyDietsPage';
import CitasPage from '../pages/CitasPage';
import CrearCitaPage from '../pages/CrearCitaPage';
import EditarCitaPage from '../pages/EditarCitaPage';
import ProgresoSemanalPage from '../pages/ProgresoSemanalPage';
import CalendarPage from '../pages/CalendarPage';
import NotificacionesPage from '../pages/NotificacionesPage';
import ListaCompraPage from '../pages/ListaCompraPage';
import WorkerValoracionesPage from '../pages/WorkerValoracionesPage';
import WorkerProfilePage from '../pages/WorkerProfilePage';
import CrearIncidenciaPage from '../pages/CrearIncidenciaPage';
import ListadoIncidenciasPage from '../pages/ListadoIncidenciasPage';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/acerca-de" element={<AcercaDePage />} />
      <Route path="/profesionales" element={<ProfessionalsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/planes-suscripcion" element={<SuscriptionPlansPage />} />
      <Route path="/payment/confirm" element={<PaymentConfirmationPage />} />
      <Route path="/payment/cancel" element={<PaymentCancellationPage />} />

      {/* Rutas protegidas */}
      
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
      
      <Route path="/worker/dashboard-clients" element={
        <ProtectedRoute workerRoute={true}>
          <Layout>
            <WorkerClientsDashboard />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/worker/dashboard-clients/:clientId/diets" element={
        <ProtectedRoute workerRoute={true}>
          <Layout>
            <WorkerClientDietsList />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/worker/dashboard-clients/:clientId/training" element={
        <ProtectedRoute workerRoute={true}>
          <Layout>
            <WorkerClientTrainingPlansList />
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
      
      <Route path="/profile/:userId" element={
        <ProtectedRoute>
          <Layout>
            <ProfilePage />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/solicitudes" element={
        <ProtectedRoute>
          <Layout>
            <MyWorkersPage />
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
        <ProtectedRoute>
          <Layout>
            <VerDietaPage />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/dieta/:dietaId/dia/:diaIndex" element={
        <ProtectedRoute>
          <Layout>
            <DetalleDiaPage />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/lista-compra/:dietaId/semana/:semana" element={
        <ProtectedRoute>
          <Layout>
            <ListaCompraPage />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Rutas de valoraciones */}

      <Route path="/worker/valoraciones" element={
        <ProtectedRoute workerRoute={true}>
          <Layout>
            <WorkerValoracionesPage />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/profesional/:id" element={
        <ProtectedRoute>
          <Layout>
            <WorkerProfilePage />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/training/planes/tipo" element={
        <ProtectedRoute workerRoute={true}>
          <Layout>
            <SeleccionarTipoPlanPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/training/planes/crear" element={
        <ProtectedRoute workerRoute={true}>
          <Layout>
            <CrearPlanEntrenamientoPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/training/planes/plantillas/objetivos" element={
        <ProtectedRoute workerRoute={true}>
          <Layout>
            <SeleccionarObjetivoPlantillaPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/training/planes/plantillas/configurar" element={
        <ProtectedRoute workerRoute={true}>
          <Layout>
            <ConfigurarPlantillaPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/training/planes/seleccionar-existente" element={
        <ProtectedRoute workerRoute={true}>
          <Layout>
            <SeleccionarPlanExistentePage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/training/planes/:planId/editar" element={
        <ProtectedRoute workerRoute={true}>
          <Layout>
            <EditarPlanEntrenamientoPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/training/planes/:planId" element={
        <ProtectedRoute workerRoute={true}>
          <Layout>
            <VerPlanEntrenamientoPage />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Rutas de recetas */}
      <Route path="/recetas/crear" element={
        <ProtectedRoute workerRoute={true}>
          <Layout>
            <CrearRecetaPage />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/mis-recetas" element={
        <ProtectedRoute workerRoute={true}>
          <Layout>
            <MisRecetasPage />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/recetas/:id" element={
        <ProtectedRoute>
          <Layout>
            <VerRecetaPage />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/recetas/editar/:id" element={
        <ProtectedRoute workerRoute={true}>
          <Layout>
            <EditarRecetaPage />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Rutas de entrenamiento para clientes */}
      <Route path="/mis-entrenamientos" element={
        <ProtectedRoute>
          <Layout>
            <ClientTrainingPlansPage />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/mis-entrenamientos/:planId" element={
        <ProtectedRoute>
          <Layout>
            <ClientTrainingPlanDetailPage />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/mis-entrenamientos/:planId/sesion/:sesionId" element={
        <ProtectedRoute>
          <Layout>
            <ClientTrainingSessionPage />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/ejercicio/:ejercicioId" element={
        <ProtectedRoute>
          <Layout>
            <ClientExerciseDetailPage />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Ruta para dietas del cliente */}
      <Route path="/mis-dietas" element={
        <ProtectedRoute>
          <Layout>
            <MyDietsPage />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Ruta para progreso semanal */}
      <Route path="/progreso-semanal" element={
        <ProtectedRoute>
          <Layout>
            <ProgresoSemanalPage />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Ruta para calendario */}
      <Route path="/calendar" element={
        <ProtectedRoute>
          <Layout>
            <CalendarPage />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Ruta para notificaciones */}
      <Route path="/notificaciones" element={
        <ProtectedRoute>
          <Layout>
            <NotificacionesPage />
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Rutas para citas */}
      <Route path="/citas" element={
        <ProtectedRoute>
          <Layout>
            <CitasPage />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Rutas para incidencias */}
      <Route path="/incidencias/crear" element={
        <ProtectedRoute>
          <Layout>
            <CrearIncidenciaPage />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/mis-incidencias" element={
        <ProtectedRoute>
          <Layout>
            <ListadoIncidenciasPage />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/citas/crear" element={
        <ProtectedRoute>
          <Layout>
            <CrearCitaPage />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/citas/editar/:id" element={
        <ProtectedRoute>
          <Layout>
            <EditarCitaPage />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Ruta para registro de trabajadores (solo admin) */}
      <Route path="/admin/registrar-trabajador" element={
        <AdminProtectedRoute>
          <Layout>
            <RegisterWorkerPage />
          </Layout>
        </AdminProtectedRoute>
      } />

      {/* Rutas para gestión de usuarios (solo admin) */}
      <Route path="/admin/users" element={
        <AdminProtectedRoute>
          <Layout>
            <UserManagementPage />
          </Layout>
        </AdminProtectedRoute>
      } />
      
      <Route path="/admin/users/:userId" element={
        <AdminProtectedRoute>
          <Layout>
            <UserDetailPage />
          </Layout>
        </AdminProtectedRoute>
      } />

      {/* Rutas para gestión de trabajadores (solo admin) */}
      <Route path="/admin/workers" element={
        <AdminProtectedRoute>
          <Layout>
            <WorkerManagementPage />
          </Layout>
        </AdminProtectedRoute>
      } />
      
      <Route path="/admin/workers/:workerId" element={
        <AdminProtectedRoute>
          <Layout>
            <WorkerDetailPage />
          </Layout>
        </AdminProtectedRoute>
      } />

      {/* Ruta para gestión de incidencias (solo admin) */}
      <Route path="/admin/incidencias" element={
        <AdminProtectedRoute>
          <Layout>
            <ListadoIncidenciasPage />
          </Layout>
        </AdminProtectedRoute>
      } />
      
      {/* Redirigir rutas no encontradas */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;