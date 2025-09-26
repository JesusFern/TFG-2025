import { Paper, Text } from '@mantine/core';

interface NotasEjercicioProps {
  notas?: string;
}

export const NotasEjercicio = ({ notas }: NotasEjercicioProps) => {
  if (!notas) return null;

  return (
    <Paper p="md" withBorder>
      <Text size="lg" fw={600} mb="md">Notas del Ejercicio</Text>
      <Paper p="sm" withBorder style={{ backgroundColor: '#f8f9fa' }}>
        <Text size="sm">{notas}</Text>
      </Paper>
    </Paper>
  );
};

export default NotasEjercicio;
