import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Title, 
  Loader, 
  Alert, 
  Stack, 
  Text, 
  useMantineTheme,
  Paper,
  Center,
  SimpleGrid,
  List,
  ThemeIcon
} from '@mantine/core';
import { 
  IconBarbell,
  IconAlertCircle,
  IconCheck
} from '@tabler/icons-react';
import { useThemeDetection } from '../hooks/useThemeDetection';
import { useEjercicioData } from '../hooks/useEjercicioData';
import EjercicioHeader from '../components/molecules/EjercicioHeader';
import EjercicioParametros from '../components/molecules/EjercicioParametros';
import EjercicioVideo from '../components/molecules/EjercicioVideo';

const ClientExerciseDetailPage: React.FC = () => {
  const { ejercicioId } = useParams();
  const navigate = useNavigate();
  const isDark = useThemeDetection();
  const theme = useMantineTheme();
  
  const { ejercicio, loading, error } = useEjercicioData(ejercicioId);

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
      <EjercicioHeader 
        ejercicio={ejercicio}
        showBackButton={true}
        onBackClick={() => navigate(-1)}
        backButtonText="Volver"
        title="Detalles del Ejercicio"
        showDescription={true}
      />

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

          {/* Instrucciones del ejercicio */}
          {ejercicio.instrucciones && (
            <Paper 
              p="lg" 
              shadow="xs" 
              radius="md" 
              withBorder
              bg={isDark ? "dark.7" : "white"}
              style={{ borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3] }}
            >
              <Title order={4} mb="md" c="nutroos-green.6">
                Instrucciones
              </Title>
              <Text c="dimmed" style={{ whiteSpace: 'pre-line' }}>
                {ejercicio.instrucciones}
              </Text>
            </Paper>
          )}

          {/* Parámetros del ejercicio */}
          <EjercicioParametros 
            ejercicio={ejercicio}
            title="Parámetros Recomendados"
          />

          {/* Video demostrativo */}
          <EjercicioVideo 
            ejercicio={ejercicio}
            height={300}
          />
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
