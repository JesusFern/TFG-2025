import React, { useEffect, useRef } from 'react';
import {
  Box,
  Text,
  Stack,
  ScrollArea,
  Center,
  Loader,
  Alert
} from '@mantine/core';
import {
  IconAlertCircle,
  IconMessage
} from '@tabler/icons-react';
import { Mensaje, Conversacion, CrearMensajeDTO } from '../../types/chat';
import { ChatMessage } from '../molecules/ChatMessage';
import { ChatInput } from '../molecules/ChatInput';
import { ChatHeader } from '../molecules/ChatHeader';

interface ChatMainProps {
  conversacion: Conversacion | null;
  mensajes: Mensaje[];
  usuarioActual?: { _id: string; fullName: string } | null;
  isLoading?: boolean;
  error?: string | null;
  onSendMessage: (message: CrearMensajeDTO) => void;
  onReply?: (mensajeId: string) => void;
  onDelete?: (mensajeId: string) => void;
  onArchive?: (mensajeId: string) => void;
  onSearch?: () => void;
  onInfo?: () => void;
  onArchiveConversacion?: () => void;
  onDeleteConversacion?: () => void;
  onMute?: () => void;
  onPin?: () => void;
  onCall?: () => void;
  onVideoCall?: () => void;
}

export const ChatMain: React.FC<ChatMainProps> = ({
  conversacion,
  mensajes,
  usuarioActual,
  isLoading = false,
  error = null,
  onSendMessage,
  onReply,
  onDelete,
  onSearch,
  onInfo,
  onArchiveConversacion,
  onDeleteConversacion,
  onMute,
  onPin,
  onCall,
  onVideoCall
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al último mensaje
  useEffect(() => {
    if (scrollRef.current && mensajes.length > 0) {
      // Scroll suave al último mensaje (más reciente)
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }, [mensajes]);

  // Estado de carga
  if (isLoading) {
    return (
      <Center style={{ height: '100%' }}>
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text c="dimmed">Cargando conversación...</Text>
        </Stack>
      </Center>
    );
  }

  // Estado de error
  if (error) {
    return (
      <Center style={{ height: '100%' }}>
        <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
          {error}
        </Alert>
      </Center>
    );
  }

  // Estado sin conversación seleccionada
  if (!conversacion) {
    return (
      <Center style={{ height: '100%' }}>
        <Stack align="center" gap="md">
          <IconMessage size={64} color="var(--mantine-color-gray-4)" />
          <Text size="lg" c="dimmed">Selecciona una conversación</Text>
          <Text size="sm" c="dimmed" ta="center">
            Elige una conversación de la lista para comenzar a chatear
          </Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Box style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header de la conversación */}
      <ChatHeader
        conversacion={conversacion}
        onSearch={onSearch}
        onInfo={onInfo}
        onArchive={onArchiveConversacion}
        onDelete={onDeleteConversacion}
        onMute={onMute}
        onPin={onPin}
        onCall={onCall}
        onVideoCall={onVideoCall}
      />

      {/* Área de mensajes */}
      <ScrollArea 
        ref={scrollRef}
        style={{ flex: 1 }}
        scrollbarSize={8}
        type="auto"
      >
        <Box p="md">
          <Stack gap="md">
            {/* Mensaje de bienvenida */}
            {mensajes.length === 0 && (
              <Center p="xl" ta="center" c="dimmed">
                <IconMessage size={48} style={{ margin: '0 auto 1rem' }} />
                <Text size="lg">Inicia la conversación</Text>
                <Text size="sm">
                  Envía el primer mensaje para comenzar a chatear
                </Text>
              </Center>
            )}

            {/* Lista de mensajes ordenados cronológicamente */}
            {mensajes.map((mensaje) => {
              const remitenteId = typeof (mensaje.remitente as unknown) === 'object'
                ? (mensaje.remitente as unknown as { _id: string })._id
                : (mensaje.remitente as unknown as string);
              const esMioCalc = !!(usuarioActual && remitenteId === usuarioActual._id);
              return (
                <ChatMessage
                  key={mensaje._id}
                  mensaje={mensaje}
                  onReply={onReply}
                  onDelete={onDelete}
                  esMio={esMioCalc}
                />
              );
            })}
          </Stack>
        </Box>
      </ScrollArea>

      {/* Input para escribir mensajes */}
      <Box p="md" style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}>
        <ChatInput
          onSendMessage={onSendMessage}
          disabled={false} // Temporalmente habilitado mientras se corrige Socket.IO
        />
      </Box>
    </Box>
  );
};
