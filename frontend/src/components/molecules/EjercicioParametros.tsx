import React from 'react';
import {
  Paper,
  Title,
  SimpleGrid,
  Group,
  Text,
  Box
} from '@mantine/core';
import {
  IconRepeat,
  IconTarget,
  IconClock,
  IconWeight
} from '@tabler/icons-react';
import { Ejercicio } from '../../types/training';
import { useThemeDetection } from '../../hooks/useThemeDetection';
import { useMantineTheme } from '@mantine/core';

interface EjercicioParametrosProps {
  ejercicio: Ejercicio;
  title?: string;
  showTitle?: boolean;
}

const EjercicioParametros: React.FC<EjercicioParametrosProps> = ({
  ejercicio,
  title = "Parámetros Recomendados",
  showTitle = true
}) => {
  const isDark = useThemeDetection();
  const theme = useMantineTheme();

  return (
    <Paper 
      p="lg" 
      shadow="xs" 
      radius="md" 
      withBorder
      bg={isDark ? "dark.7" : "white"}
      style={{ borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3] }}
    >
      {showTitle && (
        <Title order={4} mb="md" c="nutroos-green.6">
          {title}
        </Title>
      )}
      
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
  );
};

export default EjercicioParametros;
