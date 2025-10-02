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
  IconMessage,
  IconChefHat,
  IconClipboardList,
  IconCalendarEvent,
  IconAlertCircle
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSuscription } from '../hooks/useSuscription';
import { WeeklyProgressChart } from '../components/molecules/WeeklyProgressChart';
import { CurrentSubscription } from '../components/molecules/CurrentSubscription';
import { ComingSoonBadge } from '../components/atoms/ComingSoonBadge';
import { ComingSoonModal } from '../components/atoms/ComingSoonModal';
import { estadisticasService } from '../services/estadisticasService';
import { estadisticasNutricionalesService } from '../services/estadisticasNutricionalesService';
import { EstadisticasSemanal } from '../types/estadisticas';
import { EstadisticasNutricionalesSemanal } from '../types/estadisticasNutricionales';

// Tipo extendido para manejar la diferencia entre frontend y backend
interface EstadisticasSemanalBackend extends EstadisticasSemanal {
  progreso: EstadisticasSemanal['progreso'] & {
    ejerciciosRegistrados?: number;
  };
}

// Tipo extendido para estadísticas nutricionales semanales
interface EstadisticasNutricionalesSemanalBackend extends EstadisticasNutricionalesSemanal {
  progreso: EstadisticasNutricionalesSemanal['progreso'];
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

  // Validar que el color existe en el tema
  const getColorValue = (colorName: string) => {
    if (theme.colors[colorName] && theme.colors[colorName][6]) {
      return theme.colors[colorName][6];
    }
    // Fallback a un color por defecto si no existe
    return theme.colors.blue[6];
  };

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
        borderLeft: `4px solid ${getColorValue(color)}`,
        opacity: comingSoon || disabled ? 0.6 : 1,
        height: '100%',
        minHeight: '160px'
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
      <Stack gap="md" style={{ height: '100%' }}>
        <Group justify="space-between" align="flex-start">
          <div style={{ color: getColorValue(color) }}>
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
        <div style={{ flex: 1 }}>
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
  const { suscriptionStatus } = useSuscription();
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
  const [weeklyNutritionStats, setWeeklyNutritionStats] = useState<EstadisticasNutricionalesSemanalBackend | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Cargar estadísticas semanales
  const loadWeeklyStats = useCallback(async () => {
    if (user?.role !== 'user' && user?.role !== 'worker') return; // Solo para clientes y trabajadores

    try {
      setLoadingStats(true);
      const currentDate = new Date();
      const weekNumber = getWeekNumber(currentDate);
      const year = currentDate.getFullYear();

      // Cargar estadísticas de entrenamiento
      try {
        const response = await estadisticasService.getMiProgresoSemanal(weekNumber, year);
        if (response.success) {
          setWeeklyStats(response.estadisticas as EstadisticasSemanalBackend);
        }
      } catch (error) {
        console.warn('Error cargando estadísticas de entrenamiento:', error);
      }

      // Cargar estadísticas nutricionales
      try {
        const nutritionResponse = await estadisticasNutricionalesService.getMiProgresoNutricionalSemanal(weekNumber, year);
        if (nutritionResponse.success) {
          setWeeklyNutritionStats(nutritionResponse.estadisticas as EstadisticasNutricionalesSemanalBackend);
        }
      } catch (error) {
        console.warn('Error cargando estadísticas nutricionales:', error);
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

  // Determinar qué secciones mostrar según el rol y suscripción
  const getProgressSections = () => {
    if (user?.role === 'worker') {
      // Para trabajadores, mostrar según su tipo
      if (user.workerType === 'Nutricionista') {
        return { showNutrition: true, showExercise: false, showGeneral: false };
      } else if (user.workerType === 'Entrenador personal') {
        return { showNutrition: false, showExercise: true, showGeneral: false };
      } else if (user.workerType === 'Nutricionista y Entrenador personal') {
        return { showNutrition: true, showExercise: true, showGeneral: true };
      }
      return { showNutrition: false, showExercise: false, showGeneral: false };
    } else if (user?.role === 'user') {
      // Para usuarios, mostrar según su suscripción
      if (!suscriptionStatus) {
        return { showNutrition: false, showExercise: false, showGeneral: false };
      }
      
      if (suscriptionStatus.canAccessNutrition && suscriptionStatus.canAccessTraining) {
        return { showNutrition: true, showExercise: true, showGeneral: true };
      } else if (suscriptionStatus.canAccessNutrition) {
        return { showNutrition: true, showExercise: false, showGeneral: false };
      } else if (suscriptionStatus.canAccessTraining) {
        return { showNutrition: false, showExercise: true, showGeneral: false };
      }
      return { showNutrition: false, showExercise: false, showGeneral: false };
    }
    
    return { showNutrition: false, showExercise: false, showGeneral: false };
  };

  const progressSections = getProgressSections();

  // Datos de progreso - usar datos reales si están disponibles, sino datos por defecto
  const weeklyProgress = {
    nutrition: weeklyNutritionStats ? Math.round(weeklyNutritionStats.progreso?.porcentajeCompletitud || 0) : 0,
    exercise: weeklyStats ? Math.round(weeklyStats.progreso.porcentajeCompletitud) : 0,
    goal: weeklyStats && weeklyNutritionStats 
      ? Math.round((weeklyStats.progreso.porcentajeCompletitud + (weeklyNutritionStats.progreso?.porcentajeCompletitud || 0)) / 2)
      : weeklyStats 
      ? Math.round((weeklyStats.progreso.porcentajeCompletitud + weeklyStats.asistencia.porcentajeAsistencia) / 2)
      : 0
  };

  // Configuración de tarjetas del dashboard según el rol del usuario
  const getDashboardItems = (): DashboardCardProps[] => {
    // Dashboard específico para administradores
    if (user?.role === 'admin') {
      return [
        {
          title: 'Gestión de Usuarios',
          description: 'Administra y gestiona todos los usuarios del sistema',
          icon: <IconUser size={32} />,
          color: 'blue',
          onClick: () => navigate('/admin/users'),
          badge: 'Administrar'
        },
        {
          title: 'Gestión de Trabajadores',
          description: 'Gestiona trabajadores, nutricionistas y entrenadores',
          icon: <IconUser size={32} />,
          color: 'green',
          onClick: () => navigate('/admin/workers'),
          badge: 'Administrar'
        },
        {
          title: 'Crear Trabajador',
          description: 'Registra nuevos trabajadores en el sistema',
          icon: <IconUser size={32} />,
          color: 'grape',
          onClick: () => navigate('/admin/registrar-trabajador'),
          badge: 'Registrar'
        },
        {
          title: 'Gestión de Incidencias',
          description: 'Administra y resuelve las incidencias reportadas por usuarios',
          icon: <IconAlertCircle size={32} />,
          color: 'orange',
          onClick: () => navigate('/admin/incidencias'),
          badge: 'Administrar'
        }
      ];
    }

    // Dashboard para usuarios y trabajadores
    const baseItems: DashboardCardProps[] = [
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
        onClick: () => navigate('/calendar'),
        badge: 'Disponible'
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

        {/* Layout específico para administradores */}
        {user?.role === 'admin' ? (
          <Grid gutter="lg">
            {dashboardItems.map((item, index) => (
              <Grid.Col key={index} span={{ base: 12, sm: 6, lg: 3 }}>
                <DashboardCard {...item} />
              </Grid.Col>
            ))}
          </Grid>
        ) : (
          /* Layout para usuarios y trabajadores */
          <Grid gutter="lg">
            <Grid.Col span={{ base: 12, lg: 4 }}>
              <Stack gap="lg">
                {loadingStats && (user?.role === 'user' || user?.role === 'worker') ? (
                  <Paper p="lg" radius="lg" withBorder>
                    <Center py="xl">
                      <Stack align="center" gap="md">
                        <Loader size="lg" />
                        <Text c="dimmed">Cargando progreso semanal...</Text>
                      </Stack>
                    </Center>
                  </Paper>
                ) : (progressSections.showNutrition || progressSections.showExercise || progressSections.showGeneral) ? (
                  <WeeklyProgressChart
                    nutritionProgress={weeklyProgress.nutrition}
                    exerciseProgress={weeklyProgress.exercise}
                    goalProgress={weeklyProgress.goal}
                    showNutrition={progressSections.showNutrition}
                    showExercise={progressSections.showExercise}
                    showGeneral={progressSections.showGeneral}
                    userRole={user?.role as 'user' | 'worker' | 'admin'}
                  />
                ) : (
                  <Paper p="lg" radius="lg" withBorder>
                    <Center py="xl">
                      <Stack align="center" gap="md">
                        <Text c="dimmed" ta="center">
                          {user?.role === 'user' 
                            ? 'Suscríbete para ver tu progreso semanal'
                            : 'No tienes acceso al progreso semanal'
                          }
                        </Text>
                      </Stack>
                    </Center>
                  </Paper>
                )}
                {user?.role === 'user' && (
                  <CurrentSubscription />
                )}
                
                {/* Tarjeta Mis Incidencias - Solo para user y worker */}
                {(user?.role === 'user' || user?.role === 'worker') && (
                  <Paper p="lg" radius="lg" withBorder>
                    <Stack gap="md">
                      <Group justify="space-between" align="flex-start">
                        <div style={{ color: theme.colors.orange[6] }}>
                          <IconAlertCircle size={32} />
                        </div>
                        <Badge color="orange" variant="light" size="sm">
                          Soporte
                        </Badge>
                      </Group>
                      <div>
                        <Title order={4} mb="xs" c={theme.colors.gray[8]}>
                          Mis Incidencias
                        </Title>
                        <Text size="sm" c="dimmed" lineClamp={2}>
                          Revisa el estado de tus incidencias reportadas
                        </Text>
                      </div>
                      <Button
                        variant="light"
                        color="orange"
                        size="sm"
                        onClick={() => navigate('/mis-incidencias')}
                        fullWidth
                      >
                        Mis Incidencias
                      </Button>
                    </Stack>
                  </Paper>
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
        )}

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
