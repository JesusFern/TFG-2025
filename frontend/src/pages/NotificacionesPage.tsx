import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Text,
  Group,
  Button,
  Stack,
  Paper,
  Badge,
  Select,
  Switch,
  Loader,
  Alert,
  Pagination,
  Tabs,
  ActionIcon,
  Tooltip
} from '@mantine/core';
import {
  IconBell,
  IconCheck,
  IconRefresh,
  IconBellOff
} from '@tabler/icons-react';
import { useNotificationContext } from '../contexts/NotificationContext';
import { NotificationItem } from '../components/molecules/NotificationItem';
import { FiltrosNotificaciones } from '../types/notifications';
import { convertNotificationToStandard } from '../utils/notificationUtils';

const NotificacionesPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    isConnecting,
    connectionError,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getNotificationsByType,
    loadInitialNotifications,
  } = useNotificationContext();

  const [filtros, setFiltros] = useState<FiltrosNotificaciones>({
    limit: 20,
    offset: 0
  });
  const [tabActivo, setTabActivo] = useState<string>('todas');
  const [paginaActual, setPaginaActual] = useState(1);

  // Filtrar notificaciones basado en los filtros activos
  const notificacionesFiltradas = React.useMemo(() => {
    let notificacionesFiltradas = notifications;

    // Filtrar por tipo
    if (filtros.tipo) {
      notificacionesFiltradas = getNotificationsByType(filtros.tipo as 'mensaje' | 'recordatorio' | 'sistema' | 'entrenamiento' | 'nutricion');
    }

    // Filtrar por estado de leído
    if (filtros.leida === false) {
      notificacionesFiltradas = notificacionesFiltradas.filter(n => !n.leida);
    } else if (filtros.leida === true) {
      notificacionesFiltradas = notificacionesFiltradas.filter(n => n.leida);
    }

    // Filtrar por prioridad
    if (filtros.prioridad) {
      notificacionesFiltradas = notificacionesFiltradas.filter(n => n.prioridad === filtros.prioridad);
    }

    // Aplicar paginación
    const offset = filtros.offset || 0;
    const limit = filtros.limit || 20;
    return notificacionesFiltradas.slice(offset, offset + limit);
  }, [notifications, filtros, getNotificationsByType]);

  const handleFiltroChange = (key: keyof FiltrosNotificaciones, value: string | boolean | number | undefined) => {
    setFiltros(prev => ({
      ...prev,
      [key]: value,
      offset: 0 // Reset a la primera página
    }));
    setPaginaActual(1);
  };

  const handleTabChange = (value: string | null) => {
    if (!value) return;
    
    setTabActivo(value);
    
    if (value === 'todas') {
      setFiltros(prev => ({ ...prev, leida: undefined, tipo: undefined }));
    } else if (value === 'no-leidas') {
      setFiltros(prev => ({ ...prev, leida: false, tipo: undefined }));
    } else {
      setFiltros(prev => ({ ...prev, leida: undefined, tipo: value }));
    }
    
    setPaginaActual(1);
  };

  const handlePaginaChange = (pagina: number) => {
    setPaginaActual(pagina);
    setFiltros(prev => ({
      ...prev,
      offset: (pagina - 1) * (prev.limit || 20)
    }));
  };

  const handleRefresh = () => {
    // Recargar notificaciones desde el servidor
    loadInitialNotifications();
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  // Función para manejar la acción de redirección
  const handleNotificationAction = (accion: { tipo: 'navegar' | 'abrir_mensaje' | 'abrir_conversacion' | 'abrir_plan' | 'abrir_dieta' | 'abrir_sesion' | 'abrir_dia_dieta'; url?: string; metadata?: Record<string, string | number | boolean> } | undefined) => {
    if (!accion) {
      return;
    }

    switch (accion.tipo) {
      case 'navegar':
        if (accion.url) {
          navigate(accion.url);
        }
        break;
      case 'abrir_mensaje':
        if (accion.metadata?.mensajeId) {
          // Navegar a la conversación del mensaje
          navigate(`/chat?mensaje=${accion.metadata.mensajeId}`);
        } else if (accion.metadata?.conversacionId) {
          // Si no hay mensajeId, navegar a la conversación
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
          // Usar la ruta correcta para planes de entrenamiento
          navigate(`/mis-entrenamientos/${accion.metadata.planId}`);
        }
        break;
      case 'abrir_sesion':
        if (accion.metadata?.sesionId && accion.metadata?.planId) {
          // Usar la ruta correcta para sesiones de entrenamiento
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

  // Calcular estadísticas básicas
  const stats = {
    total: notifications.length,
    noLeidas: unreadCount,
    porTipo: {
      mensaje: notifications.filter(n => n.tipo === 'mensaje').length,
      sistema: notifications.filter(n => n.tipo === 'sistema').length,
      recordatorio: notifications.filter(n => n.tipo === 'recordatorio').length,
      entrenamiento: notifications.filter(n => n.tipo === 'entrenamiento').length,
      nutricion: notifications.filter(n => n.tipo === 'nutricion').length
    },
    porPrioridad: {
      baja: notifications.filter(n => n.prioridad === 'baja').length,
      normal: notifications.filter(n => n.prioridad === 'normal').length,
      alta: notifications.filter(n => n.prioridad === 'alta').length,
      urgente: notifications.filter(n => n.prioridad === 'urgente').length
    }
  };

  // Calcular el total de notificaciones filtradas para la paginación
  const totalNotificacionesFiltradas = React.useMemo(() => {
    let total = notifications;

    if (filtros.tipo) {
      total = getNotificationsByType(filtros.tipo as 'mensaje' | 'recordatorio' | 'sistema' | 'entrenamiento' | 'nutricion');
    }

    if (filtros.leida === false) {
      total = total.filter(n => !n.leida);
    } else if (filtros.leida === true) {
      total = total.filter(n => n.leida);
    }

    if (filtros.prioridad) {
      total = total.filter(n => n.prioridad === filtros.prioridad);
    }

    return total.length;
  }, [notifications, filtros, getNotificationsByType]);

  const totalPaginas = Math.ceil(totalNotificacionesFiltradas / (filtros.limit || 20));

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={1} mb="xs">
              Notificaciones
            </Title>
            <Text c="dimmed" size="sm">
              {stats ? (
                <>
                  {stats.total} notificaciones totales • {stats.noLeidas} sin leer
                </>
              ) : (
                'Cargando estadísticas...'
              )}
            </Text>
          </div>

          <Group gap="sm">
            <Tooltip label="Actualizar">
              <ActionIcon
                variant="light"
                onClick={handleRefresh}
                loading={isConnecting}
              >
                <IconRefresh size={16} />
              </ActionIcon>
            </Tooltip>


            {stats && stats.noLeidas > 0 && (
              <Button
                variant="light"
                leftSection={<IconCheck size={16} />}
                onClick={handleMarkAllAsRead}
                size="sm"
              >
                Marcar todas como leídas
              </Button>
            )}
          </Group>
        </Group>

        {/* Filtros */}
        <Paper p="md" withBorder>
          <Group gap="md" align="end" wrap="wrap">
            <Select
              label="Tipo"
              placeholder="Todos los tipos"
              value={filtros.tipo || ''}
              onChange={(value) => handleFiltroChange('tipo', value || undefined)}
              data={[
                { value: '', label: 'Todos los tipos' },
                { value: 'mensaje', label: 'Mensajes' },
                { value: 'sistema', label: 'Sistema' },
                { value: 'recordatorio', label: 'Recordatorios' },
                { value: 'entrenamiento', label: 'Entrenamiento' },
                { value: 'nutricion', label: 'Nutrición' }
              ]}
              clearable
              style={{ minWidth: 150 }}
            />

            <Select
              label="Prioridad"
              placeholder="Todas las prioridades"
              value={filtros.prioridad || ''}
              onChange={(value) => handleFiltroChange('prioridad', value || undefined)}
              data={[
                { value: '', label: 'Todas las prioridades' },
                { value: 'baja', label: 'Baja' },
                { value: 'normal', label: 'Normal' },
                { value: 'alta', label: 'Alta' },
                { value: 'urgente', label: 'Urgente' }
              ]}
              clearable
              style={{ minWidth: 150 }}
            />

            <Switch
              label="Solo no leídas"
              checked={filtros.leida === false}
              onChange={(event) => 
                handleFiltroChange('leida', event.currentTarget.checked ? false : undefined)
              }
            />
          </Group>
        </Paper>

        {/* Tabs */}
        <Tabs value={tabActivo} onChange={handleTabChange}>
          <Tabs.List>
            <Tabs.Tab value="todas" leftSection={<IconBell size={16} />}>
              Todas
              {stats && (
                <Badge size="xs" color="gray" variant="light" ml={8}>
                  {stats.total}
                </Badge>
              )}
            </Tabs.Tab>
            <Tabs.Tab value="no-leidas" leftSection={<IconBellOff size={16} />}>
              Sin leer
              {stats && stats.noLeidas > 0 && (
                <Badge size="xs" color="red" variant="filled" ml={8}>
                  {stats.noLeidas}
                </Badge>
              )}
            </Tabs.Tab>
            <Tabs.Tab value="mensaje" leftSection={<IconBell size={16} />}>
              Mensajes
              {stats && (
                <Badge size="xs" color="blue" variant="light" ml={8}>
                  {stats.porTipo.mensaje}
                </Badge>
              )}
            </Tabs.Tab>
            <Tabs.Tab value="entrenamiento" leftSection={<IconBell size={16} />}>
              Entrenamiento
              {stats && (
                <Badge size="xs" color="green" variant="light" ml={8}>
                  {stats.porTipo.entrenamiento}
                </Badge>
              )}
            </Tabs.Tab>
            <Tabs.Tab value="nutricion" leftSection={<IconBell size={16} />}>
              Nutrición
              {stats && (
                <Badge size="xs" color="pink" variant="light" ml={8}>
                  {stats.porTipo.nutricion}
                </Badge>
              )}
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>

        {/* Error */}
        {connectionError && (
          <Alert
            color="red"
            icon={<IconBell size={16} />}
            title="Error de conexión"
            withCloseButton
          >
            {connectionError}
          </Alert>
        )}

        {/* Lista de notificaciones */}
        <Paper withBorder radius="md">
          {isConnecting || isLoading ? (
            <Group justify="center" py="xl">
              <Loader size="sm" />
              <Text size="sm" c="dimmed">
                {isConnecting ? 'Conectando...' : 'Cargando notificaciones...'}
              </Text>
            </Group>
          ) : notificacionesFiltradas.length === 0 ? (
            <Stack align="center" py="xl">
              <IconBell size={48} color="var(--mantine-color-gray-4)" />
              <Text size="lg" fw={500} c="dimmed">
                No hay notificaciones
              </Text>
              <Text size="sm" c="dimmed" ta="center">
                {tabActivo === 'no-leidas' 
                  ? 'No tienes notificaciones sin leer'
                  : 'No se encontraron notificaciones con los filtros aplicados'
                }
              </Text>
            </Stack>
          ) : (
            <Stack gap="xs" p="md">
              {notificacionesFiltradas.map((notificacion) => {
                // Convertir el tipo Notification a Notificacion
                const notificacionConvertida = convertNotificationToStandard(notificacion);
                
                return (
                  <NotificationItem
                    key={notificacion._id}
                    notificacion={notificacionConvertida}
                    onMarkAsRead={() => markAsRead(notificacion._id)}
                    onDelete={() => deleteNotification(notificacion._id)}
                    onAction={handleNotificationAction}
                  />
                );
              })}
            </Stack>
          )}
        </Paper>

        {/* Paginación */}
        {totalPaginas > 1 && (
          <Group justify="center">
            <Pagination
              value={paginaActual}
              onChange={handlePaginaChange}
              total={totalPaginas}
              size="sm"
            />
          </Group>
        )}
      </Stack>
    </Container>
  );
};

export default NotificacionesPage;
