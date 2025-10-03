import React from 'react';
import {
  Card,
  Text,
  Group,
  Stack,
  Progress,
  RingProgress,
  Grid,
  Box,
  Badge,
  useMantineColorScheme,
  ThemeIcon
} from '@mantine/core';
import { 
  IconStar, 
  IconChefHat,
  IconBarbell,
  IconChartBar
} from '@tabler/icons-react';
import { EstadisticasValoraciones, EstadisticasValoracionesPorTipo } from '../../types/valoraciones';

interface ValoracionStatsProps {
  estadisticas: EstadisticasValoraciones;
  estadisticasPorTipo?: EstadisticasValoracionesPorTipo[];
  compact?: boolean;
}

const ValoracionStats: React.FC<ValoracionStatsProps> = ({
  estadisticas,
  estadisticasPorTipo = [],
  compact = false
}) => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  const getTipoTrabajadorIcon = (tipo: string) => {
    return tipo === 'Nutricionista' ? IconChefHat : IconBarbell;
  };

  const getTipoTrabajadorColor = (tipo: string) => {
    return tipo === 'Nutricionista' ? 'green' : 'blue';
  };

  const getCalificacionColor = (calificacion: number) => {
    if (calificacion >= 4.5) return 'green';
    if (calificacion >= 3.5) return 'yellow';
    if (calificacion >= 2.5) return 'orange';
    return 'red';
  };

  if (compact) {
    return (
      <Card shadow="sm" padding="md" radius="md" withBorder>
        <Group justify="space-between" align="center">
          <Group gap="sm">
            <ThemeIcon color="blue" variant="light" size="lg">
              <IconStar size={20} />
            </ThemeIcon>
            <Box>
              <Text size="lg" fw={600}>
                {estadisticas.calificacionPromedio?.toFixed(1) || '0.0'}
              </Text>
              <Text size="sm" c="dimmed">
                de {estadisticas?.totalValoraciones || 0} valoraciones
              </Text>
            </Box>
          </Group>
          
          <Badge
            color={getCalificacionColor(estadisticas?.calificacionPromedio)}
            variant="light"
            size="lg"
          >
            {estadisticas.calificacionPromedio?.toFixed(1) || '0.0'}/5
          </Badge>
        </Group>
      </Card>
    );
  }

  return (
    <Stack gap="md">
      {/* Resumen general */}
      <Card shadow="sm" padding="md" radius="md" withBorder>
        <Group justify="space-between" align="center">
          {/* Calificación promedio con gráfico circular */}
          <Group gap="md">
            <RingProgress
              size={100}
              thickness={10}
              sections={[
                { 
                  value: ((estadisticas?.calificacionPromedio || 0) / 5) * 100, 
                  color: getCalificacionColor(estadisticas?.calificacionPromedio)
                }
              ]}
              label={
                      <Text size="lg" fw={700} ta="center" c="blue">
                        {estadisticas.calificacionPromedio?.toFixed(1) || '0.0'}
                      </Text>
              }
            />
            <Box>
              <Text size="lg" fw={600} c="blue">
                Calificación Promedio
              </Text>
              <Text size="sm" c="dimmed">
                Basado en {estadisticas?.totalValoraciones || 0} valoraciones
              </Text>
            </Box>
          </Group>

          {/* Estadísticas adicionales */}
          <Group gap="xl">
            <Box style={{ textAlign: 'center' }}>
              <Text size="2xl" fw={700} c="green">
                {estadisticas?.totalValoraciones || 0}
              </Text>
              <Text size="sm" c="dimmed">
                Total Valoraciones
              </Text>
            </Box>
            
            <Box style={{ textAlign: 'center' }}>
              <Text size="2xl" fw={700} c="orange">
                {estadisticas?.calificacionPromedio ? 
                  (estadisticas.calificacionPromedio >= 4 ? 'Excelente' : 
                   estadisticas.calificacionPromedio >= 3 ? 'Bueno' : 
                   estadisticas.calificacionPromedio >= 2 ? 'Regular' : 'Necesita mejorar') 
                  : 'Sin calificar'
                }
              </Text>
              <Text size="sm" c="dimmed">
                Evaluación General
              </Text>
            </Box>
          </Group>
        </Group>
      </Card>

      {/* Distribución de calificaciones */}
      <Card shadow="sm" padding="md" radius="md" withBorder>
        <Text size="md" fw={600} mb="md">
          Distribución de Calificaciones
        </Text>
        <Stack gap="sm">
          {Array.isArray(estadisticas?.distribucionCalificaciones) ? estadisticas.distribucionCalificaciones.map((dist) => (
            <Box key={dist.calificacion}>
              <Group justify="space-between" mb="xs">
                <Group gap="xs">
                  <Text size="sm" fw={500}>
                    {dist.calificacion} estrella{dist.calificacion !== 1 ? 's' : ''}
                  </Text>
                  <Badge size="sm" variant="light">
                    {dist.cantidad}
                  </Badge>
                </Group>
                <Text size="sm" c="dimmed">
                  {dist.porcentaje?.toFixed(1) || '0.0'}%
                </Text>
              </Group>
              <Progress
                value={dist.porcentaje}
                color={getCalificacionColor(dist.calificacion)}
                size="sm"
                radius="md"
              />
            </Box>
          )) : (
            <Text size="sm" c="dimmed" ta="center" py="md">
              No hay datos de distribución disponibles
            </Text>
          )}
        </Stack>
      </Card>

      {/* Estadísticas por tipo de trabajador */}
      {estadisticasPorTipo.length > 0 && (
        <Card shadow="sm" padding="md" radius="md" withBorder>
          <Text size="md" fw={600} mb="md">
            Por Tipo de Trabajador
          </Text>
          <Grid>
            {estadisticasPorTipo.map((tipo) => {
              const TipoIcon = getTipoTrabajadorIcon(tipo.tipo);
              return (
                <Grid.Col span={6} key={tipo.tipo}>
                  <Box
                    p="md"
                    style={{
                      backgroundColor: isDark ? '#2c2e33' : '#f8f9fa',
                      borderRadius: '8px',
                      border: `1px solid ${isDark ? '#373a40' : '#e9ecef'}`
                    }}
                  >
                    <Group gap="sm" mb="sm">
                      <ThemeIcon 
                        color={getTipoTrabajadorColor(tipo.tipo)} 
                        variant="light" 
                        size="md"
                      >
                        <TipoIcon size={16} />
                      </ThemeIcon>
                      <Text size="sm" fw={600}>
                        {tipo.tipo}
                      </Text>
                    </Group>
                    
                    <Stack gap="xs">
                      <Group justify="space-between">
                        <Text size="xs" c="dimmed">Promedio</Text>
                        <Text size="sm" fw={500}>
                          {tipo.calificacionPromedio?.toFixed(1) || '0.0'}/5
                        </Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="xs" c="dimmed">Total</Text>
                        <Text size="sm" fw={500}>
                          {tipo.totalValoraciones}
                        </Text>
                      </Group>
                    </Stack>
                  </Box>
                </Grid.Col>
              );
            })}
          </Grid>
        </Card>
      )}

      {/* Tendencia mensual */}
      {(estadisticas?.tendenciaMensual || []).length > 0 && (
        <Card shadow="sm" padding="md" radius="md" withBorder>
          <Group gap="sm" mb="md">
            <ThemeIcon color="blue" variant="light" size="md">
              <IconChartBar size={16} />
            </ThemeIcon>
            <Text size="md" fw={600}>
              Tendencia Mensual
            </Text>
          </Group>
          
          <Stack gap="sm">
            {(estadisticas?.tendenciaMensual || []).slice(-6).map((mes) => (
              <Group justify="space-between" key={mes.mes}>
                <Text size="sm">{mes.mes}</Text>
                <Group gap="md">
                  <Text size="sm" c="dimmed">
                    {mes.cantidad} valoraciones
                  </Text>
                  <Badge size="sm" variant="light">
                    {mes.promedio?.toFixed(1) || '0.0'}/5
                  </Badge>
                </Group>
              </Group>
            ))}
          </Stack>
        </Card>
      )}
    </Stack>
  );
};

export default ValoracionStats;
