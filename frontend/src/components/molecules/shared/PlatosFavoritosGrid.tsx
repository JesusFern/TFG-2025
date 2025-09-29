import React from 'react';
import { Grid, Card, Text, Group, ThemeIcon, Stack } from '@mantine/core';
import { IconApple } from '@tabler/icons-react';

// Tipo más flexible para los datos de progreso de comidas
interface ProgresoComidaFlexible {
  comidaId?: string;
  nombreComida?: string;
  nombreDieta?: string;
  estadisticas?: {
    totalRegistros?: number;
    satisfaccionPromedio?: number;
    cumplimientoPromedio?: number;
    tendenciaSatisfaccion?: string;
  };
}

interface PlatosFavoritosGridProps {
  progresoComidas: ProgresoComidaFlexible[];
  title?: string;
  subtitle?: string;
  showEmptyState?: boolean;
}

const PlatosFavoritosGrid: React.FC<PlatosFavoritosGridProps> = ({ 
  progresoComidas, 
  title = "🏆 Platos Favoritos",
  subtitle = "Mejor satisfacción registrada",
  showEmptyState = true
}) => {
  const platosFiltrados = progresoComidas
    .filter((comida: ProgresoComidaFlexible) => comida.estadisticas?.totalRegistros && comida.estadisticas.totalRegistros > 0)
    .sort((a: ProgresoComidaFlexible, b: ProgresoComidaFlexible) => (b.estadisticas?.satisfaccionPromedio || 0) - (a.estadisticas?.satisfaccionPromedio || 0))
    .slice(0, 3);

  if (platosFiltrados.length === 0 && !showEmptyState) {
    return null;
  }

  return (
    <>
      <Group justify="space-between" align="center" mb="md">
        <Text size="lg" fw={600}>
          {title}
        </Text>
        <Text size="sm" c="dimmed">
          {subtitle}
        </Text>
      </Group>
      
      {platosFiltrados.length > 0 ? (
        <Grid>
          {platosFiltrados.map((comida: ProgresoComidaFlexible, index) => (
            <Grid.Col span={{ base: 12, md: 4 }} key={comida.comidaId || 'unknown'}>
              <Card shadow="sm" padding="lg" radius="md" h="100%">
                {/* Posición y medalla */}
                <Group justify="space-between" mb="md">
                  <Group gap="sm">
                    <ThemeIcon 
                      color={index === 0 ? 'yellow' : index === 1 ? 'gray' : 'orange'} 
                      variant="filled" 
                      size="lg"
                    >
                      <Text fw={700} size="sm">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </Text>
                    </ThemeIcon>
                    <div>
                      <Text fw={600} size="md">{comida.nombreComida || 'Plato sin nombre'}</Text>
                      <Text size="sm" c="dimmed">{comida.nombreDieta || 'Sin dieta'}</Text>
                    </div>
                  </Group>
                  
                  {comida.estadisticas?.tendenciaSatisfaccion && (
                    <Text 
                      size="xs" 
                      c={
                        comida.estadisticas.tendenciaSatisfaccion === 'mejorando' ? 'green' :
                        comida.estadisticas.tendenciaSatisfaccion === 'estable' ? 'blue' : 'red'
                      }
                    >
                      {comida.estadisticas.tendenciaSatisfaccion === 'mejorando' ? '📈 Mejora' :
                       comida.estadisticas.tendenciaSatisfaccion === 'estable' ? '➡️ Estable' : '📉 Baja'}
                    </Text>
                  )}
                </Group>

                {/* Métricas principales */}
                <Stack gap="md">
                  <div>
                    <Text size="sm" c="dimmed">Satisfacción Promedio</Text>
                    <Text fw={700} size="xl" c="yellow">
                      {comida.estadisticas?.satisfaccionPromedio?.toFixed(1) || '0.0'}/5
                    </Text>
                  </div>
                  
                  <Group grow>
                    <div>
                      <Text size="sm" c="dimmed">Cumplimiento</Text>
                      <Text fw={600} size="lg">
                        {comida.estadisticas?.cumplimientoPromedio?.toFixed(1) || '0.0'}/5
                      </Text>
                    </div>
                    <div>
                      <Text size="sm" c="dimmed">Registros</Text>
                      <Text fw={600} size="lg">
                        {comida.estadisticas?.totalRegistros || 0}
                      </Text>
                    </div>
                  </Group>
                </Stack>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      ) : showEmptyState ? (
        <Card shadow="sm" padding="xl" radius="md">
          <Stack align="center" gap="md">
            <ThemeIcon color="gray" variant="light" size="xl">
              <IconApple size={32} />
            </ThemeIcon>
            <div style={{ textAlign: 'center' }}>
              <Text fw={600} size="lg">No hay datos de platos</Text>
              <Text size="sm" c="dimmed">
                Registra el seguimiento de algunas comidas para ver tus platos favoritos aquí
              </Text>
            </div>
          </Stack>
        </Card>
      ) : null}
    </>
  );
};

export default PlatosFavoritosGrid;
