import { Paper, Group, ThemeIcon, Text } from '@mantine/core';
import { IconBarbell } from '@tabler/icons-react';

export const EstadoVacioEjercicios = () => {
  return (
    <Paper p="xl" withBorder>
      <Group justify="center">
        <ThemeIcon size="xl" radius="md" color="gray" variant="light">
          <IconBarbell size={32} />
        </ThemeIcon>
      </Group>
      <Text size="lg" ta="center" c="dimmed" mt="md">
        No hay ejercicios en esta sesión
      </Text>
    </Paper>
  );
};

export default EstadoVacioEjercicios;
