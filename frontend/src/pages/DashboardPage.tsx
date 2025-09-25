import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Grid,
  Paper,
  Title,
  Text,
  Group,
  Badge,
  useMantineTheme,
  useMantineColorScheme,
  Stack,
  Button,
  Loader,
  Center
} from '@mantine/core';
import {
  IconChartLine,
  IconSoup,
  IconBarbell,
  IconCalendar,
  IconUser,
  IconSettings,
  IconPlus,
  IconMessage,
  IconChefHat,
  IconClipboardList,
  IconCalendarEvent
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { WeeklyProgressChart } from '../components/molecules/WeeklyProgressChart';
import { CurrentSubscription } from '../components/molecules/CurrentSubscription';
import { ComingSoonBadge } from '../components/atoms/ComingSoonBadge';
import { ComingSoonModal } from '../components/atoms/ComingSoonModal';
import { estadisticasService } from '../services/estadisticasService';
import { EstadisticasSemanal } from '../types/estadisticas';

// Tipo extendido para manejar la diferencia entre frontend y backend
interface EstadisticasSemanalBackend extends EstadisticasSemanal {
  progreso: EstadisticasSemanal['progreso'] & {
    ejerciciosRegistrados?: number;
  };
}

interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
  badge?: string;
  badgeColor?: string;
  comingSoon?: boolean;
  disabled?: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  description,
  icon,
  color,
  onClick,
  badge,
  badgeColor = 'blue',
  comingSoon = false,
  disabled = false
}) => {
  const theme = useMantineTheme();

  const handleClick = () => {
    if (comingSoon || disabled) {
      return; // No hacer nada si está deshabilitado o es próximamente
    }
    onClick();
  };

  return (
    <Paper
      p="lg"
      radius="lg"
      withBorder
      style={{
        cursor: comingSoon || disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        borderLeft: `4px solid ${theme.colors[color][6]}`,
        opacity: comingSoon || disabled ? 0.6 : 1
      }}
      onClick={handleClick}
      onMouseEnter={(e) => {
        if (!comingSoon && !disabled) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = theme.shadows.md;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <div style={{ color: theme.colors[color][6] }}>
            {icon}
          </div>
          <Group gap="xs">
            {comingSoon && <ComingSoonBadge />}
            {badge && !comingSoon && (
              <Badge color={badgeColor} variant="light" size="sm">
                {badge}
              </Badge>
            )}
          </Group>
        </Group>
        <div>
          <Title order={4} mb="xs" c={theme.colors.gray[8]}>
            {title}
          </Title>
          <Text size="sm" c="dimmed" lineClamp={2}>
            {description}
          </Text>
        </div>
      </Stack>
    </Paper>
  );
};

const DashboardPage: React.FC = () => {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [comingSoonModal, setComingSoonModal] = useState<{
    opened: boolean;
    title: string;
    description: string;
  }>({
    opened: false,
    title: '',
    description: ''
  });

  // Estado para las estadísticas semanales
  const [weeklyStats, setWeeklyStats] = useState<EstadisticasSemanalBackend | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Función para mostrar modal de próximamente
  const showComingSoon = (title: string, description: string) => {
    setComingSoonModal({
      opened: true,
      title,
      description
    });
  };

  // Cargar estadísticas semanales
  const loadWeeklyStats = useCallback(async () => {
    if (user?.role !== 'user') return; // Solo para clientes

    try {
      setLoadingStats(true);
      const currentDate = new Date();
      const weekNumber = getWeekNumber(currentDate);
      const year = currentDate.getFullYear();

      const response = await estadisticasService.getMiProgresoSemanal(weekNumber, year);
      if (response.success) {
        setWeeklyStats(response.estadisticas as EstadisticasSemanalBackend);
      }
    } catch (error) {
      console.error('Error cargando estadísticas semanales:', error);
    } finally {
      setLoadingStats(false);
    }
  }, [user]);

  // Función para obtener el número de semana (ISO 8601)
  const getWeekNumber = (date: Date): number => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
  };

  useEffect(() => {
    loadWeeklyStats();
  }, [user, loadWeeklyStats]);

  // Datos de progreso - usar datos reales si están disponibles, sino datos por defecto
  const weeklyProgress = weeklyStats ? {
    nutrition: 0, // La nutrición aún no está implementada
    exercise: Math.round(weeklyStats.progreso.porcentajeCompletitud),
    goal: Math.round((weeklyStats.progreso.porcentajeCompletitud + weeklyStats.asistencia.porcentajeAsistencia) / 2) // Promedio entre ejercicio y asistencia
  } : {
    nutrition: 85,
    exercise: 72,
    goal: 78
  };

  // Configuración de tarjetas del dashboard según el rol del usuario
  const getDashboardItems = () => {
    const baseItems = [
      {
        title: 'Progreso Semanal',
        description: 'Visualiza tu progreso en nutrición y entrenamiento de esta semana',
        icon: <IconChartLine size={32} />,
        color: 'green',
        onClick: () => navigate('/progreso-semanal'),
        badge: 'Disponible'
      },
      {
        title: 'Calendario',
        description: 'Organiza tus sesiones y comidas programadas',
        icon: <IconCalendar size={32} />,
        color: 'cyan',
        onClick: () => showComingSoon('Calendario', 'Pronto podrás organizar todas tus sesiones de entrenamiento y comidas programadas en un calendario interactivo.'),
        comingSoon: true
      },
      {
        title: 'Mi Perfil',
        description: 'Actualiza tu información personal y preferencias',
        icon: <IconUser size={32} />,
        color: 'grape',
        onClick: () => navigate('/profile')
      },
      {
        title: 'Chat',
        description: 'Comunícate en tiempo real con tu entrenador o nutricionista',
        icon: <IconMessage size={32} />,
        color: 'teal',
        onClick: () => navigate('/chat'),
        badge: 'En Vivo'
      },
      {
        title: 'Mis Citas',
        description: user?.role === 'worker' 
          ? 'Gestiona las citas con tus clientes'
          : 'Programa y gestiona tus citas virtuales',
        icon: <IconCalendarEvent size={32} />,
        color: 'pink',
        onClick: () => navigate('/citas'),
        badge: user?.role === 'worker' ? 'Gestionar' : 'Programar'
      },
      {
        title: 'Solicitudes',
        description: user?.role === 'worker' 
          ? 'Gestiona las solicitudes de asignación que has recibido'
          : 'Revisa el estado de tus solicitudes de asignación',
        icon: <IconClipboardList size={32} />,
        color: 'pink',
        onClick: () => navigate('/solicitudes'),
        badge: user?.role === 'worker' ? 'Recibidas' : 'Enviadas'
      }
    ];

    // Agregar tarjetas específicas según el rol
    if (user?.role === 'user') {
      // Solo para clientes: dietas y entrenamientos
      baseItems.splice(1, 0, 
        {
          title: 'Mis Dietas',
          description: 'Ve las dietas que han creado para ti',
          icon: <IconSoup size={32} />,
          color: 'orange',
          onClick: () => navigate('/mis-dietas'),
          badge: 'Ver'
        },
        {
          title: 'Mis Entrenamientos',
          description: 'Accede a tus rutinas y planes de ejercicio',
          icon: <IconBarbell size={32} />,
          color: 'blue',
          onClick: () => navigate('/mis-entrenamientos'),
          badge: 'Ver'
        }
      );
    } else if (user?.role === 'worker') {
      // Solo para trabajadores: recetas
      baseItems.splice(1, 0, 
        {
          title: 'Recetas',
          description: 'Crea y gestiona recetas nutritivas para tus clientes',
          icon: <IconChefHat size={32} />,
          color: 'nutroos-green',
          onClick: () => navigate('/mis-recetas'),
          badge: 'Gestionar'
        }
      );
    } else {
      // Para otros roles (admin): mostrar recetas como próximamente
      baseItems.splice(1, 0, 
        {
          title: 'Recetas',
          description: 'Crea y gestiona recetas nutritivas',
          icon: <IconChefHat size={32} />,
          color: 'nutroos-green',
          onClick: () => showComingSoon('Recetas', 'Esta funcionalidad estará disponible próximamente para administradores.'),
          comingSoon: true
        }
      );
    }

    return baseItems;
  };

  const dashboardItems = getDashboardItems();

  // Agregar funcionalidades específicas para trabajadores
  if (user?.role === 'worker') {
    dashboardItems.push(
      {
        title: 'Gestionar Clientes',
        description: 'Administra tus clientes y sus progresos',
        icon: <IconSettings size={32} />,
        color: 'indigo',
        onClick: () => navigate('/worker/dashboard-clients')
      }
    );
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header del Dashboard */}
        <Paper 
          p="xl" 
          radius="lg" 
          withBorder 
          style={{
            background: colorScheme === 'dark' 
              ? `linear-gradient(135deg, ${theme.colors.dark[7]} 0%, ${theme.colors.dark[6]} 100%)`
              : `linear-gradient(135deg, ${theme.colors.gray[0]} 0%, ${theme.colors.gray[1]} 100%)`,
            borderColor: colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]
          }}
        >
          <Stack gap="md">
            <Title 
              order={1} 
              style={{
                color: colorScheme === 'dark' ? theme.colors.gray[0] : theme.colors.gray[8],
                textShadow: colorScheme === 'dark' ? '0 2px 4px rgba(0,0,0,0.3)' : '0 1px 2px rgba(0,0,0,0.1)'
              }}
            >
              ¡Bienvenido de vuelta, {user?.fullName}! 👋
            </Title>
            <Text 
              size="lg" 
              style={{
                color: colorScheme === 'dark' ? theme.colors.gray[2] : theme.colors.gray[6]
              }}
            >
              Tu centro de control para nutrición y entrenamiento personal
            </Text>
            <Group>
              <Badge 
                color="nutroos-green" 
                variant={colorScheme === 'dark' ? 'filled' : 'light'} 
                size="lg"
                style={{
                  backgroundColor: colorScheme === 'dark' 
                    ? theme.colors['nutroos-green'][6] 
                    : undefined,
                  color: colorScheme === 'dark' 
                    ? theme.white 
                    : undefined
                }}
              >
                {user?.role === 'admin' ? 'Administrador' : 
                 user?.role === 'worker' ? user.workerType || 'Trabajador' : 'Usuario'}
              </Badge>
              {user?.role === 'user' && (
                <Badge 
                  color="blue" 
                  variant={colorScheme === 'dark' ? 'filled' : 'light'} 
                  size="lg"
                  style={{
                    backgroundColor: colorScheme === 'dark' 
                      ? theme.colors.blue[6] 
                      : undefined,
                    color: colorScheme === 'dark' 
                      ? theme.white 
                      : undefined
                  }}
                >
                  Cliente Activo
                </Badge>
              )}
            </Group>
          </Stack>
        </Paper>

        {/* Gráfico de Progreso Semanal */}
        <Grid gutter="lg">
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Stack gap="lg">
              {loadingStats && user?.role === 'user' ? (
                <Paper p="lg" radius="lg" withBorder>
                  <Center py="xl">
                    <Stack align="center" gap="md">
                      <Loader size="lg" />
                      <Text c="dimmed">Cargando progreso semanal...</Text>
                    </Stack>
                  </Center>
                </Paper>
              ) : (
                <WeeklyProgressChart
                  nutritionProgress={weeklyProgress.nutrition}
                  exerciseProgress={weeklyProgress.exercise}
                  goalProgress={weeklyProgress.goal}
                />
              )}
              {user?.role === 'user' && (
                <CurrentSubscription />
              )}
            </Stack>
          </Grid.Col>
          
          {/* Grid de Funcionalidades */}
          <Grid.Col span={{ base: 12, lg: 8 }}>
            <Grid gutter="md">
              {dashboardItems.map((item, index) => (
                <Grid.Col key={index} span={{ base: 12, sm: 6 }}>
                  <DashboardCard {...item} />
                </Grid.Col>
              ))}
            </Grid>
          </Grid.Col>
        </Grid>

        {/* Acciones Rápidas */}
        <Paper p="xl" radius="lg" withBorder>
          <Stack gap="md">
            <Title order={3} c={theme.colors.gray[8]}>
              Acciones Rápidas
            </Title>
            <Group gap="md">
              {user?.role === 'worker' && (
                <Button
                  leftSection={<IconPlus size={16} />}
                  color="nutroos-green"
                  variant="filled"
                  onClick={() => navigate('/worker/dashboard-clients')}
                >
                  Seleccionar Cliente para Dieta
                </Button>
              )}
              <Button
                leftSection={<IconPlus size={16} />}
                color="blue"
                variant="light"
                onClick={() => navigate('/training/new')}
              >
                Nueva Sesión
              </Button>
              {user?.role === 'admin' && (
                <Group gap="md">
                  <Button
                    leftSection={<IconUser size={16} />}
                    color="nutroos-green"
                    variant="light"
                    onClick={() => navigate('/admin/users')}
                  >
                    Gestión de Usuarios
                  </Button>
                  <Button
                    leftSection={<IconUser size={16} />}
                    color="blue"
                    variant="light"
                    onClick={() => navigate('/admin/workers')}
                  >
                    Gestión de Trabajadores
                  </Button>
                  <Button
                    leftSection={<IconUser size={16} />}
                    color="purple"
                    variant="light"
                    onClick={() => navigate('/admin/registrar-trabajador')}
                  >
                    Registrar Trabajador
                  </Button>
                </Group>
              )}
            </Group>
          </Stack>
        </Paper>
      </Stack>

      {/* Modal de Próximamente */}
      <ComingSoonModal
        opened={comingSoonModal.opened}
        onClose={() => setComingSoonModal(prev => ({ ...prev, opened: false }))}
        title={comingSoonModal.title}
        description={comingSoonModal.description}
      />
    </Container>
  );
};

export default DashboardPage;
