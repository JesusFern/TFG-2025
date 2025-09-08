import React, { useState } from 'react';
import {
  Box,
  Text,
  Group,
  Button,
  TextInput,
  ActionIcon,
  Stack,
  Divider,
  ScrollArea,
  Badge,
  Paper,
  Modal,
  Select
} from '@mantine/core';
import {
  IconPlus,
  IconSearch,
  IconFilter,
  IconMessage,
  IconRefresh
} from '@tabler/icons-react';
import { Conversacion } from '../../types/chat';
import { ConversationItem } from '../molecules/ConversationItem';

interface ChatSidebarProps {
  conversaciones: Conversacion[];
  conversacionActiva: string | null;
  onSelectConversacion: (conversacionId: string) => void;
  onNuevaConversacion?: () => void;
  onRefreshConversaciones?: () => void;
  // onArchiveConversacion?: (conversacionId: string) => void;
  // onDeleteConversacion?: (conversacionId: string) => void;
  onPinConversacion?: (conversacionId: string) => void;
  onMuteConversacion?: (conversacionId: string) => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversaciones,
  conversacionActiva,
  onSelectConversacion,
  onNuevaConversacion,
  onRefreshConversaciones,
  // onArchiveConversacion,
  // onDeleteConversacion,
  onPinConversacion,
  onMuteConversacion
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('todos');
  const [showNuevaConversacion, setShowNuevaConversacion] = useState(false);
  const [nuevoParticipante, setNuevoParticipante] = useState('');
  const [nuevoTipo, setNuevoTipo] = useState<'general' | 'entrenamiento' | 'nutricion' | 'consulta'>('general');

  

  // Verificar que conversaciones sea un array válido
  const conversacionesSeguras = Array.isArray(conversaciones) ? conversaciones : [];
  
  // Validar y limpiar conversaciones para evitar errores
  const conversacionesValidadas = conversacionesSeguras.filter(conv => {
    if (!conv || !conv._id || !conv.participantes) {
      return false;
    }
    
    if (!Array.isArray(conv.participantes)) {
      return false;
    }
    
    // Verificar que cada participante tenga la estructura correcta
    const participantesValidos = conv.participantes.every(p => {
      if (!p) return false;
      
      // Si es un string (ID), está bien - se convertirá en el servicio
      if (typeof p === 'string') return true;
      
      // Si es un objeto, debe tener _id y fullName
      if (typeof p === 'object' && p._id && p.fullName) return true;
      
      return false;
    });
    
    if (!participantesValidos) {
      return false;
    }
    
    return true;
  });
  
  
  
  // Filtrar conversaciones
  const conversacionesFiltradas = conversacionesValidadas.filter(conversacion => {
    // Validar que la conversación tenga participantes válidos
    if (!conversacion.participantes || !Array.isArray(conversacion.participantes)) {
      return false;
    }

    const matchesSearch = conversacion.participantes.some(p => 
      p && p.fullName && typeof p.fullName === 'string' && 
      p.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    ) || (conversacion.ultimoMensajeContenido && 
          typeof conversacion.ultimoMensajeContenido === 'string' &&
          conversacion.ultimoMensajeContenido.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterTipo === 'todos' || conversacion.metadata?.tipo === filterTipo;
    
    return matchesSearch && matchesFilter;
  });

  // Ordenar conversaciones por fecha del último mensaje (más recientes primero)
  const conversacionesOrdenadas = conversacionesFiltradas.sort((a, b) => {
    if (!a.ultimoMensajeFecha && !b.ultimoMensajeFecha) return 0;
    if (!a.ultimoMensajeFecha) return 1;
    if (!b.ultimoMensajeFecha) return -1;
    return new Date(b.ultimoMensajeFecha).getTime() - new Date(a.ultimoMensajeFecha).getTime();
  });

  // Contar mensajes no leídos totales
  const totalMensajesNoLeidos = conversacionesValidadas.reduce((total, conv) => {
    if (!conv.mensajesNoLeidos || typeof conv.mensajesNoLeidos !== 'object') {
      return total;
    }
    return total + Object.values(conv.mensajesNoLeidos).reduce((a, b) => (a || 0) + (b || 0), 0);
  }, 0);

  // Agrupar conversaciones por tipo
  const conversacionesPorTipo = {
    todos: conversacionesOrdenadas,
    general: conversacionesOrdenadas.filter(c => c.metadata?.tipo === 'general'),
    entrenamiento: conversacionesOrdenadas.filter(c => c.metadata?.tipo === 'entrenamiento'),
    nutricion: conversacionesOrdenadas.filter(c => c.metadata?.tipo === 'nutricion'),
    consulta: conversacionesOrdenadas.filter(c => c.metadata?.tipo === 'consulta')
  };

  const handleNuevaConversacion = () => {
    // Aquí se implementaría la lógica para crear una nueva conversación
    setShowNuevaConversacion(false);
    setNuevoParticipante('');
    setNuevoTipo('general');
  };

  return (
    <Box
      style={{
        width: '350px',
        borderRight: '1px solid var(--mantine-color-gray-3)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header del sidebar */}
      <Box p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
        <Group justify="space-between" align="center" mb="md">
          <Group gap="xs">
            <IconMessage size={20} />
            <Text fw={600} size="lg">Chat</Text>
            {totalMensajesNoLeidos > 0 && (
              <Badge color="red" variant="filled">
                {totalMensajesNoLeidos > 99 ? '99+' : totalMensajesNoLeidos}
              </Badge>
            )}
          </Group>
          
          <Group gap="xs">
            {onRefreshConversaciones && (
              <Button
                size="sm"
                variant="light"
                leftSection={<IconRefresh size={16} />}
                onClick={onRefreshConversaciones}
              >
                Actualizar
              </Button>
            )}
            
            {onNuevaConversacion && (
              <Button
                size="sm"
                leftSection={<IconPlus size={16} />}
                onClick={() => setShowNuevaConversacion(true)}
              >
                Nueva
              </Button>
            )}
          </Group>
        </Group>

        {/* Barra de búsqueda */}
        <TextInput
          placeholder="Buscar conversaciones..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftSection={<IconSearch size={16} />}
          size="sm"
          mb="md"
        />

        {/* Filtros */}
        <Group gap="xs" wrap="nowrap">
          <Select
            size="xs"
            data={[
              { value: 'todos', label: 'Todas' },
              { value: 'general', label: 'General' },
              { value: 'entrenamiento', label: 'Entrenamiento' },
              { value: 'nutricion', label: 'Nutrición' },
              { value: 'consulta', label: 'Consulta' }
            ]}
            value={filterTipo}
            onChange={(value) => setFilterTipo(value || 'todos')}
            style={{ flex: 1 }}
          />
          
          <ActionIcon variant="subtle" color="gray" size="sm">
            <IconFilter size={16} />
          </ActionIcon>
        </Group>
      </Box>

      {/* Lista de conversaciones */}
      <ScrollArea style={{ flex: 1 }}>
        <Stack gap="xs" p="md">
          {/* Conversaciones activas primero */}
          {conversacionesPorTipo.todos
            .filter(c => !c.metadata?.tipo || c.metadata.tipo === 'general')
            .map(conversacion => (
              <ConversationItem
                key={conversacion._id}
                conversacion={conversacion}
                isActive={conversacionActiva === conversacion._id}
                onSelect={onSelectConversacion}
                // onArchive={onArchiveConversacion}
                // onDelete={onDeleteConversacion}
                onPin={onPinConversacion}
                onMute={onMuteConversacion}
              />
            ))}

          {/* Separador para conversaciones de entrenamiento */}
          {conversacionesPorTipo.entrenamiento.length > 0 && (
            <>
              <Divider my="sm" label="Entrenamiento" labelPosition="center" />
              {conversacionesPorTipo.entrenamiento.map(conversacion => (
                <ConversationItem
                  key={conversacion._id}
                  conversacion={conversacion}
                  isActive={conversacionActiva === conversacion._id}
                  onSelect={onSelectConversacion}
                  // onArchive={onArchiveConversacion}
                  // onDelete={onDeleteConversacion}
                  onPin={onPinConversacion}
                  onMute={onMuteConversacion}
                />
              ))}
            </>
          )}

          {/* Separador para conversaciones de nutrición */}
          {conversacionesPorTipo.nutricion.length > 0 && (
            <>
              <Divider my="sm" label="Nutrición" labelPosition="center" />
              {conversacionesPorTipo.nutricion.map(conversacion => (
                <ConversationItem
                  key={conversacion._id}
                  conversacion={conversacion}
                  isActive={conversacionActiva === conversacion._id}
                  onSelect={onSelectConversacion}
                  // onArchive={onArchiveConversacion}
                  // onDelete={onDeleteConversacion}
                  onPin={onPinConversacion}
                  onMute={onMuteConversacion}
                />
              ))}
            </>
          )}

          {/* Separador para consultas */}
          {conversacionesPorTipo.consulta.length > 0 && (
            <>
              <Divider my="sm" label="Consultas" labelPosition="center" />
              {conversacionesPorTipo.consulta.map(conversacion => (
                <ConversationItem
                  key={conversacion._id}
                  conversacion={conversacion}
                  isActive={conversacionActiva === conversacion._id}
                  onSelect={onSelectConversacion}
                  // onArchive={onArchiveConversacion}
                  // onDelete={onDeleteConversacion}
                  onPin={onPinConversacion}
                  onMute={onMuteConversacion}
                />
              ))}
            </>
          )}

          {/* Mensaje cuando no hay conversaciones */}
          {conversacionesPorTipo.todos.length === 0 && (
            <Paper p="xl" ta="center" c="dimmed">
              <IconMessage size={48} style={{ margin: '0 auto 1rem' }} />
              <Text size="sm" mb="xs">
                {searchTerm || filterTipo !== 'todos' 
                  ? 'No se encontraron conversaciones con los filtros aplicados'
                  : 'No tienes conversaciones activas'
                }
              </Text>
              {!searchTerm && filterTipo === 'todos' && (
                <Text size="xs" c="dimmed">
                  Las conversaciones aparecerán aquí cuando recibas mensajes o crees nuevas conversaciones
                </Text>
              )}
            </Paper>
          )}
        </Stack>
      </ScrollArea>

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
