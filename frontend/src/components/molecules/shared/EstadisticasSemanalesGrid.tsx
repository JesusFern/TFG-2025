import React from 'react';
import { Grid, Card, Text, Group, Progress, ThemeIcon } from '@mantine/core';
import { IconCheck, IconStar } from '@tabler/icons-react';

interface EstadisticasSemanalesData {
  progreso: {
    porcentajeCompletitud: number;
    comidasRegistradas: number;
    comidasPlanificadas: number;
    promedioSatisfaccion: number;
    promedioCumplimiento: number;
  };
  semana?: {
    numero: number;
    año: number;
  };
}

interface EstadisticasSemanalesGridProps {
  estadisticasSemanal: EstadisticasSemanalesData;
  title?: string;
}

const EstadisticasSemanalesGrid: React.FC<EstadisticasSemanalesGridProps> = ({ 
  estadisticasSemanal, 
  title 
}) => {
  const semanaTitle = title || `🍎 Resumen de la Semana ${estadisticasSemanal.semana?.numero || 'Actual'}`;

  return (
    <>
      <Text size="lg" fw={600} mb="md">
        {semanaTitle}
      </Text>
      
      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="sm" padding="lg" radius="md" h="100%">
            <Group justify="space-between" mb="md">
              <div>
                <Text fw={600} size="lg">Cumplimiento</Text>
                <Text size="sm" c="dimmed">Comidas registradas esta semana</Text>
              </div>
              <ThemeIcon color="green" variant="light" size="xl">
                <IconCheck size={24} />
              </ThemeIcon>
            </Group>
            
            <Group align="flex-end" mb="md">
              <Text size="2rem" fw={800} c="green">
                {Math.round(estadisticasSemanal.progreso?.porcentajeCompletitud || 0)}%
              </Text>
              <Text size="sm" c="dimmed" ml="xs">
                ({estadisticasSemanal.progreso?.comidasRegistradas || 0}/{estadisticasSemanal.progreso?.comidasPlanificadas || 0} comidas)
              </Text>
            </Group>
            
            <Progress 
              value={estadisticasSemanal.progreso?.porcentajeCompletitud || 0} 
              size="lg" 
              color="green"
              radius="xl"
            />
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="sm" padding="lg" radius="md" h="100%">
            <Group justify="space-between" mb="md">
              <div>
                <Text fw={600} size="lg">Satisfacción</Text>
                <Text size="sm" c="dimmed">Promedio de satisfacción</Text>
              </div>
              <ThemeIcon color="yellow" variant="light" size="xl">
                <IconStar size={24} />
              </ThemeIcon>
            </Group>
            
            <Group align="flex-end" mb="md">
              <Text size="2rem" fw={800} c="yellow">
                {estadisticasSemanal.progreso?.promedioSatisfaccion?.toFixed(1) || '0.0'}/5
              </Text>
              <Text size="sm" c="dimmed" ml="xs">
                Promedio semanal
              </Text>
            </Group>
            
            <Progress 
              value={(estadisticasSemanal.progreso?.promedioSatisfaccion || 0) * 20} 
              size="lg" 
              color="yellow"
              radius="xl"
            />
          </Card>
        </Grid.Col>
      </Grid>
    </>
  );
};

export default EstadisticasSemanalesGrid;
