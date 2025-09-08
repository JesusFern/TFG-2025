import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Text, 
  TextInput, 
  Button, 
  Group, 
  Stack, 
  Paper, 
  Badge, 
  Avatar,
  ScrollArea,
  ActionIcon,
  Tooltip,
  Divider
} from '@mantine/core';
import { 
  IconSend, 
  IconPaperclip, 
  IconPhoto, 
  IconMoodSmile,
  IconMicrophone,
  IconPhone,
  IconVideo
} from '@tabler/icons-react';
// import { useSocket } from '../../hooks/useSocket'; // Temporalmente deshabilitado
import { useAuth } from '../../hooks/useAuth';
// import { formatDistanceToNow } from 'date-fns'; // Temporalmente deshabilitado
// import { es } from 'date-fns/locale'; // Temporalmente deshabilitado

// interface Mensaje { // Temporalmente deshabilitado
//   _id: string;
//   remitente: string;
//   destinatario: string;
//   contenido: string;
//   tipo: 'texto' | 'imagen' | 'archivo' | 'sistema';
//   estado: 'enviado' | 'entregado' | 'leido' | 'archivado';
//   prioridad: 'baja' | 'normal' | 'alta' | 'urgente';
//   categoria: 'general' | 'entrenamiento' | 'nutricion' | 'consulta' | 'recordatorio';
//   createdAt: Date;
//   updatedAt: Date;
// }

interface Conversacion {
  _id: string;
  participantes: Array<{
    _id: string;
    fullName: string;
    profilePicture?: string;
  }>;
  metadata?: {
    tipo: string;
    titulo?: string;
  };
  ultimoMensaje?: {
    contenido: string;
    timestamp: Date;
  };
}

interface RealTimeChatProps {
  conversacion: Conversacion;
  onClose?: () => void;
}

export const RealTimeChat: React.FC<RealTimeChatProps> = ({ 
  conversacion, 
  onClose 
}) => {
  const { user } = useAuth();
  // Estado local temporal mientras Socket.IO esté deshabilitado
  // const [mensajes, setMensajes] = useState<Mensaje[]>([]); // Temporalmente deshabilitado
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  // const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set()); // Temporalmente deshabilitado
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const otroParticipante = conversacion.participantes.find(p => p._id !== user?._id);

  // Socket.IO temporalmente deshabilitado - valores temporales
  const isConnected = false;
  // const joinConversation = () => {}; // Temporalmente deshabilitado
  // const leaveConversation = () => {}; // Temporalmente deshabilitado
  // const sendMessage = () => {}; // Temporalmente deshabilitado
  // const markAsRead = () => {}; // Temporalmente deshabilitado
  // const startTyping = () => {}; // Temporalmente deshabilitado
  // const stopTyping = () => {}; // Temporalmente deshabilitado

  // Unirse a la conversación cuando se monta el componente (temporalmente deshabilitado)
  useEffect(() => {
    // Socket.IO temporalmente deshabilitado
    
    return () => {
      // Socket.IO temporalmente deshabilitado
    };
  }, []); // Sin dependencias mientras Socket.IO esté deshabilitado

  // Scroll automático al último mensaje
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []); // Sin dependencias mientras Socket.IO esté deshabilitado

  // Manejar envío de mensaje
  const handleSendMessage = () => {
    if (!nuevoMensaje.trim() || !otroParticipante) return;

    // Socket.IO temporalmente deshabilitado
    setNuevoMensaje('');
  };

  // Manejar tecla Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Manejar escritura
  const handleTyping = (value: string) => {
    setNuevoMensaje(value);

    if (value.trim()) {
      // startTyping(conversacion._id); // Temporalmente deshabilitado
      
      typingTimeoutRef.current = setTimeout(() => {
        // stopTyping(conversacion._id); // Temporalmente deshabilitado
      }, 1000);
    } else {
      // stopTyping(conversacion._id); // Temporalmente deshabilitado
    }
  };

  // Obtener color de prioridad (temporalmente deshabilitado)
  // const getPriorityColor = (prioridad: string) => {
  //   switch (prioridad) {
  //     case 'urgente': return 'red';
  //     case 'alta': return 'orange';
  //     case 'normal': return 'blue';
  //     case 'baja': return 'gray';
  //     default: return 'blue';
  //   }
  // };

  // Obtener color de categoría
  const getCategoryColor = (categoria: string) => {
    switch (categoria) {
      case 'entrenamiento': return 'blue';
      case 'nutricion': return 'green';
      case 'consulta': return 'orange';
      case 'recordatorio': return 'yellow';
      default: return 'gray';
    }
  };

  if (!otroParticipante) {
    return (
      <Paper p="md" withBorder>
        <Text c="dimmed" ta="center">No se pudo cargar la conversación</Text>
      </Paper>
    );
  }

  return (
    <Paper withBorder style={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
      {/* Header de la conversación */}
      <Box p="md" style={{ borderBottom: '1px solid #e9ecef' }}>
        <Group justify="space-between" align="center">
          <Group>
            <Avatar 
              src={otroParticipante.profilePicture} 
              size="md"
              radius="xl"
            >
              {otroParticipante.fullName.charAt(0)}
            </Avatar>
            <Box>
              <Text fw={500}>{otroParticipante.fullName}</Text>
              <Group gap="xs">
                <Badge 
                  size="sm" 
                  color={getCategoryColor(conversacion.metadata?.tipo || 'general')}
                >
                  {conversacion.metadata?.tipo || 'general'}
                </Badge>
                <Badge 
                  size="xs" 
                  color={isConnected ? 'green' : 'red'}
                  variant="dot"
                >
                  {isConnected ? 'En línea' : 'Desconectado'}
                </Badge>
              </Group>
            </Box>
          </Group>
          
          <Group gap="xs">
            <Tooltip label="Llamada de voz">
              <ActionIcon variant="subtle" size="sm">
                <IconPhone size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Videollamada">
              <ActionIcon variant="subtle" size="sm">
                <IconVideo size={16} />
              </ActionIcon>
            </Tooltip>
            {onClose && (
              <Tooltip label="Cerrar chat">
                <ActionIcon variant="subtle" size="sm" onClick={onClose}>
                  <IconMoodSmile size={16} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        </Group>
      </Box>

      {/* Indicador de escritura */}
      {/* {typingUsers.size > 0 && ( // Temporalmente deshabilitado
        <Box p="xs" style={{ borderBottom: '1px solid #e9ecef' }}>
          <Text size="sm" c="dimmed" style={{ fontStyle: 'italic' }}>
            {Array.from(typingUsers).join(', ')} está escribiendo...
          </Text>
        </Box>
      )} */}

      {/* Área de mensajes */}
      <ScrollArea 
        ref={scrollRef}
        style={{ flex: 1, padding: 'md' }}
        scrollbarSize={6}
      >
        <Stack gap="md">
          {/* Mensaje temporal mientras Socket.IO esté deshabilitado */}
          <Paper p="xl" ta="center" c="dimmed">
            <IconMoodSmile size={48} style={{ margin: '0 auto 1rem' }} />
            <Text size="lg">Chat temporalmente deshabilitado</Text>
            <Text size="sm">
              Socket.IO está siendo corregido para evitar bucles infinitos
            </Text>
          </Paper>
        </Stack>
      </ScrollArea>

      <Divider />

      {/* Input de mensaje */}
      <Box p="md">
        <Group gap="xs" align="flex-end">
          <TextInput
            placeholder="Escribe tu mensaje..."
            value={nuevoMensaje}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyPress={handleKeyPress}
            style={{ flex: 1 }}
            disabled={true} // Temporalmente deshabilitado
            rightSection={
              <Group gap={4}>
                <Tooltip label="Adjuntar archivo">
                  <ActionIcon variant="subtle" size="sm">
                    <IconPaperclip size={16} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Imagen">
                  <ActionIcon variant="subtle" size="sm">
                    <IconPhoto size={16} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Grabar audio">
                  <ActionIcon variant="subtle" size="sm">
                    <IconMicrophone size={16} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            }
          />
          <Button
            onClick={handleSendMessage}
            disabled={true} // Temporalmente deshabilitado
            leftSection={<IconSend size={16} />}
          >
            Enviar
          </Button>
        </Group>
      </Box>
    </Paper>
  );
};
