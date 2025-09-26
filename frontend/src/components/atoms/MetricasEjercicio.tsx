import { Paper, Text, SimpleGrid } from '@mantine/core';

interface MetricasEjercicioProps {
  cargaUtilizada: number;
  repeticionesRealizadas: number;
  seriesCompletadas: number;
  nivelEsfuerzo: number;
  tiempoDescanso: number;
}

export const MetricasEjercicio = ({
  cargaUtilizada,
  repeticionesRealizadas,
  seriesCompletadas,
  nivelEsfuerzo,
  tiempoDescanso
}: MetricasEjercicioProps) => {
  return (
    <Paper p="md" withBorder>
      <Text size="lg" fw={600} mb="md">Métricas del Ejercicio</Text>
      
      <SimpleGrid cols={2} spacing="md">
        <div>
          <Text size="sm" fw={500} mb="xs">Carga Utilizada</Text>
          <Text size="lg" fw={600}>{cargaUtilizada}kg</Text>
        </div>
        <div>
          <Text size="sm" fw={500} mb="xs">Repeticiones Realizadas</Text>
          <Text size="lg" fw={600}>{repeticionesRealizadas}</Text>
        </div>
        <div>
          <Text size="sm" fw={500} mb="xs">Series Completadas</Text>
          <Text size="lg" fw={600}>{seriesCompletadas}</Text>
        </div>
        <div>
          <Text size="sm" fw={500} mb="xs">Nivel de Esfuerzo (RPE)</Text>
          <Text size="lg" fw={600}>{nivelEsfuerzo}/10</Text>
        </div>
        <div>
          <Text size="sm" fw={500} mb="xs">Tiempo de Descanso</Text>
          <Text size="lg" fw={600}>{tiempoDescanso}s</Text>
        </div>
      </SimpleGrid>
    </Paper>
  );
};

export default MetricasEjercicio;
