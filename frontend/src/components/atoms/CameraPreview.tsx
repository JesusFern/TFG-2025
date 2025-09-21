import React from 'react';
import {
  Paper,
  Stack,
  Text,
  Box,
  Center,
  ActionIcon,
  Group,
  Divider,
  Button,
} from '@mantine/core';
import {
  IconVideo,
  IconVideoOff,
  IconMicrophone,
  IconMicrophoneOff,
  IconAlertCircle,
  IconCheck,
  IconX,
} from '@tabler/icons-react';

interface CameraPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  streamRef: React.RefObject<MediaStream | null>;
  showCameraPreview: boolean;
  isLoading: boolean;
  cameraError: string | null;
  videoEnabled: boolean;
  audioEnabled: boolean;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  onJoinWithSettings: () => Promise<void>;
  onCancelPreview: () => void;
  joinButtonText?: string;
  joinButtonIcon?: React.ReactNode;
}

export const CameraPreview: React.FC<CameraPreviewProps> = ({
  videoRef,
  streamRef,
  showCameraPreview,
  isLoading,
  cameraError,
  videoEnabled,
  audioEnabled,
  onToggleVideo,
  onToggleAudio,
  onJoinWithSettings,
  onCancelPreview,
  joinButtonText = "Unirse a Videollamada",
  joinButtonIcon = <IconCheck size={16} />,
}) => {
  return (
    <Paper p="lg" radius="md" withBorder>
      <Stack gap="md">
        <Text size="sm" fw={500}>
          Previsualización de Cámara
        </Text>
        <Box
          style={{
            width: '100%',
            height: 200,
            backgroundColor: 'var(--mantine-color-gray-9)',
            borderRadius: 'var(--mantine-radius-md)',
            overflow: 'hidden',
            position: 'relative',
            border: '2px solid var(--mantine-color-gray-4)',
          }}
        >
          {isLoading ? (
            <Center style={{ height: '100%' }}>
              <Stack align="center" gap="sm">
                <Text size="sm">Cargando cámara...</Text>
              </Stack>
            </Center>
          ) : cameraError ? (
            <Center style={{ height: '100%' }}>
              <Stack align="center" gap="sm">
                <IconAlertCircle size={32} color="red" />
                <Text c="red" size="sm" ta="center">{cameraError}</Text>
              </Stack>
            </Center>
          ) : (
            <video
              ref={(el) => {
                videoRef.current = el;
                if (el && streamRef.current && showCameraPreview) {
                  el.srcObject = streamRef.current;
                  el.play().catch(() => {});
                }
              }}
              autoPlay
              muted
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: 'scaleX(-1)', // Mirror effect
              }}
              onLoadedMetadata={() => {
                if (videoRef.current && streamRef.current && !videoRef.current.srcObject) {
                  videoRef.current.srcObject = streamRef.current;
                }
                if (videoRef.current) {
                  videoRef.current.play().catch(() => {});
                }
              }}
            />
          )}
        </Box>

        {/* Controles de cámara y micrófono */}
        <Group justify="center" gap="xl">
          <Stack align="center" gap="sm">
            <ActionIcon
              size="xl"
              radius="xl"
              variant={videoEnabled ? 'filled' : 'outline'}
              color={videoEnabled ? 'green' : 'red'}
              onClick={onToggleVideo}
              disabled={isLoading || !!cameraError}
            >
              {videoEnabled ? <IconVideo size={24} /> : <IconVideoOff size={24} />}
            </ActionIcon>
            <Text size="sm" c={videoEnabled ? 'green' : 'red'} fw={500}>
              {videoEnabled ? 'Cámara ON' : 'Cámara OFF'}
            </Text>
          </Stack>
          <Stack align="center" gap="sm">
            <ActionIcon
              size="xl"
              radius="xl"
              variant={audioEnabled ? 'filled' : 'outline'}
              color={audioEnabled ? 'green' : 'red'}
              onClick={onToggleAudio}
              disabled={isLoading || !!cameraError}
            >
              {audioEnabled ? <IconMicrophone size={24} /> : <IconMicrophoneOff size={24} />}
            </ActionIcon>
            <Text size="sm" c={audioEnabled ? 'green' : 'red'} fw={500}>
              {audioEnabled ? 'Micrófono ON' : 'Micrófono OFF'}
            </Text>
          </Stack>
        </Group>
        <Divider />

        {/* Botones de acción */}
        <Group justify="center" gap="md">
          <Button
            color="green"
            leftSection={joinButtonIcon}
            onClick={onJoinWithSettings}
            disabled={isLoading || !!cameraError}
          >
            {joinButtonText}
          </Button>
          <Button
            variant="outline"
            color="red"
            leftSection={<IconX size={16} />}
            onClick={onCancelPreview}
          >
            Cancelar
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
};
