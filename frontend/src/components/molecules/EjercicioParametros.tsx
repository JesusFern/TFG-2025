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
  IconTarget,
  IconWeight,
  IconBarbell,
  IconUser,
  IconActivity
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
      
      <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="md">
        <Box>
          <Group gap="xs" mb="xs">
            <IconTarget size={16} color={theme.colors.blue[6]} />
            <Text fw={600} size="sm">Grupo Muscular</Text>
          </Group>
          <Text size="lg" fw={700} c="nutroos-green.6">
            {ejercicio.grupoMuscular}
          </Text>
        </Box>

        <Box>
          <Group gap="xs" mb="xs">
            <IconBarbell size={16} color={theme.colors.teal[6]} />
            <Text fw={600} size="sm">Equipamiento</Text>
          </Group>
          <Text size="lg" fw={700} c="nutroos-green.6">
            {ejercicio.equipamiento}
          </Text>
        </Box>

        <Box>
          <Group gap="xs" mb="xs">
            <IconActivity size={16} color={theme.colors.blue[6]} />
            <Text fw={600} size="sm">Tipo de Ejercicio</Text>
          </Group>
          <Text size="lg" fw={700} c="nutroos-green.6">
            {ejercicio.tipoEjercicio}
          </Text>
        </Box>

        <Box>
          <Group gap="xs" mb="xs">
            <IconUser size={16} color={theme.colors.blue[6]} />
            <Text fw={600} size="sm">Nivel de Dificultad</Text>
          </Group>
          <Text size="lg" fw={700} c="nutroos-green.6">
            {ejercicio.nivelDificultad}
          </Text>
        </Box>

        <Box>
          <Group gap="xs" mb="xs">
            <IconWeight size={16} color={theme.colors.orange[6]} />
            <Text fw={600} size="sm">Visibilidad</Text>
          </Group>
          <Text size="lg" fw={700} c="nutroos-green.6">
            {ejercicio.publico ? 'Público' : 'Privado'}
          </Text>
        </Box>
      </SimpleGrid>
    </Paper>
  );
};

export default EjercicioParametros;
