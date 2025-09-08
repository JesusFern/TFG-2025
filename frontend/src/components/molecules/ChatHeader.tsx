import React from 'react';
import {
  Box,
  Group,
  Avatar,
  Text,
  Badge,
  ActionIcon,
  Stack,
  Menu
} from '@mantine/core';
import {
  IconSearch,
  IconInfoCircle,
  IconArchive,
  IconTrash,
  IconVolumeOff,
  IconPin,
  IconPhone,
  IconVideo,
  IconDotsVertical
} from '@tabler/icons-react';
import { Conversacion } from '../../types/chat';
import { useAuth } from '../../hooks/useAuth';

interface ChatHeaderProps {
  conversacion: Conversacion;
  onSearch?: () => void;
  onInfo?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  onMute?: () => void;
  onPin?: () => void;
  onCall?: () => void;
  onVideoCall?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  conversacion,
  onSearch,
  onInfo,
  onArchive,
  onDelete,
  onMute,
  onPin,
  onCall,
  onVideoCall
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
  
  const canManageConversation = true; // Se debe obtener del contexto

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

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'worker': return 'Trabajador';
      case 'user': return 'Usuario';
      default: return role;
    }
  };

  // Si no hay otro participante, mostrar mensaje de error
  if (!otroParticipante) {
    return (
      <Box
        p="md"
        style={{
          borderBottom: '1px solid var(--mantine-color-gray-3)',
          backgroundColor: 'var(--mantine-color-gray-0)'
        }}
      >
        <Text c="red" ta="center">Error: No se pudo identificar el destinatario</Text>
      </Box>
    );
  }

  return (
    <Box
      p="md"
      style={{
        borderBottom: '1px solid var(--mantine-color-gray-3)',
        backgroundColor: 'var(--mantine-color-gray-0)'
      }}
    >
      <Group justify="space-between" align="center">
        {/* Información del participante */}
        <Group gap="md" align="center">
          <Avatar
            src={otroParticipante?.profilePicture || undefined}
            alt={otroParticipante?.fullName || 'Usuario'}
            size="lg"
            radius="xl"
          >
            {otroParticipante?.fullName?.charAt(0).toUpperCase() || 'U'}
          </Avatar>
          
          <Stack gap={4}>
            <Text fw={600} size="lg">
              {otroParticipante?.fullName || 'Usuario desconocido'}
            </Text>
            
            <Group gap="xs" wrap="nowrap">
              <Badge 
                size="sm" 
                color={getCategoryColor(conversacion.metadata?.tipo)}
                variant="light"
              >
                {getCategoryLabel(conversacion.metadata?.tipo)}
              </Badge>
              
              {otroParticipante?.role && (
                <Badge size="sm" color="gray" variant="light">
                  {getRoleLabel(otroParticipante.role)}
                </Badge>
              )}
            </Group>
          </Stack>
        </Group>

        {/* Acciones del header */}
        <Group gap="xs">
          {/* Botón de búsqueda */}
          {onSearch && (
            <ActionIcon
              variant="subtle"
              color="gray"
              size="md"
              onClick={onSearch}
            >
              <IconSearch size={18} />
            </ActionIcon>
          )}

          {/* Botón de información */}
          {onInfo && (
            <ActionIcon
              variant="subtle"
              color="gray"
              size="md"
              onClick={onInfo}
            >
              <IconInfoCircle size={18} />
            </ActionIcon>
          )}

          {/* Botón de llamada */}
          {onCall && (
            <ActionIcon
              variant="subtle"
              color="green"
              size="md"
              onClick={onCall}
            >
              <IconPhone size={18} />
            </ActionIcon>
          )}

          {/* Botón de videollamada */}
          {onVideoCall && (
            <ActionIcon
              variant="subtle"
              color="blue"
              size="md"
              onClick={onVideoCall}
            >
              <IconVideo size={18} />
            </ActionIcon>
          )}

          {/* Menú de acciones */}
          {canManageConversation && (
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <ActionIcon variant="subtle" size="md" color="gray">
                  <IconDotsVertical size={18} />
                </ActionIcon>
              </Menu.Target>

              <Menu.Dropdown>
                {onPin && (
                  <Menu.Item
                    leftSection={<IconPin size={14} />}
                    onClick={onPin}
                  >
                    Fijar conversación
                  </Menu.Item>
                )}
                
                {onMute && (
                  <Menu.Item
                    leftSection={<IconVolumeOff size={14} />}
                    onClick={onMute}
                  >
                    Silenciar notificaciones
                  </Menu.Item>
                )}
                
                {onArchive && (
                  <Menu.Item
                    leftSection={<IconArchive size={14} />}
                    onClick={onArchive}
                  >
                    Archivar conversación
                  </Menu.Item>
                )}
                
                {onDelete && (
                  <Menu.Item
                    leftSection={<IconTrash size={14} />}
                    color="red"
                    onClick={onDelete}
                  >
                    Eliminar conversación
                  </Menu.Item>
                )}
              </Menu.Dropdown>
            </Menu>
          )}
        </Group>
      </Group>
    </Box>
  );
};
