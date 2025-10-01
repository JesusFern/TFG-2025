import React, { useState } from 'react';
import {
  ActionIcon,
  Badge,
  Popover,
  Text,
  Button,
  ScrollArea,
  Group,
  Stack,
  Divider,
  Loader,
  Alert
} from '@mantine/core';
import {
  IconBell,
  IconBellFilled,
  IconX,
  IconCheck,
  IconEye
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useNotificationContext } from '../../contexts/NotificationContext';
import { NotificationItem } from './NotificationItem';
import { NotificationBellProps } from '../../types/notifications';
import { convertNotificationToStandard } from '../../utils/notificationUtils';

export const NotificationBell: React.FC<NotificationBellProps> = ({
  onViewAllClick,
  showCount = true,
  maxVisible = 5
}) => {
  const [opened, setOpened] = useState(false);
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    isConnecting,
    connectionError,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotificationContext();


  const handleViewAllClick = () => {
    if (onViewAllClick) {
      onViewAllClick();
    }
    setOpened(false);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  // Función para manejar la acción de redirección
  const handleNotificationAction = (accion: { tipo: 'navegar' | 'abrir_mensaje' | 'abrir_conversacion' | 'abrir_plan' | 'abrir_dieta' | 'abrir_sesion' | 'abrir_dia_dieta'; url?: string; metadata?: Record<string, string | number | boolean> } | undefined) => {
    console.log('NotificationBell: handleNotificationAction called with:', accion);
    
    if (!accion) {
      console.log('NotificationBell: No action provided');
      return;
    }

    // Cerrar el popover antes de navegar
    setOpened(false);

    switch (accion.tipo) {
      case 'navegar':
        console.log('NotificationBell: Navigating to:', accion.url);
        if (accion.url) {
          navigate(accion.url);
        }
        break;
      case 'abrir_mensaje':
        if (accion.metadata?.mensajeId) {
          navigate(`/chat?mensaje=${accion.metadata.mensajeId}`);
        } else if (accion.metadata?.conversacionId) {
          navigate(`/chat?conversacion=${accion.metadata.conversacionId}`);
        }
        break;
      case 'abrir_conversacion':
        if (accion.metadata?.conversacionId) {
          navigate(`/chat?conversacion=${accion.metadata.conversacionId}`);
        }
        break;
      case 'abrir_plan':
        if (accion.metadata?.planId) {
          navigate(`/mis-entrenamientos/${accion.metadata.planId}`);
        }
        break;
      case 'abrir_sesion':
        if (accion.metadata?.sesionId && accion.metadata?.planId) {
          navigate(`/mis-entrenamientos/${accion.metadata.planId}/sesion/${accion.metadata.sesionId}`);
        }
        break;
      case 'abrir_dieta':
        if (accion.metadata?.dietaId) {
          navigate(`/ver-dieta/${accion.metadata.dietaId}`);
        }
        break;
      case 'abrir_dia_dieta':
        if (accion.metadata?.dietaId && accion.metadata?.dia) {
          navigate(`/dieta/${accion.metadata.dietaId}/dia/${accion.metadata.dia}`);
        }
        break;
    }
  };

  // Mostrar solo notificaciones no leídas en el display de la campana
  const notificacionesNoLeidas = notifications.filter(notif => !notif.leida);
  const notificacionesVisibles = notificacionesNoLeidas.slice(0, maxVisible);
  const count = unreadCount;

  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      position="bottom-end"
      withArrow
      shadow="md"
      radius="md"
      width={400}
      zIndex={1000}
    >
      <Popover.Target>
        <div style={{ 
          position: 'relative',
          display: 'inline-block',
          padding: '4px'
        }}>
          <ActionIcon
            variant="subtle"
            color="gray"
            size="xl"
            onClick={() => setOpened(!opened)}
          >
            {count > 0 ? <IconBellFilled size={20} /> : <IconBell size={20} />}
          </ActionIcon>
          {showCount && count > 0 && (
            <Badge
              size="sm"
              color="red"
              variant="filled"
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                minWidth: 20,
                height: 20,
                fontSize: 10,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                zIndex: 10,
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            >
              {count > 99 ? '99+' : count}
            </Badge>
          )}
        </div>
      </Popover.Target>

      <Popover.Dropdown p={0}>
        <div style={{ padding: '16px' }}>
          <Group justify="space-between" mb="md">
            <Text fw={600} size="sm">
              Notificaciones
              {count > 0 && (
                <Text component="span" c="dimmed" size="xs" ml={4}>
                  ({count} sin leer)
                </Text>
              )}
            </Text>
            {count > 0 && (
              <Button
                variant="subtle"
                size="xs"
                leftSection={<IconCheck size={12} />}
                onClick={handleMarkAllAsRead}
              >
                Marcar todas
              </Button>
            )}
          </Group>

          {connectionError && (
            <Alert color="red" mb="md" icon={<IconX size={16} />}>
              {connectionError}
            </Alert>
          )}

          <ScrollArea.Autosize mah={400}>
            {isConnecting || isLoading ? (
              <Group justify="center" py="xl">
                <Loader size="sm" />
                <Text size="sm" c="dimmed">
                  {isConnecting ? 'Conectando...' : 'Cargando notificaciones...'}
                </Text>
              </Group>
            ) : notificacionesVisibles.length === 0 ? (
              <Stack align="center" py="xl">
                <IconBell size={48} color="var(--mantine-color-gray-4)" />
                <Text size="sm" c="dimmed" ta="center">
                  {notificacionesNoLeidas.length === 0 
                    ? 'No tienes notificaciones sin leer'
                    : 'No hay notificaciones para mostrar'
                  }
                </Text>
              </Stack>
            ) : (
              <Stack gap="xs">
                {notificacionesVisibles.map((notificacion, index) => {
                  // Convertir el tipo Notification a Notificacion
                  const notificacionConvertida = convertNotificationToStandard(notificacion);
                  
                  // Log para debug
                  console.log('NotificationBell: Rendering notification:', {
                    id: notificacion._id,
                    titulo: notificacion.titulo,
                    accion: notificacion.accion
                  });
                  
                  return (
                    <NotificationItem
                      key={notificacion._id || `notification-${index}`}
                      notificacion={notificacionConvertida}
                      onMarkAsRead={() => markAsRead(notificacion._id)}
                      onDelete={() => deleteNotification(notificacion._id)}
                      onAction={handleNotificationAction}
                      compact
                    />
                  );
                })}
              </Stack>
            )}
          </ScrollArea.Autosize>

          <Divider my="md" />
          <Button
            variant="light"
            fullWidth
            leftSection={<IconEye size={16} />}
            onClick={handleViewAllClick}
          >
            Ver todas las notificaciones
          </Button>
        </div>
      </Popover.Dropdown>
    </Popover>
  );
};
