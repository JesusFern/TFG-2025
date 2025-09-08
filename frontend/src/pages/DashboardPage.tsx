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
  IconMessage
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { WeeklyProgressChart } from '../components/molecules/WeeklyProgressChart';

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
  const navigate = useNavigate();
  const { user } = useAuth();

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
      description: 'Gestiona tus planes de alimentación personalizados',
      icon: <IconSoup size={32} />,
      color: 'orange',
      onClick: () => navigate('/diets'),
      badge: user?.role === 'worker' ? 'Crear' : 'Ver'
    },
    {
      title: 'Entrenamientos',
      description: 'Accede a tus rutinas y planes de ejercicio',
      icon: <IconBarbell size={32} />,
      color: 'blue',
      onClick: () => navigate('/training'),
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
        onClick: () => navigate('/clients')
      }
    );
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header del Dashboard */}
        <Paper p="xl" radius="lg" withBorder bg={theme.colors.gray[0]}>
          <Stack gap="md">
            <Title order={1} c={theme.colors.gray[8]}>
              ¡Bienvenido de vuelta, {user?.fullName}! 👋
            </Title>
            <Text size="lg" c="dimmed">
              Tu centro de control para nutrición y entrenamiento personal
            </Text>
            <Group>
              <Badge color="nutroos-green" variant="light" size="lg">
                {user?.role === 'admin' ? 'Administrador' : 
                 user?.role === 'worker' ? user.workerType || 'Trabajador' : 'Usuario'}
              </Badge>
              {user?.role === 'user' && (
                <Badge color="blue" variant="light" size="lg">
                  Cliente Activo
                </Badge>
              )}
            </Group>
          </Stack>
        </Paper>

        {/* Gráfico de Progreso Semanal */}
        <Grid gutter="lg">
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <WeeklyProgressChart
              nutritionProgress={weeklyProgress.nutrition}
              exerciseProgress={weeklyProgress.exercise}
              goalProgress={weeklyProgress.goal}
            />
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
                  onClick={() => navigate('/clients')}
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
            </Group>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
};

export default DashboardPage;
