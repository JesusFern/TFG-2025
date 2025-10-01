import React from 'react';
import {
  Paper,
  Group,
  Text,
  ActionIcon,
  Badge,
  Stack,
  Box,
  Tooltip,
  ThemeIcon
} from '@mantine/core';
import {
  IconCheck,
  IconTrash,
  IconExternalLink,
  IconMessage,
  IconBell,
  IconBarbell,
  IconApple,
  IconClock
} from '@tabler/icons-react';
import { NotificationItemProps, TipoNotificacion, PrioridadNotificacion } from '../../types/notifications';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const getIconByType = (tipo: TipoNotificacion) => {
  switch (tipo) {
    case 'mensaje':
      return <IconMessage size={16} />;
    case 'sistema':
      return <IconBell size={16} />;
    case 'recordatorio':
      return <IconClock size={16} />;
    case 'entrenamiento':
      return <IconBarbell size={16} />;
    case 'nutricion':
      return <IconApple size={16} />;
    default:
      return <IconBell size={16} />;
  }
};

const getColorByType = (tipo: TipoNotificacion) => {
  switch (tipo) {
    case 'mensaje':
      return 'blue';
    case 'sistema':
      return 'gray';
    case 'recordatorio':
      return 'orange';
    case 'entrenamiento':
      return 'green';
    case 'nutricion':
      return 'pink';
    default:
      return 'gray';
  }
};

const getColorByPrioridad = (prioridad: PrioridadNotificacion) => {
  switch (prioridad) {
    case 'baja':
      return 'gray';
    case 'normal':
      return 'blue';
    case 'alta':
      return 'orange';
    case 'urgente':
      return 'red';
    default:
      return 'blue';
  }
};

const getPrioridadText = (prioridad: PrioridadNotificacion) => {
  switch (prioridad) {
    case 'baja':
      return 'Baja';
    case 'normal':
      return 'Normal';
    case 'alta':
      return 'Alta';
    case 'urgente':
      return 'Urgente';
    default:
      return 'Normal';
  }
};

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notificacion,
  onMarkAsRead,
  onDelete,
  onAction,
  compact = false
}) => {
  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMarkAsRead && !notificacion.leida) {
      onMarkAsRead(notificacion._id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(notificacion._id);
    }
  };

  const handleAction = () => {
    console.log('NotificationItem: handleAction called', { 
      hasOnAction: !!onAction, 
      accion: notificacion.accion 
    });
    
    if (onAction && notificacion.accion) {
      onAction(notificacion.accion);
    }
  };

  const formatTime = (date: string | Date) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return formatDistanceToNow(dateObj, { 
        addSuffix: true, 
        locale: es 
      });
    } catch {
      return 'Hace un momento';
    }
  };

  return (
    <Paper
      p={compact ? "sm" : "md"}
      radius="md"
      style={{
        cursor: notificacion.accion ? 'pointer' : 'default',
        backgroundColor: notificacion.leida ? 'var(--mantine-color-gray-0)' : 'white',
        border: notificacion.leida ? '1px solid var(--mantine-color-gray-2)' : '1px solid var(--mantine-color-gray-3)',
        transition: 'all 0.2s ease',
      }}
      onClick={handleAction}
      onMouseEnter={(e) => {
        if (notificacion.accion) {
          e.currentTarget.style.backgroundColor = 'var(--mantine-color-gray-1)';
        }
      }}
      onMouseLeave={(e) => {
        if (notificacion.accion) {
          e.currentTarget.style.backgroundColor = notificacion.leida ? 'var(--mantine-color-gray-0)' : 'white';
        }
      }}
    >
      <Group align="flex-start" gap="sm" wrap="nowrap">
        <ThemeIcon
          color={getColorByType(notificacion.tipo)}
          variant="light"
          size={compact ? "sm" : "md"}
          radius="xl"
        >
          {getIconByType(notificacion.tipo)}
        </ThemeIcon>

        <Box style={{ flex: 1, minWidth: 0 }}>
          <Group justify="space-between" align="flex-start" mb={4}>
            <Text
              fw={notificacion.leida ? 400 : 600}
              size={compact ? "sm" : "md"}
              lineClamp={2}
              style={{ flex: 1 }}
            >
              {notificacion.titulo}
            </Text>
            
            <Group gap="xs" align="flex-start">
              {!notificacion.leida && (
                <Badge
                  size="xs"
                  color="blue"
                  variant="dot"
                />
              )}
              
              <Badge
                size="xs"
                color={getColorByPrioridad(notificacion.prioridad)}
                variant="light"
              >
                {getPrioridadText(notificacion.prioridad)}
              </Badge>
            </Group>
          </Group>

          <Text
            size={compact ? "xs" : "sm"}
            c="dimmed"
            lineClamp={compact ? 2 : 3}
            mb={compact ? 4 : 8}
          >
            {notificacion.contenido}
          </Text>

          <Group justify="space-between" align="center">
            <Text size="xs" c="dimmed">
              {formatTime(notificacion.createdAt)}
            </Text>

            {notificacion.accion && (
              <Tooltip label="Hacer clic para abrir">
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAction();
                  }}
                >
                  <IconExternalLink size={12} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        </Box>

        <Stack gap="xs" align="center">
          {!notificacion.leida && onMarkAsRead && (
            <Tooltip label="Marcar como leída">
              <ActionIcon
                variant="subtle"
                color="green"
                size="sm"
                onClick={handleMarkAsRead}
              >
                <IconCheck size={14} />
              </ActionIcon>
            </Tooltip>
          )}

          {onDelete && (
            <Tooltip label="Eliminar">
              <ActionIcon
                variant="subtle"
                color="red"
                size="sm"
                onClick={handleDelete}
              >
                <IconTrash size={14} />
              </ActionIcon>
            </Tooltip>
          )}
        </Stack>
      </Group>
    </Paper>
  );
};
