import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  SimpleGrid,
  Box,
  Timeline,
  ActionIcon
} from '@mantine/core';
import { 
  IconArrowLeft, 
  IconClock, 
  IconTarget, 
  IconBarbell,
  IconAlertCircle,
  IconEye,
  IconWeight,
  IconRepeat,
  IconPlayerPlay
} from '@tabler/icons-react';
import { useThemeDetection } from '../hooks/useThemeDetection';
import { formatDate } from '../utils/trainingUtils';
import { SesionPlan, Ejercicio } from '../types/training';
import { trainingService } from '../services/trainingService';
import ModalDetallesEjercicio from '../components/molecules/ModalDetallesEjercicio';

const ClientTrainingSessionPage: React.FC = () => {
  const { planId, sesionId } = useParams();
  const navigate = useNavigate();
  const isDark = useThemeDetection();
  const theme = useMantineTheme();
  
  const [sesion, setSesion] = useState<SesionPlan | null>(null);
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEjercicio, setSelectedEjercicio] = useState<Ejercicio | null>(null);
  const [modalOpened, setModalOpened] = useState(false);

  useEffect(() => {
    const cargarSesion = async () => {
      if (!sesionId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Cargar datos de la sesión
        const sesionData = await trainingService.obtenerSesionPorId(sesionId);
        setSesion(sesionData);
        
        // Cargar ejercicios de la sesión
        if (sesionData.ejercicios && Array.isArray(sesionData.ejercicios) && sesionData.ejercicios.length > 0) {
          // Los ejercicios ya están poblados desde el backend, extraer solo la información del ejercicio
          const ejerciciosData = sesionData.ejercicios.map(e => e.ejercicio as unknown as Ejercicio);
          setEjercicios(ejerciciosData);
        } else {
          console.warn('La sesión no tiene ejercicios o la estructura es incorrecta:', {
            hasEjercicios: !!sesionData.ejercicios,
            isArray: Array.isArray(sesionData.ejercicios),
            length: sesionData.ejercicios?.length,
            ejercicios: sesionData.ejercicios
          });
          setEjercicios([]);
        }
        
      } catch (err) {
        console.error('Error al cargar sesión:', err);
        setError('Error al cargar los datos de la sesión');
      } finally {
        setLoading(false);
      }
    };

    cargarSesion();
  }, [sesionId]);

  const handleVerEjercicio = (ejercicio: Ejercicio) => {
    setSelectedEjercicio(ejercicio);
    setModalOpened(true);
  };

  const getEjercicioById = (ejercicioId: string): Ejercicio | null => {
    return ejercicios.find(e => e._id === ejercicioId) || null;
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
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

  if (!sesion) {
    return (
      <Container py="xl">
        <Alert icon={<IconAlertCircle size={16} />} color="red">
          No se encontró la sesión solicitada.
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
            onClick={() => navigate(`/mis-entrenamientos/${planId}`)}
            color="gray"
            size="sm"
          >
            Volver al plan
          </Button>
          
          <Badge
            size="lg"
            color="nutroos-green"
            variant="light"
            leftSection={<IconPlayerPlay size={16} />}
            fw={600}
          >
            Sesión de Entrenamiento
          </Badge>
        </Group>

        <Title order={2} mb="xs" c="nutroos-green.6">
          {sesion.tipoEntrenamiento}
        </Title>
        
        <Text c="dimmed" size="lg" mb="md">
          {formatDate(sesion.fecha)} {sesion.hora && `• ${sesion.hora}`}
        </Text>

        {/* Información de la sesión */}
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
          <Card
            p="md"
            radius="md"
            bg={isDark ? "dark.7" : "white"}
            withBorder
            style={{ borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3] }}
          >
            <Group gap="xs" mb="xs">
              <IconClock size={20} color={theme.colors.cyan[6]} />
              <Text fw={600} size="sm">Duración</Text>
            </Group>
            <Text size="sm" c="dimmed">{formatTime(sesion.duracion)}</Text>
          </Card>

          <Card
            p="md"
            radius="md"
            bg={isDark ? "dark.7" : "white"}
            withBorder
            style={{ borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3] }}
          >
            <Group gap="xs" mb="xs">
              <IconBarbell size={20} color={theme.colors.teal[6]} />
              <Text fw={600} size="sm">Ejercicios</Text>
            </Group>
            <Text size="sm" c="dimmed">{sesion.ejercicios?.length || 0}</Text>
          </Card>

          <Card
            p="md"
            radius="md"
            bg={isDark ? "dark.7" : "white"}
            withBorder
            style={{ borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3] }}
          >
            <Group gap="xs" mb="xs">
              <IconRepeat size={20} color={theme.colors.blue[6]} />
              <Text fw={600} size="sm">Series Totales</Text>
            </Group>
            <Text size="sm" c="dimmed">
              {sesion.ejercicios?.reduce((total, e) => total + e.series, 0) || 0}
            </Text>
          </Card>

          <Card
            p="md"
            radius="md"
            bg={isDark ? "dark.7" : "white"}
            withBorder
            style={{ borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3] }}
          >
            <Group gap="xs" mb="xs">
              <IconClock size={20} color={theme.colors.grape[6]} />
              <Text fw={600} size="sm">Descanso Promedio</Text>
            </Group>
            <Text size="sm" c="dimmed">
              {sesion.ejercicios?.length ? Math.round(sesion.ejercicios.reduce((total, e) => total + e.tiempoDescanso, 0) / sesion.ejercicios.length) : 0}s
            </Text>
          </Card>
        </SimpleGrid>
      </Paper>

      {/* Lista de ejercicios */}
      <Paper 
        p="lg" 
        shadow="xs" 
        radius="md" 
        mb="xl" 
        withBorder
        bg={isDark ? "dark.7" : "white"}
        style={{ borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3] }}
      >
        <Title order={3} mb="lg" c="nutroos-green.6">
          Ejercicios de la Sesión
        </Title>

        {(!sesion.ejercicios || sesion.ejercicios.length === 0) ? (
          <Center py="xl">
            <Stack align="center" gap="md">
              <IconBarbell 
                size={48} 
                color={isDark ? theme.colors.gray[5] : theme.colors.gray[4]}
                stroke={1}
              />
              <Text c="dimmed">No hay ejercicios programados para esta sesión</Text>
            </Stack>
          </Center>
        ) : (
          <Timeline active={sesion.ejercicios?.length || 0} bulletSize={24} lineWidth={2}>
            {sesion.ejercicios?.map((ejercicioSesion, index) => {
              const ejercicio = ejercicioSesion.ejercicio as unknown as Ejercicio;
              
              return (
                <Timeline.Item
                  key={index}
                  bullet={
                    <ActionIcon
                      size={24}
                      radius="xl"
                      color="nutroos-green"
                      variant="filled"
                    >
                      {index + 1}
                    </ActionIcon>
                  }
                  title={
                    <Group justify="space-between" align="flex-start">
                      <div>
                        <Text fw={600} size="lg">
                          {ejercicio?.nombre || 'Ejercicio no encontrado'}
                        </Text>
                        <Text size="sm" c="dimmed">
                          {ejercicio?.grupoMuscular} • {ejercicio?.equipamiento}
                        </Text>
                      </div>
                      <Button
                        size="xs"
                        variant="light"
                        leftSection={<IconEye size={14} />}
                        onClick={() => ejercicio && handleVerEjercicio(ejercicio)}
                        disabled={!ejercicio}
                      >
                        Ver Detalles
                      </Button>
                    </Group>
                  }
                >
                  <Card
                    p="md"
                    radius="md"
                    bg={isDark ? "dark.8" : "gray.0"}
                    withBorder
                    style={{ borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3] }}
                  >
                    <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
                      <Box>
                        <Text size="xs" fw={600} c="dimmed" mb="xs">
                          SERIES
                        </Text>
                        <Group gap="xs">
                          <IconRepeat size={16} color={theme.colors.blue[6]} />
                          <Text fw={600}>{ejercicioSesion.series}</Text>
                        </Group>
                      </Box>

                      <Box>
                        <Text size="xs" fw={600} c="dimmed" mb="xs">
                          REPETICIONES
                        </Text>
                        <Group gap="xs">
                          <IconTarget size={16} color={theme.colors.teal[6]} />
                          <Text fw={600}>{ejercicioSesion.repeticiones}</Text>
                        </Group>
                      </Box>

                      {ejercicioSesion.peso && (
                        <Box>
                          <Text size="xs" fw={600} c="dimmed" mb="xs">
                            PESO
                          </Text>
                          <Group gap="xs">
                            <IconWeight size={16} color={theme.colors.orange[6]} />
                            <Text fw={600}>{ejercicioSesion.peso} kg</Text>
                          </Group>
                        </Box>
                      )}

                      <Box>
                        <Text size="xs" fw={600} c="dimmed" mb="xs">
                          DESCANSO
                        </Text>
                        <Group gap="xs">
                          <IconClock size={16} color={theme.colors.cyan[6]} />
                          <Text fw={600}>{ejercicioSesion.tiempoDescanso}s</Text>
                        </Group>
                      </Box>
                    </SimpleGrid>

                    {/* Ejercicios alternativos */}
                    {ejercicioSesion.ejerciciosAlternativos && ejercicioSesion.ejerciciosAlternativos.length > 0 && (
                      <Box mt="md">
                        <Text size="xs" fw={600} c="dimmed" mb="xs">
                          EJERCICIOS ALTERNATIVOS
                        </Text>
                        <Group gap="xs">
                          {ejercicioSesion.ejerciciosAlternativos.map((altId, idx) => {
                            const altEjercicio = getEjercicioById(altId);
                            return (
                              <Badge
                                key={idx}
                                size="sm"
                                variant="light"
                                color="gray"
                              >
                                {altEjercicio?.nombre || 'Ejercicio no encontrado'}
                              </Badge>
                            );
                          })}
                        </Group>
                      </Box>
                    )}

                    {/* Opciones de progresión */}
                    {ejercicioSesion.opcionesProgresion && (
                      <Box mt="md">
                        <Text size="xs" fw={600} c="dimmed" mb="xs">
                          OPCIONES DE PROGRESIÓN
                        </Text>
                        <Group gap="xs">
                          {ejercicioSesion.opcionesProgresion.aumentarPeso && (
                            <Badge size="sm" color="green" variant="light">
                              Aumentar Peso
                            </Badge>
                          )}
                          {ejercicioSesion.opcionesProgresion.masRepeticiones && (
                            <Badge size="sm" color="blue" variant="light">
                              Más Repeticiones
                            </Badge>
                          )}
                          {ejercicioSesion.opcionesProgresion.mayorIntensidad && (
                            <Badge size="sm" color="orange" variant="light">
                              Mayor Intensidad
                            </Badge>
                          )}
                        </Group>
                      </Box>
                    )}
                  </Card>
                </Timeline.Item>
              );
            })}
          </Timeline>
        )}
      </Paper>

      {/* Notas de la sesión */}
      {sesion.notas && (
        <Paper 
          p="lg" 
          shadow="xs" 
          radius="md" 
          withBorder
          bg={isDark ? "dark.7" : "white"}
          style={{ borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3] }}
        >
          <Title order={4} mb="md" c="nutroos-green.6">
            Notas de la Sesión
          </Title>
          <Text c="dimmed">{sesion.notas}</Text>
        </Paper>
      )}

      {/* Modal de detalles del ejercicio */}
      <ModalDetallesEjercicio
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        ejercicio={selectedEjercicio}
      />
    </Container>
  );
};

export default ClientTrainingSessionPage;
