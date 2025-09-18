import React from 'react';
import {
  Modal,
  Title,
  Group,
  Badge,
  Stack,
  Text,
  Paper,
  SimpleGrid,
  Card,
  Box,
  List,
  ThemeIcon,
  useMantineTheme
} from '@mantine/core';
import {
  IconBarbell,
  IconTarget,
  IconClock,
  IconWeight,
  IconRepeat,
  IconCheck
} from '@tabler/icons-react';
import { Ejercicio } from '../../types/training';
import { useThemeDetection } from '../../hooks/useThemeDetection';

interface ModalDetallesEjercicioProps {
  opened: boolean;
  onClose: () => void;
  ejercicio: Ejercicio | null;
}

const ModalDetallesEjercicio: React.FC<ModalDetallesEjercicioProps> = ({
  opened,
  onClose,
  ejercicio
}) => {
  const isDark = useThemeDetection();
  const theme = useMantineTheme();

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

  if (!ejercicio) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="md">
          <IconBarbell size={24} color={theme.colors["nutroos-green"][6]} />
          <Text fw={600} size="lg">
            {ejercicio.nombre}
          </Text>
        </Group>
      }
      size="xl"
      centered
      zIndex={1000}
      styles={{
        header: {
          backgroundColor: isDark ? theme.colors.dark[7] : theme.colors.gray[0],
          borderBottom: `1px solid ${isDark ? theme.colors.dark[4] : theme.colors.gray[3]}`,
        },
        body: {
          backgroundColor: isDark ? theme.colors.dark[8] : 'white',
        }
      }}
    >
      <Stack gap="xl">
        {/* Header con información básica */}
        <Paper 
          p="lg" 
          radius="md" 
          withBorder
          bg={isDark ? "dark.7" : "gray.0"}
          style={{ borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3] }}
        >
          <Group justify="space-between" mb="md">
            <Group gap="md">
              <Badge 
                color="blue" 
                variant="light" 
                size="lg"
                leftSection={<IconTarget size={16} />}
              >
                {ejercicio.grupoMuscular || 'No especificado'}
              </Badge>
              <Badge 
                color="teal" 
                variant="light" 
                size="lg"
                leftSection={<IconBarbell size={16} />}
              >
                {ejercicio.equipamiento || 'No especificado'}
              </Badge>
            </Group>
            
            <Group gap="xs">
              <Badge 
                color={getDifficultyColor(ejercicio.nivelDificultad)} 
                variant="light"
                size="lg"
              >
                {ejercicio.nivelDificultad || 'No especificado'}
              </Badge>
              <Badge 
                color={getIntensityColor(ejercicio.nivelIntensidad)} 
                variant="light"
                size="lg"
              >
                {ejercicio.nivelIntensidad || 'No especificado'}
              </Badge>
            </Group>
          </Group>

          <Text c="dimmed" size="lg" lineClamp={3}>
            {ejercicio.descripcion || 'Sin descripción disponible'}
          </Text>
        </Paper>

        {/* Parámetros del ejercicio */}
        <Paper 
          p="lg" 
          radius="md" 
          withBorder
          bg={isDark ? "dark.7" : "gray.0"}
          style={{ borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3] }}
        >
          <Title order={4} mb="lg" c="nutroos-green.6">
            Parámetros del Ejercicio
          </Title>
          
          <SimpleGrid cols={2} spacing="lg">
            <Card
              p="md"
              radius="md"
              bg={isDark ? "dark.8" : "white"}
              withBorder
              style={{ borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3] }}
            >
              <Group gap="xs" mb="xs">
                <IconRepeat size={20} color={theme.colors.blue[6]} />
                <Text fw={600} size="sm">Series</Text>
              </Group>
              <Text size="xl" fw={700} c="nutroos-green.6">
                {ejercicio.series || 'N/A'}
              </Text>
            </Card>

            <Card
              p="md"
              radius="md"
              bg={isDark ? "dark.8" : "white"}
              withBorder
              style={{ borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3] }}
            >
              <Group gap="xs" mb="xs">
                <IconTarget size={20} color={theme.colors.teal[6]} />
                <Text fw={600} size="sm">Repeticiones</Text>
              </Group>
              <Text size="xl" fw={700} c="nutroos-green.6">
                {ejercicio.repeticiones || 'N/A'}
              </Text>
            </Card>

            <Card
              p="md"
              radius="md"
              bg={isDark ? "dark.8" : "white"}
              withBorder
              style={{ borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3] }}
            >
              <Group gap="xs" mb="xs">
                <IconClock size={20} color={theme.colors.cyan[6]} />
                <Text fw={600} size="sm">Descanso</Text>
              </Group>
              <Text size="xl" fw={700} c="nutroos-green.6">
                {ejercicio.tiempoDescanso ? `${ejercicio.tiempoDescanso}s` : 'N/A'}
              </Text>
            </Card>

            <Card
              p="md"
              radius="md"
              bg={isDark ? "dark.8" : "white"}
              withBorder
              style={{ borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3] }}
            >
              <Group gap="xs" mb="xs">
                <IconWeight size={20} color={theme.colors.orange[6]} />
                <Text fw={600} size="sm">Peso Sugerido</Text>
              </Group>
              <Text size="xl" fw={700} c="nutroos-green.6">
                Variable
              </Text>
            </Card>
          </SimpleGrid>
        </Paper>

        {/* Video demostrativo */}
        {ejercicio.videoDemostrativo && (
          <Paper 
            p="lg" 
            radius="md" 
            withBorder
            bg={isDark ? "dark.7" : "gray.0"}
            style={{ borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3] }}
          >
            <Title order={4} mb="md" c="nutroos-green.6">
              Video Demostrativo
            </Title>
            
            <Box
              style={{
                position: 'relative',
                width: '100%',
                height: '250px',
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

        {/* Consejos de ejecución */}
        <Paper 
          p="lg" 
          radius="md" 
          withBorder
          bg={isDark ? "dark.7" : "gray.0"}
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
      </Stack>
    </Modal>
  );
};

export default ModalDetallesEjercicio;
