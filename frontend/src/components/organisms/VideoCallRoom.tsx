import React, { useState, useEffect } from 'react';
import {
  Box,
  Stack,
  Group,
  ActionIcon,
  Text,
  Loader,
  Center,
} from '@mantine/core';
import {
  IconUsers,
  IconMessageCircle,
  IconSettings,
  IconVolume,
  IconLayoutGrid,
} from '@tabler/icons-react';
import {
  StreamCall,
  StreamTheme,
  SpeakerLayout,
  CallControls,
  CallingState,
  useCallStateHooks,
  ParticipantView,
} from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';
import { Call, StreamVideoParticipant } from '@stream-io/video-react-sdk';

interface VideoCallRoomProps {
  call: Call;
  onEndCall: () => void;
  cameraSettings?: {
    videoEnabled: boolean;
    audioEnabled: boolean;
  };
  participants?: StreamVideoParticipant[];
  localParticipant?: StreamVideoParticipant | null;
}

// Componente interno para manejar la UI de la llamada con diseño similar a GetStream
const CallUILayout: React.FC<{ 
  onEndCall: () => void;
  cameraSettings?: { videoEnabled: boolean; audioEnabled: boolean };
  participants?: StreamVideoParticipant[];
  localParticipant?: StreamVideoParticipant | null;
}> = ({ onEndCall, cameraSettings, participants, localParticipant: customLocalParticipant }) => {
  const { 
    useCallCallingState, 
    useLocalParticipant, 
    useRemoteParticipants,
    useCallState,
  } = useCallStateHooks();
  
  const callingState = useCallCallingState();
  const streamLocalParticipant = useLocalParticipant();
  const streamRemoteParticipants = useRemoteParticipants();
  const callState = useCallState();
  
  // Usar los participantes del hook personalizado si están disponibles, sino usar los de Stream.io
  const finalParticipants = participants || streamRemoteParticipants;
  const finalLocalParticipant = customLocalParticipant || streamLocalParticipant;
  
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);

  // Aplicar configuración inicial de cámara/micrófono
  useEffect(() => {
    const applyInitialSettings = async () => {
      if (callingState === CallingState.JOINED && cameraSettings) {
        try {
          // La configuración se aplicará automáticamente cuando se cree la llamada
        } catch (err) {
          console.error('Error applying initial camera settings:', err);
        }
      }
    };

    applyInitialSettings();
  }, [callingState, cameraSettings, callState]);

  // Calcular el número total de participantes
  const totalParticipants = finalParticipants.length + (finalLocalParticipant ? 1 : 0);
  const isLastParticipant = totalParticipants <= 1;
  

  // Función para manejar salir de la llamada
  const handleEndCall = async () => {
    if (isLastParticipant) {
      // Si es el último participante, terminar la llamada completamente
      // La llamada se terminará automáticamente cuando no queden participantes
    }
    onEndCall();
  };

  if (callingState === CallingState.JOINING || callingState === CallingState.LEFT) {
    return (
      <Center p="xl">
        <Stack align="center" gap="md">
          <Loader size="lg" color="#4CAF50" />
          <Text c="white" size="lg">
            {callingState === CallingState.JOINING ? 'Uniéndose a la llamada...' : 'Saliendo de la llamada...'}
          </Text>
        </Stack>
      </Center>
    );
  }

  if (callingState === CallingState.RINGING) {
    return (
      <Center p="xl">
        <Stack align="center" gap="md">
          <Loader size="lg" color="#4CAF50" />
          <Text c="white" size="lg">Llamando...</Text>
        </Stack>
      </Center>
    );
  }

  if (callingState !== CallingState.JOINED) {
    return (
      <Center p="xl">
        <Stack align="center" gap="md">
          <Text c="white" size="lg">Estado de llamada: {callingState}</Text>
        </Stack>
      </Center>
    );
  }

  return (
    <>
      <style>
        {`
          @keyframes slideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .stream-video__call-layout {
            height: 100%;
            background: var(--mantine-color-dark-8);
          }
          .stream-video__call-controls {
            background: var(--mantine-color-dark-7);
            border-top: 1px solid var(--mantine-color-dark-4);
          }
        `}
      </style>
      
      <Box style={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        backgroundColor: 'var(--mantine-color-dark-8)',
        overflow: 'hidden'
      }}>
        {/* Header con información de la llamada */}
        <Box style={{
          padding: '12px 20px',
          backgroundColor: 'var(--mantine-color-dark-7)',
          borderBottom: '1px solid var(--mantine-color-dark-4)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Group gap="md">
            <Text c="white" size="md" fw={600}>
              Videollamada Activa
            </Text>
            <Text c="white" size="sm" opacity={0.7}>
              {totalParticipants} participante{totalParticipants !== 1 ? 's' : ''}
            </Text>
          </Group>
          
          <Group gap="xs">
            <ActionIcon
              size="sm"
              variant={showParticipants ? 'filled' : 'subtle'}
              color={showParticipants ? 'green' : 'gray'}
              onClick={() => setShowParticipants(!showParticipants)}
            >
              <IconUsers size={16} />
            </ActionIcon>
            <ActionIcon
              size="sm"
              variant={showChat ? 'filled' : 'subtle'}
              color={showChat ? 'green' : 'gray'}
              onClick={() => setShowChat(!showChat)}
            >
              <IconMessageCircle size={16} />
            </ActionIcon>
          </Group>
        </Box>

        {/* Área principal de video */}
        <Box style={{ 
          flex: 1, 
          position: 'relative', 
          display: 'flex',
          minHeight: 0,
          overflow: 'hidden'
        }}>
          {/* Video principal */}
          <Box style={{ 
            flex: 1, 
            position: 'relative',
            minHeight: 0,
            overflow: 'hidden'
          }}>
            <StreamTheme>
              <SpeakerLayout participantsBarPosition="bottom" />
            </StreamTheme>
          </Box>

          {/* Panel lateral de participantes */}
          {showParticipants && (
            <Box
              style={{
                width: 280,
                padding: '12px',
                overflowY: 'auto',
                backgroundColor: 'var(--mantine-color-dark-7)',
                borderLeft: '1px solid var(--mantine-color-dark-4)',
                animation: 'slideIn 0.3s ease-out',
                flexShrink: 0,
              }}
            >
              <Stack gap="sm">
                {/* Participante local */}
                {finalLocalParticipant && (
                  <Box
                    style={{
                      padding: '8px',
                      backgroundColor: 'var(--mantine-color-green-9)',
                      borderRadius: '8px',
                      border: '1px solid var(--mantine-color-green-6)',
                    }}
                  >
                    <Group gap="sm">
                      <Box style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden' }}>
                        <ParticipantView participant={finalLocalParticipant} />
                      </Box>
                      <Box>
                        <Text c="white" size="sm" fw={500}>
                          Tú
                        </Text>
                        <Text c="white" size="xs" opacity={0.7}>
                          {finalLocalParticipant.publishedTracks && finalLocalParticipant.publishedTracks.length > 0 ? 'Video' : 'Sin video'} • 
                          {finalLocalParticipant.publishedTracks && finalLocalParticipant.publishedTracks.length > 0 ? 'Audio' : 'Sin audio'}
                        </Text>
                      </Box>
                    </Group>
                  </Box>
                )}

                {/* Participantes remotos */}
                {finalParticipants.map((participant) => (
                  <Box
                    key={participant.sessionId}
                    style={{
                      padding: '8px',
                      backgroundColor: 'var(--mantine-color-dark-6)',
                      borderRadius: '8px',
                    }}
                  >
                    <Group gap="sm">
                      <Box style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden' }}>
                        <ParticipantView participant={participant} />
                      </Box>
                      <Box>
                        <Text c="white" size="sm" fw={500}>
                          {participant.name || 'Usuario'}
                        </Text>
                        <Text c="white" size="xs" opacity={0.7}>
                          {participant.publishedTracks && participant.publishedTracks.length > 0 ? 'Video' : 'Sin video'} • 
                          {participant.publishedTracks && participant.publishedTracks.length > 0 ? 'Audio' : 'Sin audio'}
                        </Text>
                      </Box>
                    </Group>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          {/* Panel de chat */}
          {showChat && (
            <Box
              style={{
                width: 280,
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'var(--mantine-color-dark-7)',
                borderLeft: '1px solid var(--mantine-color-dark-4)',
                animation: 'slideIn 0.3s ease-out',
                flexShrink: 0,
              }}
            >
              <Text c="white" fw={600} size="md" mb="md">
                Chat
              </Text>
              <Box
                style={{
                  flex: 1,
                  backgroundColor: 'var(--mantine-color-dark-6)',
                  borderRadius: '6px',
                  padding: '8px',
                  marginBottom: '8px',
                  overflowY: 'auto',
                  minHeight: '120px',
                }}
              >
                <Text c="white" size="sm" opacity={0.7} ta="center">
                  El chat estará disponible próximamente
                </Text>
              </Box>
            </Box>
          )}
        </Box>

        {/* Barra de controles personalizada */}
        <Box
          style={{
            padding: '12px 20px',
            backgroundColor: 'var(--mantine-color-dark-7)',
            borderTop: '1px solid var(--mantine-color-dark-4)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          {/* Controles izquierdos */}
          <Group gap="xs">
            <ActionIcon size="md" variant="subtle" color="gray">
              <IconSettings size={18} />
            </ActionIcon>
            <ActionIcon size="md" variant="subtle" color="gray">
              <IconVolume size={18} />
            </ActionIcon>
            <ActionIcon 
              size="md" 
              variant="subtle" 
              color="gray"
              disabled
              title="Layout de Speaker (único disponible)"
            >
              <IconLayoutGrid size={18} />
            </ActionIcon>
          </Group>

          {/* Controles centrales - Stream.io CallControls */}
          <StreamTheme>
            <CallControls onLeave={handleEndCall} />
          </StreamTheme>

          {/* Información de estado */}
          <Text c="white" size="sm" opacity={0.7}>
            {isLastParticipant ? 'Último participante' : `${totalParticipants} en la llamada`}
          </Text>
        </Box>
      </Box>
    </>
  );
};

export const VideoCallRoom: React.FC<VideoCallRoomProps> = ({
  call,
  onEndCall,
  cameraSettings,
  participants,
  localParticipant,
}) => {
  return (
    <StreamCall call={call}>
      <CallUILayout 
        onEndCall={onEndCall} 
        cameraSettings={cameraSettings}
        participants={participants}
        localParticipant={localParticipant}
      />
    </StreamCall>
  );
};
