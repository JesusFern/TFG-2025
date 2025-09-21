import React from 'react';
import {
  Modal,
  Box,
  Stack,
  Group,
  Text,
  Alert,
  Paper,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconVideo,
  IconCheck,
  IconCalendar,
  IconUser,
} from '@tabler/icons-react';
import { useVideo } from '../../hooks/useVideo';
import { useCameraPreview } from '../../hooks/useCameraPreview';
import { CameraPreview } from '../atoms/CameraPreview';
import { VideoCallInitialView } from '../atoms/VideoCallInitialView';
import { Cita } from '../../types/citas';

interface VideoCallModalCitasProps {
  isOpen: boolean;
  onClose: () => void;
  cita: Cita | null;
  callId?: string;
  onJoinCall: (settings: { videoEnabled: boolean; audioEnabled: boolean }) => Promise<void>;
}

export const VideoCallModalCitas: React.FC<VideoCallModalCitasProps> = ({
  isOpen,
  onClose,
  cita,
  onJoinCall,
}) => {
  const { client, isConnected, error: videoError } = useVideo();
  const cameraPreview = useCameraPreview(onClose);

  // Función para formatear fecha y hora
  const formatFechaHora = (fecha: string, hora: string) => {
    const fechaObj = new Date(fecha);
    const fechaFormateada = fechaObj.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    return `${fechaFormateada} a las ${hora}`;
  };

  // Componente para mostrar información de la cita
  const CitaInfo = () => {
    if (!cita) return null;

    return (
      <Paper p="md" radius="md" withBorder>
        <Stack gap="sm">
          <Group gap="sm">
            <IconCalendar size={20} color="var(--mantine-color-blue-6)" />
            <Text fw={600} size="md">
              {cita.tipo.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Text>
          </Group>
          
          <Group gap="sm">
            <IconUser size={16} color="var(--mantine-color-gray-6)" />
            <Text size="sm" c="dimmed">
              {cita.profesional?.fullName || 'Profesional no disponible'}
            </Text>
          </Group>
          
          <Text size="sm" c="dimmed">
            {formatFechaHora(cita.fecha, cita.hora)}
          </Text>
        </Stack>
      </Paper>
    );
  };

  if (!client || !isConnected || videoError) {
    return (
      <Modal
        opened={isOpen}
        onClose={onClose}
        size="md"
        centered
        zIndex={1000}
        title="Error de Conexión"
      >
        <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
          {videoError || 'No se pudo conectar al servicio de video. Por favor, intenta de nuevo.'}
        </Alert>
      </Modal>
    );
  }

  return (
    <Modal
      opened={isOpen}
      onClose={cameraPreview.handleCloseModal}
      size="lg"
      centered
      zIndex={1000}
      title={
        <Group gap="sm">
          <IconVideo size={20} color="#4CAF50" />
          <Text size="lg" fw={600}>
            Iniciar Videollamada de Cita
          </Text>
        </Group>
      }
      styles={{
        content: {
          borderRadius: 'var(--mantine-radius-lg)',
        },
        header: {
          backgroundColor: 'var(--mantine-color-body)',
          borderBottom: '1px solid var(--mantine-color-gray-3)',
        },
        body: {
          backgroundColor: 'var(--mantine-color-body)',
          padding: 0,
        },
      }}
    >
      {/* Error de conexión */}
      {cameraPreview.error && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" m="md">
          {cameraPreview.error}
        </Alert>
      )}

      {cameraPreview.showCameraPreview ? (
        <Box p="xl">
          <Stack gap="xl">
            {/* Información de la cita */}
            <CitaInfo />

            {/* Previsualización de cámara */}
            <CameraPreview
              videoRef={cameraPreview.videoRef}
              streamRef={cameraPreview.streamRef}
              showCameraPreview={cameraPreview.showCameraPreview}
              isLoading={cameraPreview.isLoading}
              cameraError={cameraPreview.cameraError}
              videoEnabled={cameraPreview.videoEnabled}
              audioEnabled={cameraPreview.audioEnabled}
              onToggleVideo={cameraPreview.toggleVideo}
              onToggleAudio={cameraPreview.toggleAudio}
              onJoinWithSettings={() => cameraPreview.handleJoinWithSettings(onJoinCall)}
              onCancelPreview={cameraPreview.handleCancelPreview}
              onCloseModal={cameraPreview.handleCloseModal}
              joinButtonText="Iniciar Videollamada"
              joinButtonIcon={<IconCheck size={16} />}
            />
          </Stack>
        </Box>
      ) : (
        <Box p="xl">
          <Stack gap="xl" align="center">
            {/* Información de la cita */}
            <CitaInfo />

            <VideoCallInitialView
              onStartCall={cameraPreview.handleStartCall}
              onCloseModal={cameraPreview.handleCloseModal}
              title="Iniciar Videollamada de Cita"
              subtitle="Configura tu cámara y micrófono antes de unirte para asegurar la mejor experiencia"
            />
          </Stack>
        </Box>
      )}
    </Modal>
  );
};