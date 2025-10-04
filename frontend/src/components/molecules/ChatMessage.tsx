import React from 'react';
import { Box, Text, Badge, Group, ActionIcon, Paper, Avatar, Stack, Image } from '@mantine/core';
import { IconTrash, IconCheck, IconChecks, IconClock, IconPaperclip, IconDownload } from '@tabler/icons-react';
import { Mensaje } from '../../types/chat';

interface ChatMessageProps {
  mensaje: Mensaje;
  esMio: boolean;
  onDelete?: (mensajeId: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  mensaje,
  esMio,
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

  // Función para determinar si un archivo es una imagen
  const esImagen = (tipo: string) => {
    return tipo.startsWith('image/');
  };

  // Función para determinar si un archivo es un video
  const esVideo = (tipo: string) => {
    return tipo.startsWith('video/');
  };

  // Función para determinar si un archivo es audio
  const esAudio = (tipo: string) => {
    return tipo.startsWith('audio/');
  };

  // Función para formatear el tamaño del archivo
  const formatearTamano = (tamano: number) => {
    if (tamano < 1024) return `${tamano} B`;
    if (tamano < 1024 * 1024) return `${(tamano / 1024).toFixed(1)} KB`;
    return `${(tamano / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Función para descargar archivo
  const descargarArchivo = (adjunto: { nombre: string; url: string; tipo: string; tamano: number }) => {
    const link = document.createElement('a');
    link.href = adjunto.url;
    link.download = adjunto.nombre;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
          {canManageMessage && onDelete && (
            <Group gap="xs">
              <ActionIcon
                variant="subtle"
                size="sm"
                color="red"
                onClick={() => onDelete(mensaje._id)}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Group>
          )}
        </Group>

        {/* Contenido del mensaje */}
        <Box mb="xs" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
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
          
          {/* Mostrar adjuntos si existen */}
          {mensaje.adjuntos && mensaje.adjuntos.length > 0 && (
            <Stack gap="sm" mt="sm">
              {mensaje.adjuntos.map((adjunto, index) => (
                <Box key={index}>
                  {esImagen(adjunto.tipo) ? (
                    // Mostrar imagen
                    <Box>
                      <Image
                        src={adjunto.url}
                        alt={adjunto.nombre}
                        style={{
                          maxWidth: '300px',
                          maxHeight: '300px',
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}
                        onClick={() => window.open(adjunto.url, '_blank')}
                        fallbackSrc="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbiBubyBkaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg=="
                      />
                      <Group gap="xs" mt="xs" align="center">
                        <Text size="xs" c="dimmed">
                          {adjunto.nombre} • {formatearTamano(adjunto.tamano)}
                        </Text>
                        <ActionIcon
                          size="sm"
                          variant="subtle"
                          color="blue"
                          onClick={() => descargarArchivo(adjunto)}
                        >
                          <IconDownload size={14} />
                        </ActionIcon>
                      </Group>
                    </Box>
                  ) : esVideo(adjunto.tipo) ? (
                    // Mostrar video
                    <Box>
                      <video
                        controls
                        style={{
                          maxWidth: '400px',
                          maxHeight: '300px',
                          borderRadius: '8px',
                          backgroundColor: '#000'
                        }}
                        preload="metadata"
                        crossOrigin="anonymous"
                      >
                        <source src={adjunto.url} type={adjunto.tipo} />
                        <source src={adjunto.url} type="video/mp4" />
                        <p>Tu navegador no soporta el elemento video. 
                          <a href={adjunto.url} target="_blank" rel="noopener noreferrer">
                            Descargar video
                          </a>
                        </p>
                      </video>
                      <Group gap="xs" mt="xs" align="center">
                        <Text size="xs" c="dimmed">
                          {adjunto.nombre} • {formatearTamano(adjunto.tamano)}
                        </Text>
                        <ActionIcon
                          size="sm"
                          variant="subtle"
                          color="blue"
                          onClick={() => descargarArchivo(adjunto)}
                        >
                          <IconDownload size={14} />
                        </ActionIcon>
                      </Group>
                    </Box>
                  ) : esAudio(adjunto.tipo) ? (
                    // Mostrar audio
                    <Box>
                      <audio
                        controls
                        style={{
                          width: '100%',
                          maxWidth: '400px'
                        }}
                        preload="metadata"
                      >
                        <source src={adjunto.url} type={adjunto.tipo} />
                        Tu navegador no soporta el elemento audio.
                      </audio>
                      <Group gap="xs" mt="xs" align="center">
                        <Text size="xs" c="dimmed">
                          {adjunto.nombre} • {formatearTamano(adjunto.tamano)}
                        </Text>
                        <ActionIcon
                          size="sm"
                          variant="subtle"
                          color="blue"
                          onClick={() => descargarArchivo(adjunto)}
                        >
                          <IconDownload size={14} />
                        </ActionIcon>
                      </Group>
                    </Box>
                  ) : (
                    // Mostrar archivo no-imagen
                    <Group gap="xs" p="xs" style={{ 
                      backgroundColor: 'var(--mantine-color-gray-0)', 
                      borderRadius: '8px',
                      border: '1px solid var(--mantine-color-gray-3)'
                    }}>
                      <IconPaperclip size={16} />
                      <Box style={{ flex: 1 }}>
                        <Text size="sm" fw={500} truncate>
                          {adjunto.nombre}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {formatearTamano(adjunto.tamano)}
                        </Text>
                      </Box>
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        color="blue"
                        onClick={() => descargarArchivo(adjunto)}
                      >
                        <IconDownload size={14} />
                      </ActionIcon>
                    </Group>
                  )}
                </Box>
              ))}
            </Stack>
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
