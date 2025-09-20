import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  Box,
  Stack,
  Group,
  ActionIcon,
  Text,
  Alert,
  Center,
  Paper,
  Button,
  Title,
  Badge,
  Divider,
} from '@mantine/core';
import {
  IconPhoneOff,
  IconVideo,
  IconVideoOff,
  IconMicrophone,
  IconMicrophoneOff,
  IconAlertCircle,
  IconPhone,
  IconCheck,
  IconX,
  IconSettings,
} from '@tabler/icons-react';
import { useVideo } from '../../hooks/useVideo';
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
  callType = 'start',
  onJoinCall,
}) => {
  const { client, isConnected, error: videoError } = useVideo();
  const [showCameraPreview, setShowCameraPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para la previsualización de cámara
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const handleStartCall = () => {
    setShowCameraPreview(true);
  };

  // Inicializar cámara cuando se muestre la previsualización
  useEffect(() => {
    if (showCameraPreview) {
      const initializeCamera = async () => {
        try {
          setIsLoading(true);
          setCameraError(null);

          const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });

          streamRef.current = mediaStream;
        } catch (err) {
          console.error('Error accessing camera/microphone:', err);
          setCameraError('No se pudo acceder a la cámara o micrófono. Verifica los permisos.');
        } finally {
          setIsLoading(false);
        }
      };

      initializeCamera();

      // Cleanup function
      return () => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };
    }
  }, [showCameraPreview]);

  // Asignar stream al video element cuando esté disponible
  useEffect(() => {
    if (streamRef.current && videoRef.current && showCameraPreview) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(e => console.log('Error al reproducir video:', e));
    }
  }, [showCameraPreview]);

  // Asignar stream cuando el video element se monte
  useEffect(() => {
    if (videoRef.current && streamRef.current && showCameraPreview) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(e => console.log('Error al reproducir video:', e));
    }
  }, [showCameraPreview]);

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const handleJoinWithSettings = async () => {
    try {
      setError(null);
      setShowCameraPreview(false);
      
      // Limpiar stream antes de unirse
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      await onJoinCall({ videoEnabled, audioEnabled });
    } catch (err) {
      console.error('Error joining call:', err);
      setError(err instanceof Error ? err.message : 'Error al unirse a la videollamada');
      setShowCameraPreview(true); // Volver a la previsualización si hay error
    }
  };

  const handleCancelPreview = () => {
    // Limpiar stream al cancelar
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCameraPreview(false);
  };

  // Cleanup específico cuando se cierra el modal
  const handleCloseModal = () => {
    // Limpiar stream al cerrar modal
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCameraPreview(false);
    setError(null);
    setCameraError(null);
    onClose();
  };

  // Cleanup cuando se desmonta el componente o cambia showCameraPreview
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // Si no hay cliente de video conectado, mostrar mensaje de error
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
      onClose={handleCloseModal}
      size="lg"
      centered
      zIndex={1000}
      title={
        <Group gap="sm">
          <IconVideo size={20} color="#4CAF50" />
          <Text size="lg" fw={600}>
            {callType === 'start' ? 'Iniciar Videollamada' : 'Unirse a Videollamada'}
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
      {/* Mostrar errores si los hay */}
      {error && (
        <Alert 
          icon={<IconAlertCircle size={16} />} 
          title="Error" 
          color="red" 
          style={{ margin: '16px', marginBottom: 0 }}
        >
          {error}
        </Alert>
      )}

      {showCameraPreview ? (
        /* Pantalla de previsualización de cámara con diseño mejorado */
        <Box p="xl">
          <Stack gap="xl">
            {/* Header de configuración */}
            <Paper p="lg" radius="md" withBorder>
              <Stack gap="md">
                <Group justify="space-between" align="center">
                  <Title order={4}>
                    Configuración de Dispositivos
                  </Title>
                  <Badge color="blue" variant="light">
                    Previsualización
                  </Badge>
                </Group>
                <Text size="sm" c="dimmed">
                  Ajusta tu cámara y micrófono antes de unirte a la videollamada
                </Text>
              </Stack>
            </Paper>

            {/* Video Preview */}
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
                                  el.play().catch(e => console.log('Error al reproducir desde ref callback:', e));
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
                                  videoRef.current.play().catch(e => console.log('Error al reproducir en onLoadedMetadata:', e));
                                }
                              }}
                            />
                  )}
                </Box>
              </Stack>
            </Paper>

            {/* Controles */}
            <Paper p="lg" radius="md" withBorder>
              <Stack gap="lg">
                <Text size="sm" fw={500}>
                  Controles de Dispositivos
                </Text>
                
                <Group justify="center" gap="xl">
                  {/* Control de Video */}
                  <Stack align="center" gap="sm">
                    <ActionIcon
                      size="xl"
                      radius="xl"
                      variant={videoEnabled ? 'filled' : 'outline'}
                      color={videoEnabled ? 'green' : 'red'}
                      onClick={toggleVideo}
                      disabled={isLoading || !!cameraError}
                    >
                      {videoEnabled ? <IconVideo size={24} /> : <IconVideoOff size={24} />}
                    </ActionIcon>
                    <Text size="sm" c={videoEnabled ? 'green' : 'red'} fw={500}>
                      {videoEnabled ? 'Cámara ON' : 'Cámara OFF'}
                    </Text>
                  </Stack>

                  {/* Control de Audio */}
                  <Stack align="center" gap="sm">
                    <ActionIcon
                      size="xl"
                      radius="xl"
                      variant={audioEnabled ? 'filled' : 'outline'}
                      color={audioEnabled ? 'green' : 'red'}
                      onClick={toggleAudio}
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
                <Group justify="space-between">
                  <Button
                    variant="outline"
                    color="red"
                    leftSection={<IconX size={16} />}
                    onClick={handleCancelPreview}
                  >
                    Cancelar
                  </Button>
                  
                  <Button
                    color="green"
                    leftSection={<IconCheck size={16} />}
                    onClick={handleJoinWithSettings}
                    disabled={isLoading || !!cameraError}
                    loading={isLoading}
                  >
                    Unirse a la Llamada
                  </Button>
                </Group>
              </Stack>
            </Paper>
          </Stack>
        </Box>
      ) : (
        /* Pantalla de inicio */
        <Box p="xl">
          <Stack gap="xl" align="center">
            {/* Icono principal */}
            <Paper p="xl" radius="xl" style={{ 
              backgroundColor: 'rgba(76, 175, 80, 0.1)', 
              border: '2px solid rgba(76, 175, 80, 0.3)',
            }}>
              <IconVideo size={80} color="#4CAF50" />
            </Paper>

            {/* Información */}
            <Stack gap="md" align="center">
              <Title order={3} ta="center">
                {callType === 'start' ? 'Iniciar Videollamada' : 'Unirse a Videollamada'}
              </Title>
              <Text size="md" c="dimmed" ta="center" maw={400}>
                Configura tu cámara y micrófono antes de unirte para asegurar la mejor experiencia
              </Text>
            </Stack>

            {/* Botones de acción */}
            <Group gap="md" mt="md">
              <Button
                size="lg"
                variant="filled"
                color="green"
                leftSection={<IconPhone size={20} />}
                onClick={handleStartCall}
                radius="xl"
              >
                Configurar Dispositivos
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                color="red"
                leftSection={<IconPhoneOff size={20} />}
                onClick={handleCloseModal}
                radius="xl"
              >
                Cancelar
              </Button>
            </Group>

            {/* Información adicional */}
            <Paper p="md" radius="md" withBorder>
              <Group gap="sm">
                <IconSettings size={16} />
                <Text size="sm" c="dimmed">
                  Se solicitarán permisos para acceder a tu cámara y micrófono
                </Text>
              </Group>
            </Paper>
          </Stack>
        </Box>
      )}
    </Modal>
  );
};
