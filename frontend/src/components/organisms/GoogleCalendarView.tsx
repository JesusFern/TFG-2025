import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Title,
  Text,
  Button,
  Group,
  Stack,
  Loader,
  Alert,
  Badge
} from '@mantine/core';
import { useGoogleCalendar } from '../../hooks/useGoogleCalendar';
import {
  IconCalendar,
  IconPlugConnected,
  IconPlugConnectedX,
  IconCheck,
  IconAlertCircle
} from '@tabler/icons-react';
import MantineCalendarView from './MantineCalendarView';

interface GoogleCalendarViewProps {
  className?: string;
}

const GoogleCalendarView: React.FC<GoogleCalendarViewProps> = ({ className }) => {
  const {
    isConnected,
    isConnecting,
    loading,
    error,
    connectToGoogle,
    clearError
  } = useGoogleCalendar();

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Mostrar mensaje de éxito cuando se conecta
  useEffect(() => {
    if (isConnected && !isConnecting && !loading && window.location.search.includes('code=')) {
      setShowSuccessMessage(true);
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isConnected, isConnecting, loading]);

  // Si está cargando el callback de Google, mostrar loading
  if (loading && window.location.search.includes('code=')) {
    return (
      <Container size="md" py="xl">
        <Paper p="xl" radius="lg" withBorder>
          <Stack align="center" gap="lg">
            <Loader size="lg" />
            <Title order={2} ta="center">
              Conectando con Google Calendar...
            </Title>
            <Text ta="center" c="dimmed" size="lg">
              Procesando tu autorización, por favor espera.
            </Text>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl" className={className}>
      <Stack gap="xl">
        {/* Header */}
        <Paper p="lg" radius="lg" withBorder>
          <Group justify="space-between" align="center">
            <div>
              <Group gap="sm" mb="xs">
                <IconCalendar size={32} />
                <Title order={1}>Google Calendar</Title>
              </Group>
              <Text c="dimmed" size="lg">
                Sincroniza y gestiona tus eventos con Google Calendar
              </Text>
            </div>
            <Group gap="sm">
              {isConnected ? (
                <Badge
                  leftSection={<IconPlugConnected size={12} />}
                  color="green"
                  variant="light"
                >
                  Conectado
                </Badge>
              ) : (
                <Button
                  leftSection={<IconPlugConnectedX size={16} />}
                  onClick={connectToGoogle}
                  loading={isConnecting}
                  variant="light"
                >
                  Conectar
                </Button>
              )}
            </Group>
          </Group>
        </Paper>

        {/* Success Alert */}
        {showSuccessMessage && (
          <Alert
            icon={<IconCheck size={16} />}
            title="¡Conectado exitosamente!"
            color="green"
            variant="light"
            withCloseButton
            onClose={() => setShowSuccessMessage(false)}
          >
            Tu Google Calendar se ha conectado correctamente. Los eventos se han sincronizado.
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Error"
            color="red"
            variant="light"
            withCloseButton
            onClose={clearError}
          >
            {error}
          </Alert>
        )}

        {/* Vista del Calendario */}
        <MantineCalendarView />
      </Stack>
    </Container>
  );
};

export default GoogleCalendarView;