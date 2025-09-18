import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  useMantineColorScheme,
  Box,
  Pagination,
  Group,
  Container,
  Title,
  Text,
  Paper,
  Badge,
  Stack,
  Button,
  Alert,
  Loader,
  Center,
  Card,
  SimpleGrid,
  useMantineTheme
} from '@mantine/core';
import { 
  IconArrowLeft, 
  IconCalendar, 
  IconClock, 
  IconTarget, 
  IconBarbell,
  IconAlertCircle,
  IconCheck,
  IconPlayerPlay
} from '@tabler/icons-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTrainingData } from '../hooks/useTrainingData';
import { useSesionesRange } from '../hooks/useSesionesRange';

const ClientTrainingPlanDetailPage: React.FC = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = useMantineTheme();
  
  const [currentWeek, setCurrentWeek] = useState(1);
  
  const {
    plan,
    sesiones,
    loading,
    error,
    fechaInicio,
    getEjercicioById
  } = useTrainingData({ planId });

  const sesionesRange = useSesionesRange({ plan, sesiones, currentWeek, fechaInicio });

  const handleWeekChange = (newWeek: number) => {
    setCurrentWeek(newWeek);
  };

  const handleVerSesion = (sesionId: string) => {
    navigate(`/mis-entrenamientos/${planId}/sesion/${sesionId}`);
  };

  const fechaInicioFormateada = useMemo(() => {
    if (!plan?.fechaInicio) return "";
    return format(new Date(plan.fechaInicio), "d 'de' MMMM 'de' yyyy", { locale: es });
  }, [plan?.fechaInicio]);


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

  if (!plan) {
    return (
      <Container py="xl">
        <Alert icon={<IconAlertCircle size={16} />} color="red">
          No se encontró el plan solicitado o no tienes permisos para verlo.
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      {/* Header con navegación */}
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
        <Group justify="space-between" align="flex-start" mb="md">
          <Button
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate('/mis-entrenamientos')}
            color="gray"
            size="sm"
          >
            Volver a mis entrenamientos
          </Button>
          
          <Badge
            size="lg"
            color="nutroos-green"
            variant="light"
            leftSection={<IconCheck size={16} />}
            fw={600}
          >
            Plan Activo
          </Badge>
        </Group>

        <Title order={2} mb="xs" c="nutroos-green.6">
          {plan.nombre}
        </Title>
        
        {plan.descripcion && (
          <Text c="dimmed" size="lg" mb="md">
            {plan.descripcion}
          </Text>
        )}

        {/* Información del plan */}
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
          <Card
            p="md"
            radius="md"
            bg={isDark ? "dark.7" : "white"}
            withBorder
            style={{ borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3] }}
          >
            <Group gap="xs" mb="xs">
              <IconTarget size={20} color={theme.colors.blue[6]} />
              <Text fw={600} size="sm">Objetivo</Text>
            </Group>
            <Text size="sm" c="dimmed">{plan.objetivo}</Text>
          </Card>

          <Card
            p="md"
            radius="md"
            bg={isDark ? "dark.7" : "white"}
            withBorder
            style={{ borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3] }}
          >
            <Group gap="xs" mb="xs">
              <IconCalendar size={20} color={theme.colors.cyan[6]} />
              <Text fw={600} size="sm">Fecha de Inicio</Text>
            </Group>
            <Text size="sm" c="dimmed">{fechaInicioFormateada}</Text>
          </Card>

          <Card
            p="md"
            radius="md"
            bg={isDark ? "dark.7" : "white"}
            withBorder
            style={{ borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3] }}
          >
            <Group gap="xs" mb="xs">
              <IconClock size={20} color={theme.colors.teal[6]} />
              <Text fw={600} size="sm">Duración</Text>
            </Group>
            <Text size="sm" c="dimmed">{plan.duracionDias} días</Text>
          </Card>

          <Card
            p="md"
            radius="md"
            bg={isDark ? "dark.7" : "white"}
            withBorder
            style={{ borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3] }}
          >
            <Group gap="xs" mb="xs">
              <IconBarbell size={20} color={theme.colors.grape[6]} />
              <Text fw={600} size="sm">Sesiones/Semana</Text>
            </Group>
            <Text size="sm" c="dimmed">{plan.sesionesPorSemana}</Text>
          </Card>
        </SimpleGrid>
      </Paper>

      {/* Selector de semana */}
      <Paper 
        p="md" 
        shadow="xs" 
        radius="md" 
        mb="xl" 
        withBorder
        bg={isDark ? "dark.7" : "white"}
        style={{ borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3] }}
      >
        <Group justify="space-between" align="center">
          <div>
            <Title order={4} mb="xs">Semana {currentWeek}</Title>
            <Text size="sm" c="dimmed">
              {sesionesRange.sesiones.length} sesiones programadas
            </Text>
          </div>
          
          <Pagination
            value={currentWeek}
            onChange={handleWeekChange}
            total={sesionesRange.totalWeeks}
            color="nutroos-green"
            withEdges
            size="sm"
            radius="md"
          />
        </Group>
      </Paper>

      {/* Lista de sesiones */}
      {sesionesRange.sesiones.length === 0 ? (
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
              size={48} 
              color={isDark ? theme.colors.gray[5] : theme.colors.gray[4]}
              stroke={1}
            />
            <Title order={4} c={isDark ? "gray.3" : "gray.6"}>
              No hay sesiones programadas para esta semana
            </Title>
            <Text c="dimmed" size="sm">
              Tu entrenador aún no ha programado sesiones para esta semana.
            </Text>
          </Stack>
        </Paper>
      ) : (
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
          {sesionesRange.sesiones.map((sesionInfo, index) => {
            const sesion = sesionInfo.data;
            if (!sesion) return null;

            return (
              <Card
                key={`${sesionInfo.weekDayIndex}-${index}`}
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
                  borderLeftColor: isDark ? theme.colors["nutroos-green"][5] : theme.colors["nutroos-green"][6],
                }}
                onClick={() => handleVerSesion(sesion._id!)}
                onMouseOver={e => {
                  e.currentTarget.style.boxShadow = isDark ? '0 8px 16px rgba(0, 0, 0, 0.6)' : theme.shadows.xl;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.boxShadow = isDark ? '0 4px 8px rgba(0, 0, 0, 0.4)' : theme.shadows.md;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <Stack gap="md">
                  {/* Header de la sesión */}
                  <Group justify="space-between" align="flex-start">
                    <div>
                      <Title order={5} mb="xs" c="nutroos-green.6">
                        {sesion.tipoEntrenamiento}
                      </Title>
                      <Text size="sm" c="dimmed" fw={500}>
                        {sesionInfo.fechaFormateada}
                      </Text>
                    </div>
                    <Badge
                      color="nutroos-green"
                      variant="light"
                      leftSection={<IconPlayerPlay size={14} />}
                      fw={600}
                    >
                      Ver Sesión
                    </Badge>
                  </Group>

                  {/* Detalles de la sesión */}
                  <Stack gap="xs">
                    <Group gap="xs">
                      <IconClock size={16} color={theme.colors.cyan[6]} />
                      <Text size="sm" fw={500}>
                        Duración: {sesion.duracion} minutos
                      </Text>
                    </Group>
                    
                    <Group gap="xs">
                      <IconBarbell size={16} color={theme.colors.teal[6]} />
                      <Text size="sm" fw={500}>
                        {sesion.ejercicios.length} ejercicio{sesion.ejercicios.length !== 1 ? 's' : ''}
                      </Text>
                    </Group>

                    {sesion.hora && (
                      <Group gap="xs">
                        <IconCalendar size={16} color={theme.colors.blue[6]} />
                        <Text size="sm" fw={500}>
                          Hora: {sesion.hora}
                        </Text>
                      </Group>
                    )}
                  </Stack>

                  {/* Lista de ejercicios */}
                  {sesion.ejercicios.length > 0 && (
                    <Box>
                      <Text size="xs" fw={600} c="dimmed" mb="xs">
                        Ejercicios incluidos:
                      </Text>
                      <Stack gap="xs">
                        {sesion.ejercicios.slice(0, 3).map((ejercicio, idx) => {
                          const ejercicioData = getEjercicioById(ejercicio.ejercicio);
                          return (
                            <Group key={idx} gap="xs">
                              <Text size="xs" c="dimmed">
                                {idx + 1}.
                              </Text>
                              <Text size="xs" fw={500} lineClamp={1}>
                                {ejercicioData?.nombre || 'Ejercicio no encontrado'}
                              </Text>
                              <Text size="xs" c="dimmed">
                                ({ejercicio.series}x{ejercicio.repeticiones})
                              </Text>
                            </Group>
                          );
                        })}
                        {sesion.ejercicios.length > 3 && (
                          <Text size="xs" c="dimmed" fw={500}>
                            +{sesion.ejercicios.length - 3} más...
                          </Text>
                        )}
                      </Stack>
                    </Box>
                  )}

                  {/* Notas si las hay */}
                  {sesion.notas && (
                    <Box>
                      <Text size="xs" fw={600} c="dimmed" mb="xs">
                        Notas:
                      </Text>
                      <Text size="xs" c="dimmed" lineClamp={2}>
                        {sesion.notas}
                      </Text>
                    </Box>
                  )}
                </Stack>
              </Card>
            );
          })}
        </SimpleGrid>
      )}
    </Container>
  );
};

export default ClientTrainingPlanDetailPage;
