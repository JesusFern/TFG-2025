import React, { useState } from 'react';
import { 
  ActionIcon, 
  Badge, 
  Popover, 
  Text, 
  Stack, 
  Group, 
  Button,
  ScrollArea,
  Divider,
  Box
} from '@mantine/core';
import { 
  IconBell, 
  IconBellRinging, 
  IconCheck, 
  IconTrash,
} from '@tabler/icons-react';
import { useNotificationContext } from '../../contexts/NotificationContext';
import { NotificationToast } from './NotificationToast';

// Props para el componente
interface NotificationBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showPopover?: boolean;
  maxNotifications?: number;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  size = 'md',
  showPopover = true,
  maxNotifications = 10
}) => {
  const {
    notifications,
    unreadCount,
    isConnected,
    markAllAsRead,
    deleteNotification,
    getUnreadNotifications
  } = useNotificationContext();

  const [opened, setOpened] = useState(false);
  const [closedNotifications, setClosedNotifications] = useState<Set<string>>(new Set());

  // Obtener notificaciones no leídas y no cerradas
  const unreadNotifications = getUnreadNotifications().filter(
    notif => !closedNotifications.has(notif._id)
  );

  // Obtener notificaciones recientes (leídas y no leídas) para el popover
  const recentNotifications = notifications
    .filter(notif => !closedNotifications.has(notif._id))
    .slice(0, maxNotifications);

  const handleCloseNotification = (notificationId: string) => {
    setClosedNotifications(prev => new Set([...prev, notificationId]));
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    setOpened(false);
  };

  const handleDeleteAll = () => {
    recentNotifications.forEach(notif => {
      deleteNotification(notif._id);
    });
    setOpened(false);
  };

  // Tamaños del icono
  const iconSize = size === 'sm' ? 16 : size === 'md' ? 20 : 24;

  return (
    <>
      {/* Badge con contador */}
      <Popover
        opened={opened}
        onClose={() => setOpened(false)}
        position="bottom-end"
        withArrow
        shadow="md"
        radius="md"
        disabled={!showPopover}
      >
        <Popover.Target>
          <ActionIcon
            size={size}
            variant="subtle"
            color="gray"
            onClick={() => setOpened(!opened)}
            style={{ position: 'relative' }}
          >
            {unreadCount > 0 ? (
              <IconBellRinging size={iconSize} />
            ) : (
              <IconBell size={iconSize} />
            )}
            
            {/* Contador de notificaciones no leídas */}
            {unreadCount > 0 && (
              <Badge
                size="xs"
                color="red"
                variant="filled"
                style={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  minWidth: '18px',
                  height: '18px',
                  fontSize: '10px',
                  fontWeight: 'bold'
                }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </ActionIcon>
        </Popover.Target>

        <Popover.Dropdown>
          <Box style={{ width: '350px', maxHeight: '400px' }}>
            {/* Header del popover */}
            <Group justify="space-between" mb="md">
              <Text size="sm" fw={600}>
                Notificaciones
                {unreadCount > 0 && (
                  <Badge size="sm" color="red" variant="light" ml="xs">
                    {unreadCount}
                  </Badge>
                )}
              </Text>
              <Group gap="xs">
                {unreadCount > 0 && (
                  <Button
                    size="xs"
                    variant="subtle"
                    leftSection={<IconCheck size={12} />}
                    onClick={handleMarkAllAsRead}
                  >
                    Marcar todas
                  </Button>
                )}
                {recentNotifications.length > 0 && (
                  <Button
                    size="xs"
                    variant="subtle"
                    color="red"
                    leftSection={<IconTrash size={12} />}
                    onClick={handleDeleteAll}
                  >
                    Eliminar todas
                  </Button>
                )}
              </Group>
            </Group>

            <Divider mb="md" />

            {/* Lista de notificaciones */}
            <ScrollArea style={{ height: '300px' }}>
              {recentNotifications.length === 0 ? (
                <Stack align="center" py="xl">
                  <IconBell size={48} color="gray" />
                  <Text size="sm" c="dimmed" ta="center">
                    No hay notificaciones
                  </Text>
                </Stack>
              ) : (
                <Stack gap="xs">
                  {recentNotifications.map((notification) => (
                    <Box key={notification._id}>
                      <NotificationToast
                        notification={notification}
                        onClose={() => handleCloseNotification(notification._id)}
                        autoClose={false}
                      />
                    </Box>
                  ))}
                </Stack>
              )}
            </ScrollArea>

            {/* Footer con estado de conexión */}
            <Divider mt="md" />
            <Group justify="space-between" mt="xs">
              <Text size="xs" c="dimmed">
                {isConnected ? 'Conectado' : 'Desconectado'}
              </Text>
              <Text size="xs" c="dimmed">
                {recentNotifications.length} notificaciones
              </Text>
            </Group>
          </Box>
        </Popover.Dropdown>
      </Popover>

      {/* Notificaciones toast flotantes (solo las no leídas) */}
      {unreadNotifications.length > 0 && (
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
          <Stack gap="sm">
            {unreadNotifications.slice(0, 3).map((notification) => (
              <NotificationToast
                key={notification._id}
                notification={notification}
                onClose={() => handleCloseNotification(notification._id)}
                autoClose={true}
                duration={5000}
              />
            ))}
          </Stack>
        </Box>
      )}
    </>
  );
};
