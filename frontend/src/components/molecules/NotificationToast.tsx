import React, { useEffect, useState } from 'react';
import { 
  Notification, 
  Group, 
  Text, 
  ActionIcon, 
  Stack, 
  Badge, 
  Paper,
  Button,
  Box
} from '@mantine/core';
import { 
  IconX, 
  IconCheck, 
  IconTrash, 
  IconBell, 
  IconBellRinging,
  IconDumbbell,
  IconApple,
  IconMessage,
  IconCalendar,
  IconAlertTriangle
} from '@tabler/icons-react';
import { useNotificationContext } from '../../contexts/NotificationContext';

// Tipos para las props
interface NotificationToastProps {
  notification: Notification;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

// Mapeo de tipos de notificación a iconos
const getNotificationIcon = (tipo: Notification['tipo']) => {
  switch (tipo) {
    case 'mensaje':
      return <IconMessage size={20} />;
    case 'entrenamiento':
      return <IconDumbbell size={20} />;
    case 'nutricion':
      return <IconApple size={20} />;
    case 'recordatorio':
      return <IconBellRinging size={20} />;
    case 'sistema':
      return <IconBell size={20} />;
    default:
      return <IconBell size={20} />;
  }
};

// Mapeo de prioridades a colores
const getPriorityColor = (prioridad: Notification['prioridad']) => {
  switch (prioridad) {
    case 'urgente':
      return 'red';
    case 'alta':
      return 'orange';
    case 'normal':
      return 'blue';
    case 'baja':
      return 'gray';
    default:
      return 'blue';
  }
};

// Mapeo de prioridades a iconos de alerta
const getPriorityIcon = (prioridad: Notification['prioridad']) => {
  if (prioridad === 'urgente') {
    return <IconAlertTriangle size={16} />;
  }
  return null;
};

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onClose,
  autoClose = true,
  duration = 5000
}) => {
  const { markAsRead, deleteNotification } = useNotificationContext();
  const [isVisible, setIsVisible] = useState(true);

  // Auto-cerrar la notificación después del tiempo especificado
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Esperar a que termine la animación
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  // Marcar como leída cuando se muestra
  useEffect(() => {
    if (!notification.leida) {
      markAsRead(notification._id);
    }
  }, [notification._id, notification.leida, markAsRead]);

  const handleMarkAsRead = () => {
    if (!notification.leida) {
      markAsRead(notification._id);
    }
  };

  const handleDelete = () => {
    deleteNotification(notification._id);
    onClose();
  };

  const handleAction = () => {
    if (notification.accion) {
      switch (notification.accion.tipo) {
        case 'navegar':
          if (notification.accion.url) {
            window.location.href = notification.accion.url;
          }
          break;
        case 'abrir_mensaje':
        case 'abrir_conversacion':
        case 'abrir_plan':
        case 'abrir_dieta':
          // Aquí se podría implementar la navegación específica
          console.log('Acción de notificación:', notification.accion);
          break;
      }
    }
    onClose();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Paper
      shadow="md"
      radius="md"
      p="md"
      mb="sm"
      style={{
        borderLeft: `4px solid ${getPriorityColor(notification.prioridad)}`,
        minWidth: '300px',
        maxWidth: '400px',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
        transition: 'all 0.3s ease-in-out'
      }}
    >
      <Stack spacing="xs">
        {/* Header con icono, título y prioridad */}
        <Group position="apart" noWrap>
          <Group spacing="xs" noWrap>
            {getNotificationIcon(notification.tipo)}
            <Text size="sm" weight={600} lineClamp={1}>
              {notification.titulo}
            </Text>
            {getPriorityIcon(notification.prioridad) && (
              <Badge 
                color={getPriorityColor(notification.prioridad)} 
                size="xs" 
                variant="filled"
              >
                {notification.prioridad}
              </Badge>
            )}
          </Group>
          <ActionIcon
            size="sm"
            variant="subtle"
            color="gray"
            onClick={onClose}
          >
            <IconX size={14} />
          </ActionIcon>
        </Group>

        {/* Contenido de la notificación */}
        <Text size="sm" color="dimmed" lineClamp={3}>
          {notification.contenido}
        </Text>

        {/* Footer con acciones */}
        <Group position="apart" noWrap>
          <Group spacing="xs">
            {!notification.leida && (
              <Button
                size="xs"
                variant="subtle"
                leftIcon={<IconCheck size={14} />}
                onClick={handleMarkAsRead}
              >
                Marcar como leída
              </Button>
            )}
            {notification.accion && (
              <Button
                size="xs"
                variant="light"
                onClick={handleAction}
              >
                Ver más
              </Button>
            )}
          </Group>
          <ActionIcon
            size="sm"
            variant="subtle"
            color="red"
            onClick={handleDelete}
          >
            <IconTrash size={14} />
          </ActionIcon>
        </Group>
      </Stack>
    </Paper>
  );
};

// Componente para mostrar múltiples notificaciones
export const NotificationToastList: React.FC<{
  notifications: Notification[];
  onClose: (notificationId: string) => void;
  maxNotifications?: number;
}> = ({ 
  notifications, 
  onClose, 
  maxNotifications = 5 
}) => {
  const visibleNotifications = notifications.slice(0, maxNotifications);

  return (
    <Box
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        maxHeight: '80vh',
        overflowY: 'auto'
      }}
    >
      <Stack spacing="sm">
        {visibleNotifications.map((notification) => (
          <NotificationToast
            key={notification._id}
            notification={notification}
            onClose={() => onClose(notification._id)}
            autoClose={true}
            duration={5000}
          />
        ))}
      </Stack>
    </Box>
  );
};
