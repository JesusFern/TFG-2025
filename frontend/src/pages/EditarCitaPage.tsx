import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Title, Text, Stack, Alert, LoadingOverlay, Button, Group } from '@mantine/core';
import { useAuth } from '../hooks/useAuth';
import { useThemeDetection } from '../hooks/useThemeDetection';
import { CitaService } from '../services/citaService';
import GlobalNotificationOverlay from '../components/atoms/GlobalNotificationOverlay';
import FormularioEditarCita from '../components/forms/citas/FormularioEditarCita';
import { Cita } from '../types/citas';
import { IconArrowLeft, IconAlertCircle } from '@tabler/icons-react';

const EditarCitaPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isDark = useThemeDetection();
  
  const [cita, setCita] = useState<Cita | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Cargar cita
  useEffect(() => {
    const cargarCita = async () => {
      if (!id) {
        setError('ID de cita no válido');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const citaData = await CitaService.obtenerCitaPorId(id);
        setCita(citaData);
      } catch (error) {
        console.error('Error al cargar cita:', error);
        setError('Error al cargar la cita');
      } finally {
        setLoading(false);
      }
    };

    cargarCita();
  }, [id]);

  const handleSuccess = () => {
    setNotification({
      type: 'success',
      message: 'Cita actualizada exitosamente'
    });
    
    // Redirigir después de un breve delay
    setTimeout(() => {
      navigate('/citas');
    }, 200);
  };

  const handleError = (error: Error) => {
    console.error('Error al actualizar cita:', error);
    setNotification({
      type: 'error',
      message: error.message || 'Error al actualizar la cita'
    });
  };

  const handleCancel = () => {
    navigate('/citas');
  };

  // Verificar permisos
  const puedeEditar = cita && (
    user?.role === 'admin' ||
    cita.cliente._id === user?._id ||
    cita.profesional._id === user?._id
  );

  if (loading) {
    return (
      <Container size="md" py="xl">
        <LoadingOverlay visible={true} />
      </Container>
    );
  }

  if (error || !cita) {
    return (
      <Container size="md" py="xl">
        <Stack gap="md">
          <Alert icon={<IconAlertCircle size={16} />} color="red">
            <Text>{error || 'Cita no encontrada'}</Text>
          </Alert>
          <Button
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate('/citas')}
          >
            Volver a Citas
          </Button>
        </Stack>
      </Container>
    );
  }

  if (!puedeEditar) {
    return (
      <Container size="md" py="xl">
        <Stack gap="md">
          <Alert icon={<IconAlertCircle size={16} />} color="orange">
            <Text>No tienes permisos para editar esta cita.</Text>
          </Alert>
          <Button
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate('/citas')}
          >
            Volver a Citas
          </Button>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="md" py="md">
      <div style={{ position: 'relative' }}>
        <LoadingOverlay visible={saving} />
        
        <Stack gap="lg">
          {/* Header */}
          <Group justify="space-between" align="center">
            <div>
              <Title order={1} c={isDark ? 'white' : 'dark'}>
                Editar Cita
              </Title>
              <Text size="sm" c="dimmed">
                Modifica los detalles de tu cita
              </Text>
            </div>
            
            <Button
              variant="outline"
              leftSection={<IconArrowLeft size={16} />}
              onClick={handleCancel}
              disabled={saving}
            >
              Volver
            </Button>
          </Group>

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
          <FormularioEditarCita
            cita={cita}
            onSuccess={handleSuccess}
            onError={handleError}
            onCancel={handleCancel}
          />
        </Stack>
      </div>
    </Container>
  );
};

export default EditarCitaPage;
