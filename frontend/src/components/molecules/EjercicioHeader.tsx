import React from 'react';
import {
  Paper,
  Group,
  Badge,
  Title,
  Text,
  SimpleGrid,
  Card,
  Button
} from '@mantine/core';
import {
  IconTarget,
  IconBarbell,
  IconTrendingUp,
  IconStar,
  IconArrowLeft
} from '@tabler/icons-react';
import { Ejercicio } from '../../types/training';
import { getDifficultyColor, getIntensityColor } from '../../hooks/useEjercicioData';
import { useThemeDetection } from '../../hooks/useThemeDetection';
import { useMantineTheme } from '@mantine/core';

interface EjercicioHeaderProps {
  ejercicio: Ejercicio;
  showBackButton?: boolean;
  onBackClick?: () => void;
  backButtonText?: string;
  title?: string;
  showDescription?: boolean;
}

const EjercicioHeader: React.FC<EjercicioHeaderProps> = ({
  ejercicio,
  showBackButton = false,
  onBackClick,
  backButtonText = "Volver",
  title,
  showDescription = true
}) => {
  const isDark = useThemeDetection();
  const theme = useMantineTheme();

  return (
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
        {showBackButton && onBackClick ? (
          <Button
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
            onClick={onBackClick}
            color="gray"
            size="sm"
          >
            {backButtonText}
          </Button>
        ) : (
          <div />
        )}
        
        <Badge
          size="lg"
          color="nutroos-green"
          variant="light"
          leftSection={<IconBarbell size={16} />}
          fw={600}
        >
          {title || "Detalles del Ejercicio"}
        </Badge>
      </Group>

      <Title order={2} mb="xs" c="nutroos-green.6">
        {ejercicio.nombre}
      </Title>
      
      {showDescription && (
        <Text c="dimmed" size="lg" mb="md">
          {ejercicio.descripcion}
        </Text>
      )}

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
            {ejercicio.grupoMuscular || 'No especificado'}
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
            {ejercicio.equipamiento || 'No especificado'}
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
  );
};

export default EjercicioHeader;
