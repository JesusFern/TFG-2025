import React, { useState } from 'react';
import {
  Textarea,
  Select,
  FileInput,
  Group,
  ActionIcon,
  Text,
  Stack,
  Badge,
  Divider,
  Paper
} from '@mantine/core';
import {
  IconSend,
  IconX,
  IconAlertCircle
} from '@tabler/icons-react';
import { useAuth } from '../../hooks/useAuth';
import { CrearMensajeDTO, Adjunto } from '../../types/chat';
import { chatService } from '../../services/chatService';

interface ChatInputProps {
  onSendMessage: (message: CrearMensajeDTO) => void;
  isTyping?: boolean;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isTyping = false,
  disabled = false
}) => {
  const { user } = useAuth();
  const [contenido, setContenido] = useState('');
  const [prioridad, setPrioridad] = useState<'baja' | 'normal' | 'alta' | 'urgente'>('baja');
  const [categoria, setCategoria] = useState<'general' | 'entrenamiento' | 'nutricion' | 'consulta'>('general');
  const [archivos, setArchivos] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [subiendoArchivos, setSubiendoArchivos] = useState(false);

  const MAX_CONTENIDO_LENGTH = 5000;

  const handleSend = async () => {
    if (!contenido.trim() && archivos.length === 0) return;
    if (!user) return;

    // Validar longitud del contenido
    if (contenido.length > MAX_CONTENIDO_LENGTH) {
      setError(`El mensaje es demasiado largo. Máximo ${MAX_CONTENIDO_LENGTH} caracteres (actualmente ${contenido.length}).`);
      return;
    }

    try {
      setSubiendoArchivos(true);
      setError(null);

      // Subir archivos si hay alguno
      let adjuntosSubidos: Adjunto[] = [];
      if (archivos.length > 0) {
        const archivosSubidos = await chatService.subirArchivos(archivos);
        adjuntosSubidos = archivosSubidos.map(archivo => ({
          nombre: archivo.nombre,
          url: archivo.url,
          tipo: archivo.tipo,
          tamano: archivo.tamano
        }));
      }

      const mensaje: CrearMensajeDTO = {
        destinatario: '', // Se debe obtener de la conversación activa
        contenido: contenido.trim(),
        prioridad,
        categoria,
        adjuntos: adjuntosSubidos
      };

      onSendMessage(mensaje);
      setContenido('');
      setArchivos([]);
      setError(null);
    } catch (err) {
      setError('Error al subir archivos. Inténtalo de nuevo.');
      console.error('Error al subir archivos:', err);
    } finally {
      setSubiendoArchivos(false);
    }
  };

  const handleFileUpload = (files: File[] | null) => {
    if (!files) return;
    
    const maxSize = 50 * 1024 * 1024; // 50MB
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        setError(`El archivo ${file.name} es demasiado grande. Máximo 50MB.`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setArchivos(prev => [...prev, ...validFiles]);
      setError(null);
    }
  };

  const removeFile = (index: number) => {
    setArchivos(prev => prev.filter((_, i) => i !== index));
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <Paper p="md" withBorder>
      <Stack gap="sm">
        {/* Archivos adjuntos */}
        {archivos.length > 0 && (
          <Group gap="xs" wrap="wrap">
            {archivos.map((file, index) => (
              <Badge
                key={index}
                variant="light"
                rightSection={
                  <ActionIcon
                    size="xs"
                    variant="subtle"
                    onClick={() => removeFile(index)}
                  >
                    <IconX size={12} />
                  </ActionIcon>
                }
              >
                {file.name}
              </Badge>
            ))}
          </Group>
        )}

        {/* Error */}
        {error && (
          <Group gap="xs" c="red">
            <IconAlertCircle size={16} />
            <Text size="sm" c="red">{error}</Text>
          </Group>
        )}

        {/* Aviso cuando no hay contenido ni archivos */}
        {!contenido.trim() && archivos.length === 0 && (
          <Text size="sm" c="dimmed" ta="center">
            Escribe un mensaje o adjunta un archivo para enviar
          </Text>
        )}

        {/* Controles */}
        <Group gap="sm" wrap="wrap">
          <Select
            label="Prioridad"
            value={prioridad}
            onChange={(value) => setPrioridad(value as 'baja' | 'normal' | 'alta' | 'urgente')}
            data={[
              { value: 'baja', label: 'Baja' },
              { value: 'normal', label: 'Normal' },
              { value: 'alta', label: 'Alta' },
              { value: 'urgente', label: 'Urgente' }
            ]}
            size="sm"
            style={{ minWidth: 120 }}
          />
          
          <Select
            label="Categoría"
            value={categoria}
            onChange={(value) => setCategoria(value as 'general' | 'entrenamiento' | 'nutricion' | 'consulta')}
            data={[
              { value: 'general', label: 'General' },
              { value: 'entrenamiento', label: 'Entrenamiento' },
              { value: 'nutricion', label: 'Nutrición' },
              { value: 'consulta', label: 'Consulta' }
            ]}
            size="sm"
            style={{ minWidth: 140 }}
          />
        </Group>

        <Divider />

        {/* Input principal */}
        <Stack gap="xs">
          <Group gap="sm" align="flex-end">
            <Textarea
              placeholder="Escribe tu mensaje..."
              value={contenido}
              onChange={(event) => setContenido(event.currentTarget.value)}
              onKeyPress={handleKeyPress}
              minRows={1}
              maxRows={6}
              style={{ 
                flex: 1,
                resize: 'none',
                wordBreak: 'break-word',
                overflowWrap: 'break-word'
              }}
              disabled={disabled}
              autosize
            />
            
            <FileInput
              placeholder="Adjuntar archivo"
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip,.rar,.7z"
              multiple
              onChange={handleFileUpload}
              disabled={disabled}
              size="sm"
              style={{ minWidth: 150 }}
            />
            
            <ActionIcon
              size="lg"
              variant="filled"
              color="blue"
              onClick={handleSend}
              disabled={disabled || subiendoArchivos || contenido.length > MAX_CONTENIDO_LENGTH}
              loading={subiendoArchivos}
            >
              {!subiendoArchivos && <IconSend size={20} />}
            </ActionIcon>
          </Group>
          
          <Group justify="space-between">
            <Text 
              size="xs" 
              c={contenido.length > MAX_CONTENIDO_LENGTH ? 'red' : contenido.length > MAX_CONTENIDO_LENGTH * 0.9 ? 'orange' : 'dimmed'}
            >
              {contenido.length} / {MAX_CONTENIDO_LENGTH} caracteres
            </Text>
          </Group>
        </Stack>

        {/* Indicador de escritura */}
        {isTyping && (
          <Text size="sm" c="dimmed" ta="center">
            Alguien está escribiendo...
          </Text>
        )}
      </Stack>
    </Paper>
  );
};
