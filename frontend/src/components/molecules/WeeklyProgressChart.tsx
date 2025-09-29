import React from 'react';
import { Paper, Title, Text, Group, Stack, useMantineTheme, useMantineColorScheme, RingProgress, Button } from '@mantine/core';
import { IconTrendingUp, IconTarget, IconCheck, IconArrowRight } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

interface WeeklyProgressChartProps {
  nutritionProgress: number;
  exerciseProgress: number;
  goalProgress: number;
  showNutrition?: boolean;
  showExercise?: boolean;
  showGeneral?: boolean;
  userRole?: 'user' | 'worker' | 'admin';
}

export const WeeklyProgressChart: React.FC<WeeklyProgressChartProps> = ({
  nutritionProgress,
  exerciseProgress,
  goalProgress,
  showNutrition = true,
  showExercise = true,
  showGeneral = true,
  userRole = 'user'
}) => {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const navigate = useNavigate();
  const isDark = colorScheme === 'dark';

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

  const getSummaryMessage = (progress: number) => {
    if (userRole === 'worker') {
      // Mensajes para trabajadores (sobre sus clientes)
      if (progress >= 80) {
        return '¡Excelente progreso de tus clientes esta semana!';
      } else if (progress >= 60) {
        return 'Buen progreso de tus clientes. Pueden mejorar un poco más.';
      } else if (progress >= 40) {
        return 'Progreso regular de tus clientes. Considera ajustar las rutinas.';
      } else {
        return 'Esta semana ha sido difícil para tus clientes. ¡Sigue motivándolos!';
      }
    } else {
      // Mensajes para usuarios (sobre sí mismos)
      if (progress >= 80) {
        return '¡Excelente trabajo esta semana! Sigue así.';
      } else if (progress >= 60) {
        return 'Buen progreso. Puedes mejorar un poco más.';
      } else if (progress >= 40) {
        return 'Progreso regular. ¡No te rindas!';
      } else {
        return 'Esta semana ha sido difícil. ¡No te rindas!';
      }
    }
  };

  return (
    <Paper p="lg" radius="lg" withBorder>
      <Stack gap="lg">
        <Title order={4} c={theme.colors.gray[8]}>
          Progreso de la Semana
        </Title>
        
        <Group justify="space-around" align="flex-start">
          {showNutrition && (
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
          )}

          {showExercise && (
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
          )}

          {showGeneral && (
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
          )}
        </Group>

        {/* Resumen */}
        <Paper 
          p="sm" 
          radius="md" 
          bg={isDark ? theme.colors.dark[5] : theme.colors.gray[0]}
          style={{
            borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3]
          }}
        >
          <Text 
            size="sm" 
            c={isDark ? theme.colors.dark[1] : "dimmed"} 
            ta="center"
          >
            {getSummaryMessage(goalProgress)}
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
