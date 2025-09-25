import React from 'react';
import { Paper, Title, Text, Group, Stack, useMantineTheme, RingProgress, Button } from '@mantine/core';
import { IconTrendingUp, IconTarget, IconCheck, IconArrowRight } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

interface WeeklyProgressChartProps {
  nutritionProgress: number;
  exerciseProgress: number;
  goalProgress: number;
}

export const WeeklyProgressChart: React.FC<WeeklyProgressChartProps> = ({
  nutritionProgress,
  exerciseProgress,
  goalProgress
}) => {
  const theme = useMantineTheme();
  const navigate = useNavigate();

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return theme.colors.green[6];
    if (progress >= 60) return theme.colors.yellow[6];
    if (progress >= 40) return theme.colors.orange[6];
    return theme.colors.red[6];
  };

  const getProgressLabel = (progress: number) => {
    if (progress >= 80) return 'Excelente';
    if (progress >= 60) return 'Bueno';
    if (progress >= 40) return 'Regular';
    return 'Necesita mejorar';
  };

  return (
    <Paper p="lg" radius="lg" withBorder>
      <Stack gap="lg">
        <Title order={4} c={theme.colors.gray[8]}>
          Progreso de la Semana
        </Title>
        
        <Group justify="space-around" align="flex-start">
          <Stack align="center" gap="xs">
            <RingProgress
              size={80}
              thickness={8}
              sections={[{ value: nutritionProgress, color: getProgressColor(nutritionProgress) }]}
              label={
                <Text ta="center" size="xs" fw={700}>
                  {nutritionProgress}%
                </Text>
              }
            />
            <Group gap="xs" align="center">
              <IconTarget size={16} color={theme.colors.orange[6]} />
              <Text size="sm" fw={500}>Nutrición</Text>
            </Group>
            <Text size="xs" c="dimmed" ta="center">
              {getProgressLabel(nutritionProgress)}
            </Text>
          </Stack>

          <Stack align="center" gap="xs">
            <RingProgress
              size={80}
              thickness={8}
              sections={[{ value: exerciseProgress, color: getProgressColor(exerciseProgress) }]}
              label={
                <Text ta="center" size="xs" fw={700}>
                  {exerciseProgress}%
                </Text>
              }
            />
            <Group gap="xs" align="center">
              <IconTrendingUp size={16} color={theme.colors.blue[6]} />
              <Text size="sm" fw={500}>Ejercicio</Text>
            </Group>
            <Text size="xs" c="dimmed" ta="center">
              {getProgressLabel(exerciseProgress)}
            </Text>
          </Stack>

          <Stack align="center" gap="xs">
            <RingProgress
              size={80}
              thickness={8}
              sections={[{ value: goalProgress, color: getProgressColor(goalProgress) }]}
              label={
                <Text ta="center" size="xs" fw={700}>
                  {goalProgress}%
                </Text>
              }
            />
            <Group gap="xs" align="center">
              <IconCheck size={16} color={theme.colors.green[6]} />
              <Text size="sm" fw={500}>General</Text>
            </Group>
            <Text size="xs" c="dimmed" ta="center">
              {getProgressLabel(goalProgress)}
            </Text>
          </Stack>
        </Group>

        {/* Resumen */}
        <Paper p="sm" radius="md" bg={theme.colors.gray[0]}>
          <Text size="sm" c="dimmed" ta="center">
            {goalProgress >= 80 
              ? '¡Excelente trabajo esta semana! Sigue así.'
              : goalProgress >= 60
              ? 'Buen progreso. Puedes mejorar un poco más.'
              : 'Esta semana ha sido difícil. ¡No te rindas!'
            }
          </Text>
        </Paper>

        {/* Botón para ver detalles */}
        <Button
          variant="light"
          color="nutroos-green"
          rightSection={<IconArrowRight size={16} />}
          onClick={() => navigate('/progreso-semanal')}
          fullWidth
        >
          Ver Detalles Completos
        </Button>
      </Stack>
    </Paper>
  );
};
