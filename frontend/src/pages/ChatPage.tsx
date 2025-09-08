import React, { useState } from 'react';
import { 
  Box, 
  Modal,
  Stack,
  TextInput,
  Select,
  Button,
  Group,
  Text
} from '@mantine/core';
import { ChatSidebar } from '../components/organisms/ChatSidebar';
import { ChatMain } from '../components/organisms/ChatMain';
import { useChat } from '../hooks/useChat';
import { useAuth } from '../hooks/useAuth';
import { CrearMensajeDTO } from '../types/chat';


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
  
  
  
  // Estado para nueva conversación
  const [showNuevaConversacion, setShowNuevaConversacion] = useState(false);
  const [nuevoParticipante, setNuevoParticipante] = useState('');
  const [nuevoTipo, setNuevoTipo] = useState<'general' | 'entrenamiento' | 'nutricion' | 'consulta'>('general');

  // Obtener la conversación activa
  const conversacionActivaId = conversacionActiva?._id || null;

  // Manejar envío de mensaje
  const handleSendMessage = async (data: CrearMensajeDTO) => {
    await enviarMensaje(data);
  };

  // Manejar nueva conversación
  const handleNuevaConversacion = async () => {
    if (!nuevoParticipante.trim()) return;

    try {
      await crearConversacion({
        participantes: [nuevoParticipante],
        metadata: { tipo: nuevoTipo }
      });
      
      setShowNuevaConversacion(false);
      setNuevoParticipante('');
      setNuevoTipo('general');
    } catch (err) {
      console.error('Error creating conversation:', err);
    }
  };

  // Manejar refrescar conversaciones
  const handleRefreshConversaciones = async () => {
    await refreshConversaciones();
  };

  return (
    <Box style={{ height: '100vh', display: 'flex' }}>
      {/* Sidebar con conversaciones */}
      <ChatSidebar
        conversaciones={conversaciones}
        conversacionActiva={conversacionActivaId}
        onSelectConversacion={seleccionarConversacion}
        onNuevaConversacion={() => setShowNuevaConversacion(true)}
        onRefreshConversaciones={handleRefreshConversaciones}
        onArchiveConversacion={archivarConversacion}
        onDeleteConversacion={eliminarConversacion}
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
            onVideoCall={() => console.log('Video Call')}
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
          <TextInput
            label="Participante"
            placeholder="Email o ID del usuario"
            value={nuevoParticipante}
            onChange={(e) => setNuevoParticipante(e.target.value)}
            required
          />
          
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
    </Box>
  );
};
