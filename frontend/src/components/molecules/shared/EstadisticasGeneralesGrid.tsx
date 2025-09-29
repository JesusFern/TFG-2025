import React from 'react';
import { Grid, Card, Text, Group, Progress, ThemeIcon } from '@mantine/core';
import { IconCheck, IconStar, IconApple, IconTarget } from '@tabler/icons-react';
import { EstadisticasNutricionalesGenerales } from '../../../types/estadisticasNutricionales';

interface EstadisticasGeneralesGridProps {
  estadisticas: EstadisticasNutricionalesGenerales;
  title?: string;
}

const EstadisticasGeneralesGrid: React.FC<EstadisticasGeneralesGridProps> = ({ 
  estadisticas, 
  title = "Resumen General" 
}) => {
  return (
    <>
      <Text size="lg" fw={600} mb="md">
        {title}
      </Text>
      
      <Grid>
        <Grid.Col span={{ base: 6, md: 3 }}>
          <Card shadow="sm" padding="md" radius="md">
            <Group justify="space-between" mb="xs">
              <Text fw={500} size="sm">Cumplimiento</Text>
              <ThemeIcon color="green" variant="light">
                <IconCheck size={16} />
              </ThemeIcon>
            </Group>
            <Text size="xl" fw={700} c="green">
              {Math.round(estadisticas.porcentajeCumplimientoGeneral)}%
            </Text>
            <Text size="sm" c="dimmed">
              {estadisticas.totalComidasRegistradas} de {estadisticas.totalComidasPlanificadas} comidas
            </Text>
            <Progress 
              value={estadisticas.porcentajeCumplimientoGeneral} 
              size="sm" 
              mt="xs" 
              color="green"
            />
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 6, md: 3 }}>
          <Card shadow="sm" padding="md" radius="md">
            <Group justify="space-between" mb="xs">
              <Text fw={500} size="sm">Satisfacción</Text>
              <ThemeIcon color="yellow" variant="light">
                <IconStar size={16} />
              </ThemeIcon>
            </Group>
            <Text size="xl" fw={700} c="yellow">
              {estadisticas.promedioSatisfaccion.toFixed(1)}/5
            </Text>
            <Text size="sm" c="dimmed">
              Promedio general
            </Text>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 6, md: 3 }}>
          <Card shadow="sm" padding="md" radius="md">
            <Group justify="space-between" mb="xs">
              <Text fw={500} size="sm">Dietas Activas</Text>
              <ThemeIcon color="blue" variant="light">
                <IconApple size={16} />
              </ThemeIcon>
            </Group>
            <Text size="xl" fw={700} c="blue">
              {estadisticas.dietasActivas}
            </Text>
            <Text size="sm" c="dimmed">
              de {estadisticas.totalDietas} totales
            </Text>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 6, md: 3 }}>
          <Card shadow="sm" padding="md" radius="md">
            <Group justify="space-between" mb="xs">
              <Text fw={500} size="sm">Cumplimiento Promedio</Text>
              <ThemeIcon color="orange" variant="light">
                <IconTarget size={16} />
              </ThemeIcon>
            </Group>
            <Text size="xl" fw={700} c="orange">
              {estadisticas.promedioCumplimiento.toFixed(1)}/5
            </Text>
            <Text size="sm" c="dimmed">
              Promedio general
            </Text>
          </Card>
        </Grid.Col>
      </Grid>
    </>
  );
};

export default EstadisticasGeneralesGrid;
