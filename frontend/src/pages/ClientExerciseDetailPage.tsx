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
  List,
  ThemeIcon
} from '@mantine/core';
import { 
  IconArrowLeft, 
  IconBarbell,
  IconAlertCircle,
  IconTarget,
  IconClock,
  IconWeight,
  IconRepeat,
  IconTrendingUp,
  IconCheck,
  IconStar
} from '@tabler/icons-react';
import { useThemeDetection } from '../hooks/useThemeDetection';
import { Ejercicio } from '../types/training';
import { trainingService } from '../services/trainingService';

const ClientExerciseDetailPage: React.FC = () => {
  const { ejercicioId } = useParams();
  const navigate = useNavigate();
  const isDark = useThemeDetection();
  const theme = useMantineTheme();
  
  const [ejercicio, setEjercicio] = useState<Ejercicio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarEjercicio = async () => {
      if (!ejercicioId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const ejercicioData = await trainingService.obtenerEjercicioPorId(ejercicioId);
        setEjercicio(ejercicioData);
        
      } catch (err) {
        console.error('Error al cargar ejercicio:', err);
        setError('Error al cargar los datos del ejercicio');
      } finally {
        setLoading(false);
      }
    };

    cargarEjercicio();
  }, [ejercicioId]);

  const getDifficultyColor = (nivel: string | undefined) => {
    if (!nivel) return 'blue';
    switch (nivel.toLowerCase()) {
      case 'principiante':
        return 'green';
      case 'intermedio':
        return 'yellow';
      case 'avanzado':
        return 'red';
      default:
        return 'blue';
    }
  };

  const getIntensityColor = (nivel: string | undefined) => {
    if (!nivel) return 'blue';
    switch (nivel.toLowerCase()) {
      case 'baja':
        return 'green';
      case 'media':
        return 'yellow';
      case 'alta':
        return 'red';
      default:
        return 'blue';
    }
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

  if (!ejercicio) {
    return (
      <Container py="xl">
        <Alert icon={<IconAlertCircle size={16} />} color="red">
          No se encontró el ejercicio solicitado.
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
            onClick={() => navigate(-1)}
            color="gray"
            size="sm"
          >
            Volver
          </Button>
          
          <Badge
            size="lg"
            color="nutroos-green"
            variant="light"
            leftSection={<IconBarbell size={16} />}
            fw={600}
          >
            Detalles del Ejercicio
          </Badge>
        </Group>

        <Title order={2} mb="xs" c="nutroos-green.6">
          {ejercicio.nombre}
        </Title>
        
        <Text c="dimmed" size="lg" mb="md">
          {ejercicio.descripcion}
        </Text>

        {/* Información básica del ejercicio */}
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
              <Text fw={600} size="sm">Grupo Muscular</Text>
            </Group>
            <Badge color="blue" variant="light" size="lg">
              {ejercicio.grupoMuscular}
            </Badge>
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
              <Text fw={600} size="sm">Equipamiento</Text>
            </Group>
            <Badge color="teal" variant="light" size="lg">
              {ejercicio.equipamiento}
            </Badge>
          </Card>

          <Card
            p="md"
            radius="md"
            bg={isDark ? "dark.7" : "white"}
            withBorder
            style={{ borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3] }}
          >
            <Group gap="xs" mb="xs">
              <IconTrendingUp size={20} color={theme.colors.orange[6]} />
              <Text fw={600} size="sm">Dificultad</Text>
            </Group>
            <Badge color={getDifficultyColor(ejercicio.nivelDificultad)} variant="light" size="lg">
              {ejercicio.nivelDificultad || 'No especificado'}
            </Badge>
          </Card>

          <Card
            p="md"
            radius="md"
            bg={isDark ? "dark.7" : "white"}
            withBorder
            style={{ borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3] }}
          >
            <Group gap="xs" mb="xs">
              <IconStar size={20} color={theme.colors.red[6]} />
              <Text fw={600} size="sm">Intensidad</Text>
            </Group>
            <Badge color={getIntensityColor(ejercicio.nivelIntensidad)} variant="light" size="lg">
              {ejercicio.nivelIntensidad || 'No especificado'}
            </Badge>
          </Card>
        </SimpleGrid>
      </Paper>

      {/* Contenido principal */}
      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="xl">
        {/* Información detallada */}
        <Stack gap="lg">
          {/* Descripción detallada */}
          <Paper 
            p="lg" 
            shadow="xs" 
            radius="md" 
            withBorder
            bg={isDark ? "dark.7" : "white"}
            style={{ borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3] }}
          >
            <Title order={4} mb="md" c="nutroos-green.6">
              Descripción
            </Title>
            <Text c="dimmed" lineClamp={6}>
              {ejercicio.descripcion}
            </Text>
          </Paper>

          {/* Parámetros del ejercicio */}
          <Paper 
            p="lg" 
            shadow="xs" 
            radius="md" 
            withBorder
            bg={isDark ? "dark.7" : "white"}
            style={{ borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3] }}
          >
            <Title order={4} mb="md" c="nutroos-green.6">
              Parámetros Recomendados
            </Title>
            
            <SimpleGrid cols={2} spacing="md">
              <Box>
                <Group gap="xs" mb="xs">
                  <IconRepeat size={16} color={theme.colors.blue[6]} />
                  <Text fw={600} size="sm">Series</Text>
                </Group>
                <Text size="lg" fw={700} c="nutroos-green.6">
                  {ejercicio.series || 'N/A'}
                </Text>
              </Box>

              <Box>
                <Group gap="xs" mb="xs">
                  <IconTarget size={16} color={theme.colors.teal[6]} />
                  <Text fw={600} size="sm">Repeticiones</Text>
                </Group>
                <Text size="lg" fw={700} c="nutroos-green.6">
                  {ejercicio.repeticiones || 'N/A'}
                </Text>
              </Box>

              <Box>
                <Group gap="xs" mb="xs">
                  <IconClock size={16} color={theme.colors.cyan[6]} />
                  <Text fw={600} size="sm">Descanso</Text>
                </Group>
                <Text size="lg" fw={700} c="nutroos-green.6">
                  {ejercicio.tiempoDescanso ? `${ejercicio.tiempoDescanso}s` : 'N/A'}
                </Text>
              </Box>

              <Box>
                <Group gap="xs" mb="xs">
                  <IconWeight size={16} color={theme.colors.orange[6]} />
                  <Text fw={600} size="sm">Peso Sugerido</Text>
                </Group>
                <Text size="lg" fw={700} c="nutroos-green.6">
                  Variable
                </Text>
              </Box>
            </SimpleGrid>
          </Paper>

          {/* Video demostrativo */}
          {ejercicio.videoDemostrativo && (
            <Paper 
              p="lg" 
              shadow="xs" 
              radius="md" 
              withBorder
              bg={isDark ? "dark.7" : "white"}
              style={{ borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3] }}
            >
              <Title order={4} mb="md" c="nutroos-green.6">
                Video Demostrativo
              </Title>
              
              <Box
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '300px',
                  borderRadius: theme.radius.md,
                  overflow: 'hidden',
                  backgroundColor: isDark ? theme.colors.dark[8] : theme.colors.gray[1]
                }}
              >
                <video
                  controls
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: theme.radius.md
                  }}
                  preload="metadata"
                >
                  <source src={ejercicio.videoDemostrativo} type="video/mp4" />
                  <source src={ejercicio.videoDemostrativo} type="video/webm" />
                  <source src={ejercicio.videoDemostrativo} type="video/ogg" />
                  Tu navegador no soporta la reproducción de video.
                </video>
              </Box>
              
              <Text size="xs" c="dimmed" mt="xs" ta="center">
                Video demostrativo del ejercicio
              </Text>
            </Paper>
          )}
        </Stack>

        {/* Imagen o placeholder */}
        <Paper 
          p="lg" 
          shadow="xs" 
          radius="md" 
          withBorder
          bg={isDark ? "dark.7" : "white"}
          style={{ borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3] }}
        >
          <Title order={4} mb="md" c="nutroos-green.6">
            Ilustración
          </Title>
          
          <Center py="xl">
            <Stack align="center" gap="md">
              <IconBarbell 
                size={80} 
                color={isDark ? theme.colors.gray[5] : theme.colors.gray[4]}
                stroke={1}
              />
              <Text c="dimmed" ta="center">
                Ilustración del ejercicio
              </Text>
              <Text size="sm" c="dimmed" ta="center">
                {ejercicio.nombre}
              </Text>
            </Stack>
          </Center>
        </Paper>
      </SimpleGrid>

      {/* Consejos y tips */}
      <Paper 
        p="lg" 
        shadow="xs" 
        radius="md" 
        mt="xl"
        withBorder
        bg={isDark ? "dark.7" : "white"}
        style={{ borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3] }}
      >
        <Title order={4} mb="md" c="nutroos-green.6">
          Consejos de Ejecución
        </Title>
        
        <List spacing="sm" size="sm">
          <List.Item
            icon={
              <ThemeIcon color="nutroos-green" size={24} radius="xl">
                <IconCheck size={12} />
              </ThemeIcon>
            }
          >
            Mantén una postura correcta durante todo el ejercicio
          </List.Item>
          <List.Item
            icon={
              <ThemeIcon color="nutroos-green" size={24} radius="xl">
                <IconCheck size={12} />
              </ThemeIcon>
            }
          >
            Realiza el movimiento de forma controlada, sin rebotes
          </List.Item>
          <List.Item
            icon={
              <ThemeIcon color="nutroos-green" size={24} radius="xl">
                <IconCheck size={12} />
              </ThemeIcon>
            }
          >
            Respira correctamente: exhala en el esfuerzo, inhala en la relajación
          </List.Item>
          <List.Item
            icon={
              <ThemeIcon color="nutroos-green" size={24} radius="xl">
                <IconCheck size={12} />
              </ThemeIcon>
            }
          >
            Si sientes dolor, detén el ejercicio inmediatamente
          </List.Item>
          <List.Item
            icon={
              <ThemeIcon color="nutroos-green" size={24} radius="xl">
                <IconCheck size={12} />
              </ThemeIcon>
            }
          >
            Calienta antes de realizar el ejercicio
          </List.Item>
        </List>
      </Paper>

    </Container>
  );
};

export default ClientExerciseDetailPage;
