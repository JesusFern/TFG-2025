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
  IconMessage,
  IconUser,
} from '@tabler/icons-react';
import { useVideo } from '../../hooks/useVideo';
import { useCameraPreview } from '../../hooks/useCameraPreview';
import { CameraPreview } from '../atoms/CameraPreview';
import { VideoCallInitialView } from '../atoms/VideoCallInitialView';
import { Conversacion } from '../../types/chat';

interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversacion: Conversacion | null;
  callType?: 'start' | 'join';
  callId?: string;
  onJoinCall: (settings: { videoEnabled: boolean; audioEnabled: boolean }) => Promise<void>;
}

export const VideoCallModal: React.FC<VideoCallModalProps> = ({
  isOpen,
  onClose,
  conversacion,
  callType = 'start',
  onJoinCall,
}) => {
  const { client, isConnected, error: videoError } = useVideo();
  const cameraPreview = useCameraPreview(onClose);

  // Componente para mostrar información de la conversación
  const ConversacionInfo = () => {
    if (!conversacion) return null;

    return (
      <Paper p="md" radius="md" withBorder>
        <Stack gap="sm">
          <Group gap="sm">
            <IconMessage size={20} color="var(--mantine-color-blue-6)" />
            <Text fw={600} size="md">
              Conversación
            </Text>
          </Group>
          
          <Group gap="sm">
            <IconUser size={16} color="var(--mantine-color-gray-6)" />
            <Text size="sm" c="dimmed">
              {conversacion.participantes?.map(p => p.fullName).join(', ') || 'Sin participantes'}
            </Text>
          </Group>
          
          <Text size="sm" c="dimmed">
            {conversacion.ultimoMensaje || 'Sin mensajes'}
          </Text>
        </Stack>
      </Paper>
    );
  };

  // Determinar el título y subtítulo según el tipo de llamada
  const getCallInfo = () => {
    if (callType === 'join') {
      return {
        title: "Unirse a Videollamada",
        subtitle: "Configura tu cámara y micrófono antes de unirte a la videollamada existente",
        buttonText: "Unirse a Videollamada"
      };
    }
    
    return {
      title: "Iniciar Videollamada",
      subtitle: "Configura tu cámara y micrófono antes de iniciar la videollamada",
      buttonText: "Iniciar Videollamada"
    };
  };

  const callInfo = getCallInfo();

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
            {callInfo.title}
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
            {/* Información de la conversación */}
            <ConversacionInfo />

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
              joinButtonText={callInfo.buttonText}
              joinButtonIcon={<IconCheck size={16} />}
            />
          </Stack>
        </Box>
      ) : (
        <Box p="xl">
          <Stack gap="xl" align="center">
            {/* Información de la conversación */}
            <ConversacionInfo />

            <VideoCallInitialView
              onStartCall={cameraPreview.handleStartCall}
              onCloseModal={onClose}
              title={callInfo.title}
              subtitle={callInfo.subtitle}
            />
          </Stack>
        </Box>
      )}
    </Modal>
  );
};