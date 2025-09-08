import React from 'react';
import { Box, Text, Badge, Group, ActionIcon, Paper, Avatar, Stack } from '@mantine/core';
import { IconArrowBackUp, IconTrash, IconCheck, IconChecks, IconClock, IconPaperclip } from '@tabler/icons-react';
import { Mensaje } from '../../types/chat';

interface ChatMessageProps {
  mensaje: Mensaje;
  esMio: boolean;
  onReply?: (mensajeId: string) => void;
  onDelete?: (mensajeId: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  mensaje,
  esMio,
  onReply,
  onDelete
}) => {
  const getPriorityColor = (prioridad: string) => {
    switch (prioridad) {
      case 'urgente': return 'red';
      case 'alta': return 'orange';
      case 'normal': return 'blue';
      case 'baja': return 'gray';
      default: return 'blue';
    }
  };

  const getCategoryColor = (categoria: string) => {
    switch (categoria) {
      case 'entrenamiento': return 'green';
      case 'nutricion': return 'teal';
      case 'consulta': return 'violet';
      case 'recordatorio': return 'yellow';
      default: return 'blue';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'leido':
        return <IconChecks size={16} color="#4CAF50" />;
      case 'entregado':
        return <IconChecks size={16} color="#2196F3" />;
      case 'enviado':
        return <IconCheck size={16} color="#9E9E9E" />;
      default:
        return <IconClock size={16} color="#9E9E9E" />;
    }
  };

  const getEstadoText = (estado: string) => {
    switch (estado) {
      case 'leido': return 'Leído';
      case 'entregado': return 'Entregado';
      case 'enviado': return 'Enviado';
      default: return 'Enviando...';
    }
  };

  const canManageMessage = esMio;

  return (
    <Box
      style={{
        display: 'flex',
        justifyContent: esMio ? 'flex-end' : 'flex-start',
        marginBottom: '1rem'
      }}
    >
      <Paper
        p="md"
        radius="md"
        style={{
          maxWidth: '70%',
          minWidth: '200px',
          backgroundColor: esMio ? 'var(--mantine-color-blue-1)' : 'var(--mantine-color-gray-1)',
          border: `1px solid ${esMio ? 'var(--mantine-color-blue-3)' : 'var(--mantine-color-gray-3)'}`,
          position: 'relative',
          wordBreak: 'break-word',
          overflowWrap: 'break-word'
        }}
      >
        {/* Header del mensaje */}
        <Group justify="space-between" mb="xs" align="flex-start">
          <Group gap="xs" align="center">
            {!esMio && (
              <Avatar
                src={typeof mensaje.remitente === 'object' ? mensaje.remitente.profilePicture : undefined}
                alt={typeof mensaje.remitente === 'object' ? mensaje.remitente.fullName : 'Usuario'}
                size="sm"
                radius="xl"
              >
                {typeof mensaje.remitente === 'object' && mensaje.remitente.fullName 
                  ? mensaje.remitente.fullName.charAt(0).toUpperCase() 
                  : 'U'}
              </Avatar>
            )}
            
            <Stack gap={4}>
              {!esMio && (
                <Text size="sm" fw={500} c="dimmed">
                  {typeof mensaje.remitente === 'object' && mensaje.remitente.fullName 
                    ? mensaje.remitente.fullName 
                    : 'Usuario'}
                </Text>
              )}
              
              <Group gap="xs">
                <Badge 
                  size="xs" 
                  color={getPriorityColor(mensaje.prioridad)}
                  variant="light"
                >
                  {mensaje.prioridad}
                </Badge>
                
                <Badge 
                  size="xs" 
                  color={getCategoryColor(mensaje.categoria)}
                  variant="light"
                >
                  {mensaje.categoria}
                </Badge>
              </Group>
            </Stack>
          </Group>

          {/* Acciones del mensaje */}
          {canManageMessage && (
            <Group gap="xs">
              {onReply && (
                <ActionIcon
                  variant="subtle"
                  size="sm"
                  color="blue"
                  onClick={() => onReply(mensaje._id)}
                >
                  <IconArrowBackUp size={16} />
                </ActionIcon>
              )}
              
              
              
              {onDelete && (
                <ActionIcon
                  variant="subtle"
                  size="sm"
                  color="red"
                  onClick={() => onDelete(mensaje._id)}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              )}
            </Group>
          )}
        </Group>

        {/* Contenido del mensaje */}
        <Box mb="xs" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
          {mensaje.tipo === 'texto' && (
            <Text 
              size="sm" 
              style={{ 
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                maxWidth: '100%'
              }}
            >
              {mensaje.contenido}
            </Text>
          )}
          
          {mensaje.tipo === 'imagen' && (
            <Box>
              <img 
                src={mensaje.contenido} 
                alt="Imagen del mensaje"
                style={{ 
                  maxWidth: '100%', 
                  borderRadius: '8px',
                  maxHeight: '300px',
                  objectFit: 'cover'
                }} 
              />
            </Box>
          )}
          
          {mensaje.tipo === 'archivo' && (
            <Group gap="xs">
              <IconPaperclip size={16} />
              <Text size="sm" fw={500}>
                Archivo adjunto
              </Text>
            </Group>
          )}
          
          {mensaje.tipo === 'sistema' && (
            <Text 
              size="sm" 
              c="dimmed" 
              style={{ 
                fontStyle: 'italic',
                wordBreak: 'break-word',
                overflowWrap: 'break-word'
              }}
            >
              {mensaje.contenido}
            </Text>
          )}
        </Box>

        {/* Footer del mensaje */}
        <Group justify="space-between" align="center">
          <Text size="xs" c="dimmed">
            {new Date(mensaje.createdAt).toLocaleString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
          
          {esMio && (
            <Group gap="xs" align="center">
              {getEstadoIcon(mensaje.estado)}
              <Text size="xs" c="dimmed">
                {getEstadoText(mensaje.estado)}
              </Text>
            </Group>
          )}
        </Group>
      </Paper>
    </Box>
  );
};
