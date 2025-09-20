import React, { useState } from 'react';
import { Container, Title, Text, Stack, Alert, LoadingOverlay } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useThemeDetection } from '../hooks/useThemeDetection';
import GlobalNotificationOverlay from '../components/atoms/GlobalNotificationOverlay';
import FormularioCrearCita from '../components/forms/citas/FormularioCrearCita';
import { IconAlertCircle } from '@tabler/icons-react';

const CrearCitaPage: React.FC = () => {
  const { user } = useAuth();
  const isDark = useThemeDetection();
  const navigate = useNavigate();
  
  const [loading] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const handleSuccess = () => {
    setNotification({
      type: 'success',
      message: 'Cita creada exitosamente'
    });
    
    // Redirigir después de un breve delay
    setTimeout(() => {
      navigate('/citas');
    }, 200);
  };

  const handleError = (error: Error) => {
    console.error('Error al crear cita:', error);
    setNotification({
      type: 'error',
      message: error.message || 'Error al crear la cita'
    });
  };

  // Verificar que el usuario esté autenticado y sea un cliente
  if (!user) {
    return (
      <Container size="md" py="xl">
        <Alert icon={<IconAlertCircle size={16} />} color="red">
          <Text>Debes iniciar sesión para crear una cita.</Text>
        </Alert>
      </Container>
    );
  }

  if (user.role === 'worker') {
    return (
      <Container size="md" py="xl">
        <Alert icon={<IconAlertCircle size={16} />} color="orange">
          <Text>Los profesionales no pueden crear citas directamente. Las citas son creadas por los clientes.</Text>
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="md" py="md">
      <div style={{ position: 'relative' }}>
        <LoadingOverlay visible={loading} />
        
        <Stack gap="lg">
          {/* Header */}
          <div>
            <Title order={1} c={isDark ? 'white' : 'dark'}>
              Nueva Cita
            </Title>
            <Text size="sm" c="dimmed">
              Programa una nueva cita virtual con tu profesional
            </Text>
          </div>

          {/* Notificaciones */}
          {notification && (
            <GlobalNotificationOverlay
              message={notification.message}
              type={notification.type}
              withCloseButton
              onClose={() => setNotification(null)}
            />
          )}

          {/* Formulario */}
          <FormularioCrearCita
            onSuccess={handleSuccess}
            onError={handleError}
            clienteId={user._id}
            clienteNombre={user.fullName}
          />
        </Stack>
      </div>
    </Container>
  );
};

export default CrearCitaPage;
