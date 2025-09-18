import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Title, 
  Loader, 
  Alert, 
  Card, 
  Group, 
  Badge, 
  Stack, 
  Text, 
  useMantineTheme,
  Paper,
  Button,
  Center,
  SimpleGrid
} from '@mantine/core';
import { 
  IconAlertCircle, 
  IconCheck, 
  IconClock, 
  IconCalendar, 
  IconTarget, 
  IconBarbell,
  IconArrowRight
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useThemeDetection } from '../hooks/useThemeDetection';
import { formatDate } from '../utils/trainingUtils';
import { PlanEntrenamiento } from '../types/training';
import { trainingService } from '../services/trainingService';

const ClientTrainingPlansPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isDark = useThemeDetection();
  const theme = useMantineTheme();
  
  const [planes, setPlanes] = useState<PlanEntrenamiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarPlanes = async () => {
      if (!user?._id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        
        // Obtener planes asignados al cliente (solo publicados, no borradores)
        const response = await trainingService.obtenerPlanes({
          cliente: user._id,
          activo: true
        });
        
        setPlanes(response);
      } catch (err) {
        console.error('Error al cargar los planes de entrenamiento:', err);
        setError('Error al cargar los planes de entrenamiento');
      } finally {
        setLoading(false);
      }
    };

    cargarPlanes();
  }, [user?._id]);

  const handleVerPlan = (planId: string) => {
    navigate(`/mis-entrenamientos/${planId}`);
  };

  if (loading) {
    return (
      <Container py="xl">
        <Center>
          <Loader color="nutroos-green" size="lg" />
        </Center>
      </Container>
    );
  }

  if (error) {
    return (
      <Container py="xl">
        <Alert icon={<IconAlertCircle size={16} />} color="red">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      {/* Header */}
      <Paper 
        p="lg" 
        shadow="xs" 
        radius="md" 
        mb="xl" 
        withBorder
        bg={isDark ? "dark.6" : "gray.0"}
        c={isDark ? "gray.0" : "dark.9"}
        style={{ 
          borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3],
          background: `linear-gradient(135deg, ${isDark ? theme.colors.dark[6] : theme.colors.gray[0]} 0%, ${isDark ? theme.colors.dark[7] : theme.colors.gray[1]} 100%)`
        }}
      >
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={2} mb="xs" c="nutroos-green.6">
              Mis Planes de Entrenamiento
            </Title>
            <Text c="dimmed" size="lg">
              Planes personalizados creados por tu entrenador
            </Text>
          </div>
          <Badge
            size="xl"
            color="nutroos-green"
            variant="light"
            leftSection={<IconBarbell size={20} />}
            style={{ fontWeight: 600 }}
          >
            {planes.length} Plan{planes.length !== 1 ? 'es' : ''}
          </Badge>
        </Group>
      </Paper>
      
      {planes.length === 0 ? (
        <Paper
          p="xl"
          radius="md"
          withBorder
          bg={isDark ? "dark.7" : "white"}
          style={{
            borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3],
            textAlign: 'center'
          }}
        >
          <Stack align="center" gap="md">
            <IconBarbell 
              size={64} 
              color={isDark ? theme.colors.gray[5] : theme.colors.gray[4]}
              stroke={1}
            />
            <Title order={3} c={isDark ? "gray.3" : "gray.6"}>
              No tienes planes de entrenamiento asignados
            </Title>
            <Text c="dimmed" size="lg" maw={400}>
              Tu entrenador aún no ha creado ningún plan personalizado para ti. 
              Contacta con él para comenzar tu rutina de ejercicios.
            </Text>
            <Button
              variant="light"
              color="nutroos-green"
              leftSection={<IconTarget size={16} />}
              onClick={() => navigate('/chat')}
              mt="md"
            >
              Contactar Entrenador
            </Button>
          </Stack>
        </Paper>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
          {planes.map((plan) => (
            <Card
              key={plan._id}
              withBorder
              shadow="md"
              p="lg"
              radius="md"
              bg={isDark ? theme.colors.dark[7] : 'white'}
              c={isDark ? theme.colors.gray[0] : theme.colors.gray[9]}
              style={{
                borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3],
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                borderLeftWidth: 4,
                borderLeftStyle: 'solid',
                borderLeftColor: plan.draftMode === false ? 
                  (isDark ? theme.colors["nutroos-green"][5] : theme.colors["nutroos-green"][6]) : 
                  (isDark ? theme.colors.dark[3] : theme.colors.gray[4]),
                overflow: 'hidden',
                boxShadow: isDark ? '0 4px 8px rgba(0, 0, 0, 0.4)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
              }}
              onClick={() => handleVerPlan(plan._id!)}
              onMouseOver={e => {
                e.currentTarget.style.boxShadow = isDark ? '0 8px 16px rgba(0, 0, 0, 0.6)' : theme.shadows.xl;
                e.currentTarget.style.transform = 'translateY(-2px)';
                if (plan.draftMode === false) {
                  e.currentTarget.style.borderLeftColor = isDark 
                    ? theme.colors["nutroos-green"][4]
                    : theme.colors["nutroos-green"][5];
                }
              }}
              onMouseOut={e => {
                e.currentTarget.style.boxShadow = isDark ? '0 4px 8px rgba(0, 0, 0, 0.4)' : theme.shadows.md;
                e.currentTarget.style.transform = 'translateY(0)';
                if (plan.draftMode === false) {
                  e.currentTarget.style.borderLeftColor = isDark 
                    ? theme.colors["nutroos-green"][5]
                    : theme.colors["nutroos-green"][6];
                }
              }}
            >
              <Stack gap="md">
                {/* Header con estado */}
                <Group justify="space-between" align="flex-start">
                  <Badge
                    size="sm"
                    color={plan.draftMode === false ? 'nutroos-green' : (isDark ? 'gray.6' : 'gray')}
                    variant={plan.draftMode === false ? 'filled' : (isDark ? 'light' : 'outline')}
                    leftSection={
                      plan.draftMode === false 
                        ? <IconCheck size={14} stroke={1.5} /> 
                        : <IconClock size={14} stroke={1.5} />
                    }
                    fw={600}
                    tt="uppercase"
                  >
                    {plan.draftMode === false ? 'Activo' : 'Borrador'}
                  </Badge>
                </Group>

                {/* Título y descripción */}
                <div>
                  <Title order={4} mb="xs" fw={600} c={isDark ? "gray.0" : "gray.9"}>
                    {plan.nombre}
                  </Title>
                  {plan.descripcion && (
                    <Text 
                      size="sm" 
                      c={isDark ? "gray.2" : "gray.7"} 
                      lineClamp={2}
                      fw={400}
                    >
                      {plan.descripcion}
                    </Text>
                  )}
                </div>

                {/* Objetivo */}
                <Group gap="xs">
                  <IconTarget 
                    size={16}
                    stroke={1.5}
                    color={isDark ? theme.colors.blue[3] : theme.colors.blue[6]}
                  />
                  <Badge 
                    color={isDark ? "blue.5" : "blue.6"}
                    variant="light"
                    size="sm"
                    radius="sm"
                    fw={500}
                  >
                    {plan.objetivo}
                  </Badge>
                </Group>

                {/* Detalles del plan */}
                <Stack gap="xs">
                  <Group gap="xs">
                    <IconCalendar 
                      size={14} 
                      stroke={1.5}
                      color={isDark ? theme.colors.blue[3] : theme.colors.blue[6]} 
                    />
                    <Text size="xs" c={isDark ? "gray.2" : "gray.7"} fw={500}>
                      Inicio: {formatDate(plan.fechaInicio)}
                    </Text>
                  </Group>
                  
                  <Group gap="xs">
                    <IconClock 
                      size={14} 
                      stroke={1.5}
                      color={isDark ? theme.colors.cyan[3] : theme.colors.cyan[6]} 
                    />
                    <Text size="xs" c={isDark ? "gray.2" : "gray.7"} fw={500}>
                      Duración: {plan.duracionDias} días
                    </Text>
                  </Group>
                  
                  <Group gap="xs">
                    <IconBarbell 
                      size={14} 
                      stroke={1.5}
                      color={isDark ? theme.colors.teal[3] : theme.colors.teal[6]} 
                    />
                    <Text size="xs" c={isDark ? "gray.2" : "gray.7"} fw={500}>
                      {plan.sesionesPorSemana} sesiones/semana
                    </Text>
                  </Group>
                </Stack>

                {/* Botón de acción */}
                <Group justify="space-between" align="center" mt="sm">
                  <Text 
                    size="xs" 
                    c={isDark ? "gray.2" : "gray.6"} 
                    fw={500}
                    style={{ opacity: 0.9 }}
                  >
                    Haz clic para ver detalles
                  </Text>
                  <IconArrowRight 
                    size={16} 
                    color={isDark ? theme.colors["nutroos-green"][3] : theme.colors["nutroos-green"][6]}
                    stroke={1.5}
                  />
                </Group>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Container>
  );
};

export default ClientTrainingPlansPage;
