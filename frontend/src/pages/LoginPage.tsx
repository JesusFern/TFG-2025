import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Form from '../components/organisms/FormLogin';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Si ya está autenticado y no está cargando, redirigir al dashboard
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

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

  // Si ya está autenticado, no mostrar nada (se redirigirá)
  if (isAuthenticated) {
    return null;
  }

  return <Form />;
};

export default LoginPage;
