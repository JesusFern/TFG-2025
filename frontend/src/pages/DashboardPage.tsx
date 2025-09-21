import React from 'react';
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
  Button
} from '@mantine/core';
import {
  IconChartLine,
  IconSoup,
  IconBarbell,
  IconTarget,
  IconCalendar,
  IconUser,
  IconSettings,
  IconPlus,
  IconMessage,
  IconChefHat,
  IconClipboardList
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { WeeklyProgressChart } from '../components/molecules/WeeklyProgressChart';
import { CurrentSubscription } from '../components/molecules/CurrentSubscription';
import { limpiarImagenesHuerfanas } from '../services/recetaService';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';

interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
  badge?: string;
  badgeColor?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  description,
  icon,
  color,
  onClick,
  badge,
  badgeColor = 'blue'
}) => {
  const theme = useMantineTheme();

  return (
    <Paper
      p="lg"
      radius="lg"
      withBorder
      style={{
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        borderLeft: `4px solid ${theme.colors[color][6]}`
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = theme.shadows.md;
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
          {badge && (
            <Badge color={badgeColor} variant="light" size="sm">
              {badge}
            </Badge>
          )}
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
  const [limpiandoImagenes, setLimpiandoImagenes] = useState(false);

  const handleLimpiarImagenesHuerfanas = async () => {
    try {
      setLimpiandoImagenes(true);
      const resultado = await limpiarImagenesHuerfanas();
      
      notifications.show({
        title: 'Limpieza completada',
        message: resultado.message,
        color: 'green',
        autoClose: 5000,
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Error al limpiar imágenes huérfanas',
        color: 'red',
        autoClose: 5000,
      });
    } finally {
      setLimpiandoImagenes(false);
    }
  };

  // Datos de progreso simulados (en producción vendrían del backend)
  const weeklyProgress = {
    nutrition: 85,
    exercise: 72,
    goal: 78
  };

  const dashboardItems = [
    {
      title: 'Progreso Semanal',
      description: 'Visualiza tu progreso en nutrición y entrenamiento de esta semana',
      icon: <IconChartLine size={32} />,
      color: 'green',
      onClick: () => navigate('/progress'),
      badge: 'Nuevo'
    },
    {
      title: 'Mis Dietas',
      description: user?.role === 'worker' 
        ? 'Gestiona tus planes de alimentación personalizados'
        : 'Ve las dietas que han creado para ti',
      icon: <IconSoup size={32} />,
      color: 'orange',
      onClick: () => navigate(user?.role === 'worker' ? '/diets' : '/mis-dietas'),
      badge: user?.role === 'worker' ? 'Crear' : 'Ver'
    },
    {
      title: 'Recetas',
      description: 'Crea y gestiona recetas nutritivas para tus clientes',
      icon: <IconChefHat size={32} />,
      color: 'nutroos-green',
      onClick: () => navigate('/mis-recetas'),
      badge: user?.role === 'worker' ? 'Gestionar' : 'Ver'
    },
    {
      title: 'Entrenamientos',
      description: 'Accede a tus rutinas y planes de ejercicio',
      icon: <IconBarbell size={32} />,
      color: 'blue',
      onClick: () => navigate(user?.role === 'worker' ? '/training' : '/mis-entrenamientos'),
      badge: user?.role === 'worker' ? 'Crear' : 'Ver'
    },
    {
      title: 'Objetivos',
      description: 'Establece y monitorea tus metas de fitness',
      icon: <IconTarget size={32} />,
      color: 'violet',
      onClick: () => navigate('/goals')
    },
    {
      title: 'Calendario',
      description: 'Organiza tus sesiones y comidas programadas',
      icon: <IconCalendar size={32} />,
      color: 'cyan',
      onClick: () => navigate('/calendar')
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
              <WeeklyProgressChart
                nutritionProgress={weeklyProgress.nutrition}
                exerciseProgress={weeklyProgress.exercise}
                goalProgress={weeklyProgress.goal}
              />
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
              <Button
                leftSection={<IconTarget size={16} />}
                color="violet"
                variant="light"
                onClick={() => navigate('/goals/new')}
              >
                Establecer Objetivo
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
                  <Button
                    leftSection={<IconChefHat size={16} />}
                    color="orange"
                    variant="light"
                    onClick={handleLimpiarImagenesHuerfanas}
                    loading={limpiandoImagenes}
                  >
                    Limpiar Imágenes Huérfanas
                  </Button>
                </Group>
              )}
            </Group>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
};

export default DashboardPage;
