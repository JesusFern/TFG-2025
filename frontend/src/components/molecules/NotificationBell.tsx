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
import { useNotificationContext } from '../../contexts/NotificationContext';
import { NotificationItem } from './NotificationItem';
import { NotificationBellProps } from '../../types/notifications';

export const NotificationBell: React.FC<NotificationBellProps> = ({
  onViewAllClick,
  showCount = true,
  maxVisible = 5
}) => {
  const [opened, setOpened] = useState(false);
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
                  const notificacionConvertida = {
                    ...notificacion,
                    programadaPara: notificacion.programadaPara ? 
                      (typeof notificacion.programadaPara === 'string' ? 
                        notificacion.programadaPara : 
                        notificacion.programadaPara.toISOString()) : 
                      undefined,
                    expiraEn: notificacion.expiraEn ? 
                      (typeof notificacion.expiraEn === 'string' ? 
                        notificacion.expiraEn : 
                        notificacion.expiraEn.toISOString()) : 
                      undefined,
                    createdAt: notificacion.createdAt ? 
                      (typeof notificacion.createdAt === 'string' ? 
                        notificacion.createdAt : 
                        notificacion.createdAt.toISOString()) : 
                      new Date().toISOString(),
                    updatedAt: notificacion.updatedAt ? 
                      (typeof notificacion.updatedAt === 'string' ? 
                        notificacion.updatedAt : 
                        notificacion.updatedAt.toISOString()) : 
                      new Date().toISOString()
                  };
                  
                  return (
                    <NotificationItem
                      key={notificacion._id || `notification-${index}`}
                      notificacion={notificacionConvertida}
                      onMarkAsRead={() => markAsRead(notificacion._id)}
                      onDelete={() => deleteNotification(notificacion._id)}
                      onAction={() => {}}
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
