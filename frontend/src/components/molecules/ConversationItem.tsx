import React from 'react';
import {
  Paper,
  Group,
  Text,
  Badge,
  ActionIcon,
  Stack,
  Avatar,
  Box
} from '@mantine/core';
import {
  IconPin,
  IconVolumeOff
} from '@tabler/icons-react';
import { Conversacion } from '../../types/chat';
import { useAuth } from '../../hooks/useAuth';

interface ConversationItemProps {
  conversacion: Conversacion;
  isActive: boolean;
  onSelect: (conversacionId: string) => void;
  onPin?: (conversacionId: string) => void;
  onMute?: (conversacionId: string) => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversacion,
  isActive,
  onSelect,
  onPin,
  onMute
}) => {
  const { user } = useAuth();
  
  // Obtener el otro participante (no el usuario actual)
  const otroParticipante = conversacion.participantes.find(p => {
    if (typeof p === 'string') {
      return p !== user?._id;
    } else if (p && typeof p === 'object' && p._id) {
      return p._id !== user?._id;
    }
    return false;
  });
  
  // Contar mensajes no leídos del usuario actual
  const mensajesNoLeidos = user ? (conversacion.mensajesNoLeidos[user._id] || 0) : 0;
  
  // Determinar si es un mensaje del usuario actual
  const esMensajeMio = conversacion.ultimoMensajeRemitente && 
    (typeof conversacion.ultimoMensajeRemitente === 'string' 
      ? conversacion.ultimoMensajeRemitente === user?._id
      : conversacion.ultimoMensajeRemitente._id === user?._id);

  const getCategoryColor = (tipo?: string) => {
    switch (tipo) {
      case 'entrenamiento': return 'green';
      case 'nutricion': return 'teal';
      case 'consulta': return 'violet';
      default: return 'blue';
    }
  };

  const getCategoryLabel = (tipo?: string) => {
    switch (tipo) {
      case 'entrenamiento': return 'Entrenamiento';
      case 'nutricion': return 'Nutrición';
      case 'consulta': return 'Consulta';
      default: return 'General';
    }
  };

  // Si no hay otro participante, no mostrar la conversación
  if (!otroParticipante) {
    return null;
  }

  return (
    <Paper
      p="md"
      radius="md"
      withBorder
      style={{
        cursor: 'pointer',
        backgroundColor: isActive ? 'var(--mantine-color-blue-0)' : 'transparent',
        borderColor: isActive ? 'var(--mantine-color-blue-3)' : undefined,
        transition: 'all 0.2s ease'
      }}
      onClick={() => onSelect(conversacion._id)}
    >
      <Group gap="md" align="flex-start" wrap="nowrap">
        {/* Avatar del otro participante */}
        <Avatar
          src={otroParticipante?.profilePicture || undefined}
          alt={otroParticipante?.fullName || 'Usuario'}
          size="md"
          radius="xl"
        >
          {otroParticipante?.fullName?.charAt(0).toUpperCase() || 'U'}
        </Avatar>

        {/* Contenido de la conversación */}
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Group justify="space-between" align="flex-start" mb="xs">
            <Stack gap={4} style={{ minWidth: 0 }}>
              <Text fw={600} size="sm" truncate>
                {otroParticipante?.fullName || 'Usuario desconocido'}
              </Text>
              
              {/* Badges de categoría y estado */}
              <Group gap="xs" wrap="nowrap">
                <Badge 
                  size="xs" 
                  color={getCategoryColor(conversacion.metadata?.tipo)}
                  variant="light"
                >
                  {getCategoryLabel(conversacion.metadata?.tipo)}
                </Badge>
                
                {otroParticipante?.role && (
                  <Badge size="xs" color="gray" variant="light">
                    {otroParticipante.role}
                  </Badge>
                )}
              </Group>
            </Stack>

            {/* Timestamp del último mensaje */}
            {conversacion.ultimoMensajeFecha && (
              <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
                {new Date(conversacion.ultimoMensajeFecha).toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            )}
          </Group>

          {/* Preview del último mensaje */}
          {conversacion.ultimoMensajeContenido && (
            <Group gap="xs" align="center" mb="xs">
              {esMensajeMio && (
                <Text size="xs" c="dimmed">Tú:</Text>
              )}
              <Text 
                size="sm" 
                c="dimmed" 
                style={{ 
                  flex: 1, 
                  minWidth: 0,
                  fontStyle: esMensajeMio ? 'italic' : 'normal'
                }}
                truncate
              >
                {conversacion.ultimoMensajeContenido}
              </Text>
            </Group>
          )}

          {/* Indicadores de estado */}
          <Group justify="space-between" align="center">
            {/* Contador de mensajes no leídos */}
            {mensajesNoLeidos > 0 && (
              <Badge 
                size="sm" 
                color="red" 
                variant="filled"
                style={{ borderRadius: '50%', minWidth: '20px', height: '20px' }}
              >
                {mensajesNoLeidos > 99 ? '99+' : mensajesNoLeidos}
              </Badge>
            )}

            {/* Acciones rápidas */}
            <Group gap="xs">
              {onPin && (
                <ActionIcon
                  variant="subtle"
                  size="xs"
                  color="gray"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPin(conversacion._id);
                  }}
                >
                  <IconPin size={14} />
                </ActionIcon>
              )}
              
              {onMute && (
                <ActionIcon
                  variant="subtle"
                  size="xs"
                  color="gray"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMute(conversacion._id);
                  }}
                >
                  <IconVolumeOff size={14} />
                </ActionIcon>
              )}
            </Group>
          </Group>
        </Box>
      </Group>
    </Paper>
  );
};
