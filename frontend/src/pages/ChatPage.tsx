import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Modal,
  Stack,
  Select,
  Button,
  Group,
  Text,
  Loader,
  Center
} from '@mantine/core';
import { ChatSidebar } from '../components/organisms/ChatSidebar';
import { ChatMain } from '../components/organisms/ChatMain';
import { VideoCallModal } from '../components/organisms/VideoCallModal';
import { VideoCallRoom } from '../components/organisms/VideoCallRoom';
import { useVideoCall } from '../hooks/useVideoCall';
import { useChat } from '../hooks/useChat';
import { useAuth } from '../hooks/useAuth';
import { CrearMensajeDTO } from '../types/chat';
import { chatService } from '../services/chatService';


export const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const {
    conversaciones,
    conversacionActiva,
    mensajes,
    isLoading,
    error,
    seleccionarConversacion,
    enviarMensaje,
    crearConversacion,
    archivarConversacion,
    eliminarConversacion,
    eliminarMensaje,
    refreshConversaciones
  } = useChat();
  console.log('[ChatPage] render', {
    userId: user?._id,
    conversaciones: conversaciones?.length,
    conversacionActiva: conversacionActiva?._id,
    mensajes: mensajes?.length,
    isLoading,
    error
  });
  
  
  
  // Estado para nueva conversación
  const [showNuevaConversacion, setShowNuevaConversacion] = useState(false);
  const [nuevoParticipante, setNuevoParticipante] = useState('');
  const [nuevoTipo, setNuevoTipo] = useState<'general' | 'entrenamiento' | 'nutricion' | 'consulta'>('general');
  const [nuevaConvError, setNuevaConvError] = useState<string | null>(null);
  const [usuarios, setUsuarios] = useState<Array<{ _id: string; fullName: string; email: string; role: string }>>([]);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(false);

  // Estado para videollamadas
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [videoCallType, setVideoCallType] = useState<'start' | 'join'>('start');
  const [videoCallId, setVideoCallId] = useState<string | undefined>();
  const [showVideoRoom, setShowVideoRoom] = useState(false);
  const [cameraSettings, setCameraSettings] = useState<{ videoEnabled: boolean; audioEnabled: boolean } | undefined>();

  // Hook para videollamadas
  const {
    call,
    startCallWithSettings,
    endCall,
  } = useVideoCall({
    conversation: conversacionActiva || undefined,
    callType: videoCallType,
    callId: videoCallId,
    onCallEnded: () => {
      setShowVideoRoom(false);
      setCameraSettings(undefined);
    },
    onCallStarted: () => {
      setShowVideoRoom(true);
      setShowVideoCall(false);
    },
  });

  // Obtener la conversación activa
  const conversacionActivaId = conversacionActiva?._id || null;

  const cargarUsuarios = useCallback(async () => {
    try {
      setCargandoUsuarios(true);
      
      if (!user?._id || !user?.role) {
        setNuevaConvError('Usuario no autenticado');
        return;
      }

      // Cargar usuarios según el rol
      let usuariosData;
      if (user.role === 'admin') {
        // Los administradores ven todos los usuarios
        usuariosData = await chatService.users.getAllUsers();
      } else {
        // Los usuarios y workers solo ven sus asignaciones
        usuariosData = await chatService.users.getAssignedUsers(user._id, user.role);
      }
      
      setUsuarios(usuariosData);
      
      // Si no hay usuarios asignados, mostrar mensaje
      if (usuariosData.length === 0) {
        setNuevaConvError(
          user.role === 'worker' 
            ? 'No tienes clientes asignados' 
            : 'No tienes profesionales asignados'
        );
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      setNuevaConvError('Error al cargar la lista de usuarios');
    } finally {
      setCargandoUsuarios(false);
    }
  }, [user?._id, user?.role]);

  // Cargar usuarios cuando se abre el modal
  useEffect(() => {
    if (showNuevaConversacion && usuarios.length === 0) {
      cargarUsuarios();
    }
  }, [showNuevaConversacion, usuarios.length, cargarUsuarios]);

  // Manejar envío de mensaje
  const handleSendMessage = async (data: CrearMensajeDTO) => {
    await enviarMensaje(data);
  };

  // Manejar nueva conversación
  const handleNuevaConversacion = async () => {
    if (!nuevoParticipante.trim()) {
      setNuevaConvError('Por favor selecciona un participante');
      return;
    }

    if (!user?._id) {
      setNuevaConvError('Error: Usuario no autenticado');
      return;
    }

    try {
      setNuevaConvError(null); // Limpiar errores previos
      
      await crearConversacion({
        participantes: [nuevoParticipante, user._id],
        metadata: { tipo: nuevoTipo }
      });
      
      setShowNuevaConversacion(false);
      setNuevoParticipante('');
      setNuevoTipo('general');
      setNuevaConvError(null);
      
      // Refrescar la lista para garantizar que aparezca
      await refreshConversaciones();
    } catch (err) {
      console.error('Error creating conversation:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setNuevaConvError(`No se pudo crear la conversación: ${errorMessage}`);
    }
  };

  // Manejar refrescar conversaciones
  const handleRefreshConversaciones = async () => {
    await refreshConversaciones();
  };

  // Manejar videollamada
  const handleVideoCall = () => {
    setVideoCallType('start');
    setVideoCallId(undefined);
    setShowVideoCall(true);
  };

  // Manejar cerrar videollamada
  const handleCloseVideoCall = () => {
    setShowVideoCall(false);
    setVideoCallId(undefined);
  };

  // Manejar unirse a videollamada con configuración
  const handleJoinVideoCall = async (settings: { videoEnabled: boolean; audioEnabled: boolean }) => {
    setCameraSettings(settings);
    await startCallWithSettings(settings);
  };

  // Manejar cerrar sala de videollamada
  const handleCloseVideoRoom = async () => {
    await endCall();
    setShowVideoRoom(false);
    setCameraSettings(undefined);
  };

  // Si hay una videollamada activa, mostrar la sala de video
  if (showVideoRoom && call) {
    return (
      <VideoCallRoom
        call={call}
        onEndCall={handleCloseVideoRoom}
        cameraSettings={cameraSettings}
      />
    );
  }

  return (
    <Box style={{ height: '100vh', display: 'flex' }}>
      {/* Sidebar con conversaciones */}
      <ChatSidebar
        conversaciones={conversaciones}
        conversacionActiva={conversacionActivaId}
        onSelectConversacion={(id) => {
          seleccionarConversacion(id);
        }}
        onNuevaConversacion={() => setShowNuevaConversacion(true)}
        onRefreshConversaciones={handleRefreshConversaciones}
        // onArchiveConversacion={archivarConversacion}
        // onDeleteConversacion={eliminarConversacion}
      />

      {/* Área principal del chat */}
      <Box style={{ flex: 1 }}>
        {conversacionActiva ? (
          <ChatMain
            conversacion={conversacionActiva}
            mensajes={mensajes}
            usuarioActual={user}
            isLoading={isLoading}
            error={error}
            onSendMessage={handleSendMessage}
            onReply={(mensajeId: string) => console.log('Reply to:', mensajeId)}
            onDelete={eliminarMensaje}
            onArchive={() => console.log('Archive')}
            onSearch={() => console.log('Search')}
            onInfo={() => console.log('Info')}
            onArchiveConversacion={() => conversacionActiva && archivarConversacion(conversacionActiva._id)}
            onDeleteConversacion={() => conversacionActiva && eliminarConversacion(conversacionActiva._id)}
            onMute={() => console.log('Mute')}
            onPin={() => console.log('Pin')}
            onCall={() => console.log('Call')}
            onVideoCall={handleVideoCall}
          />
        ) : (
          <Box style={{ 
            flex: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '20px'
          }}>
            <Stack gap="lg" align="center">
              <Text size="xl" fw={600} c="dimmed">
                Selecciona una conversación para comenzar a chatear
              </Text>
              <Text size="md" c="dimmed" ta="center">
                O crea una nueva conversación usando el botón "Nueva" en el sidebar
              </Text>
            </Stack>
          </Box>
        )}
      </Box>

      {/* Modal para nueva conversación */}
      <Modal
        opened={showNuevaConversacion}
        onClose={() => setShowNuevaConversacion(false)}
        title="Nueva conversación"
        size="md"
      >
        <Stack gap="md">
          {nuevaConvError && (
            <Text c="red" size="sm">{nuevaConvError}</Text>
          )}
          {cargandoUsuarios ? (
            <Center p="md">
              <Loader size="sm" />
            </Center>
          ) : (
            <Select
              label={
                user?.role === 'worker' 
                  ? "Cliente asignado" 
                  : user?.role === 'admin' 
                    ? "Participante" 
                    : "Profesional asignado"
              }
              placeholder={
                user?.role === 'worker' 
                  ? "Selecciona un cliente" 
                  : user?.role === 'admin' 
                    ? "Selecciona un usuario" 
                    : "Selecciona un profesional"
              }
              value={nuevoParticipante}
              onChange={(value) => setNuevoParticipante(value || '')}
              data={usuarios.map(u => ({
                value: u._id,
                label: `${u.fullName} (${u.email}) - ${u.role}`
              }))}
              searchable
              clearable
              required
            />
          )}
          
          <Select
            label="Tipo de conversación"
            data={[
              { value: 'general', label: 'General' },
              { value: 'entrenamiento', label: 'Entrenamiento' },
              { value: 'nutricion', label: 'Nutrición' },
              { value: 'consulta', label: 'Consulta' }
            ]}
            value={nuevoTipo}
            onChange={(value) => setNuevoTipo(value as 'general' | 'entrenamiento' | 'nutricion' | 'consulta')}
            required
          />
          
          <Group justify="flex-end" gap="sm">
            <Button variant="light" onClick={() => setShowNuevaConversacion(false)}>
              Cancelar
            </Button>
            <Button onClick={handleNuevaConversacion}>
              Crear conversación
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Modal de videollamada */}
      <VideoCallModal
        isOpen={showVideoCall}
        onClose={handleCloseVideoCall}
        conversacion={conversacionActiva}
        callType={videoCallType}
        callId={videoCallId}
        onJoinCall={handleJoinVideoCall}
      />
    </Box>
  );
};
