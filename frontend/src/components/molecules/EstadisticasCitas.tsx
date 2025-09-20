import React from 'react';
import {
  Card,
  Group,
  Text,
  Stack,
  SimpleGrid,
  Progress,
  RingProgress,
  Center,
  ThemeIcon,
  Title,
  Badge
} from '@mantine/core';
import { useThemeDetection } from '../../hooks/useThemeDetection';
import { EstadisticasCitas as EstadisticasCitasType } from '../../types/citas';
import {
  IconCalendar,
  IconClock,
  IconCheck,
  IconX,
  IconTrendingUp,
  IconStethoscope,
  IconFileText,
  IconBarbell,
  IconClipboardCheck,
  IconSearch
} from '@tabler/icons-react';

interface EstadisticasCitasProps {
  estadisticas: EstadisticasCitasType;
}

const EstadisticasCitas: React.FC<EstadisticasCitasProps> = ({
  estadisticas
}) => {
  const isDark = useThemeDetection();

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'seguimiento':
        return <IconTrendingUp size={20} />;
      case 'consulta_nutricion':
        return <IconStethoscope size={20} />;
      case 'consulta_entrenamiento':
        return <IconBarbell size={20} />;
      case 'evaluacion':
        return <IconClipboardCheck size={20} />;
      case 'revision':
        return <IconSearch size={20} />;
      default:
        return <IconFileText size={20} />;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'seguimiento':
        return 'blue';
      case 'consulta_nutricion':
        return 'green';
      case 'consulta_entrenamiento':
        return 'orange';
      case 'evaluacion':
        return 'purple';
      case 'revision':
        return 'teal';
      default:
        return 'gray';
    }
  };

  const getTipoLabel = (tipo: string) => {
    return tipo.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const porcentajeCompletadas = estadisticas.totalCitas > 0 
    ? Math.round((estadisticas.citasCompletadas / estadisticas.totalCitas) * 100)
    : 0;

  const porcentajeCanceladas = estadisticas.totalCitas > 0 
    ? Math.round((estadisticas.citasCanceladas / estadisticas.totalCitas) * 100)
    : 0;

  const porcentajeConfirmadas = estadisticas.totalCitas > 0 
    ? Math.round((estadisticas.citasConfirmadas / estadisticas.totalCitas) * 100)
    : 0;

  return (
        <Stack gap="lg">
      <Title order={3} c={isDark ? 'white' : 'dark'}>
        Estadísticas de Citas
      </Title>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
        {/* Total de citas */}
        <Card withBorder p="md" bg={isDark ? 'dark.6' : 'white'}>
          <Group>
            <ThemeIcon size="lg" color="blue" variant="light">
              <IconCalendar size={24} />
            </ThemeIcon>
            <div>
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                Total Citas
              </Text>
              <Text fw={700} size="xl" c={isDark ? 'white' : 'dark'}>
                {estadisticas.totalCitas}
              </Text>
            </div>
          </Group>
        </Card>

        {/* Citas completadas */}
        <Card withBorder p="md" bg={isDark ? 'dark.6' : 'white'}>
          <Group>
            <ThemeIcon size="lg" color="green" variant="light">
              <IconCheck size={24} />
            </ThemeIcon>
            <div>
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                Completadas
              </Text>
              <Text fw={700} size="xl" c={isDark ? 'white' : 'dark'}>
                {estadisticas.citasCompletadas}
              </Text>
            </div>
          </Group>
        </Card>

        {/* Citas pendientes */}
        <Card withBorder p="md" bg={isDark ? 'dark.6' : 'white'}>
          <Group>
            <ThemeIcon size="lg" color="yellow" variant="light">
              <IconClock size={24} />
            </ThemeIcon>
            <div>
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                Pendientes
              </Text>
              <Text fw={700} size="xl" c={isDark ? 'white' : 'dark'}>
                {estadisticas.citasPendientes}
              </Text>
            </div>
          </Group>
        </Card>

        {/* Citas canceladas */}
        <Card withBorder p="md" bg={isDark ? 'dark.6' : 'white'}>
          <Group>
            <ThemeIcon size="lg" color="red" variant="light">
              <IconX size={24} />
            </ThemeIcon>
            <div>
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                Canceladas
              </Text>
              <Text fw={700} size="xl" c={isDark ? 'white' : 'dark'}>
                {estadisticas.citasCanceladas}
              </Text>
            </div>
          </Group>
        </Card>
      </SimpleGrid>

      {/* Gráfico circular de progreso */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <Card withBorder p="md" bg={isDark ? 'dark.6' : 'white'}>
          <Stack gap="md">
            <Text size="lg" fw={600} c={isDark ? 'white' : 'dark'}>
              Distribución de Estados
            </Text>
            <Center>
              <RingProgress
                size={160}
                thickness={16}
                sections={[
                  { value: porcentajeCompletadas, color: 'green', tooltip: `Completadas: ${estadisticas.citasCompletadas}` },
                  { value: porcentajeConfirmadas, color: 'blue', tooltip: `Confirmadas: ${estadisticas.citasConfirmadas}` },
                  { value: porcentajeCanceladas, color: 'red', tooltip: `Canceladas: ${estadisticas.citasCanceladas}` },
                  { 
                    value: 100 - porcentajeCompletadas - porcentajeConfirmadas - porcentajeCanceladas, 
                    color: 'yellow', 
                    tooltip: `Pendientes: ${estadisticas.citasPendientes}` 
                  }
                ]}
                label={
                  <Text ta="center" size="xs" c="dimmed">
                    Total: {estadisticas.totalCitas}
                  </Text>
                }
              />
            </Center>
            <Group justify="center" gap="lg">
              <Group gap="xs">
                <div style={{ width: 12, height: 12, backgroundColor: 'var(--mantine-color-green-6)', borderRadius: 6 }} />
                <Text size="xs" c="dimmed">Completadas</Text>
              </Group>
              <Group gap="xs">
                <div style={{ width: 12, height: 12, backgroundColor: 'var(--mantine-color-blue-6)', borderRadius: 6 }} />
                <Text size="xs" c="dimmed">Confirmadas</Text>
              </Group>
              <Group gap="xs">
                <div style={{ width: 12, height: 12, backgroundColor: 'var(--mantine-color-yellow-6)', borderRadius: 6 }} />
                <Text size="xs" c="dimmed">Pendientes</Text>
              </Group>
              <Group gap="xs">
                <div style={{ width: 12, height: 12, backgroundColor: 'var(--mantine-color-red-6)', borderRadius: 6 }} />
                <Text size="xs" c="dimmed">Canceladas</Text>
              </Group>
            </Group>
          </Stack>
        </Card>

        {/* Citas por tipo */}
        <Card withBorder p="md" bg={isDark ? 'dark.6' : 'white'}>
          <Stack gap="md">
            <Text size="lg" fw={600} c={isDark ? 'white' : 'dark'}>
              Citas por Tipo
            </Text>
            <Stack gap="sm">
              {Object.entries(estadisticas.citasPorTipo).map(([tipo, cantidad]) => (
                <div key={tipo}>
                  <Group justify="space-between" mb="xs">
                    <Group gap="xs">
                      <ThemeIcon size="sm" color={getTipoColor(tipo)} variant="light">
                        {getTipoIcon(tipo)}
                      </ThemeIcon>
                      <Text size="sm" fw={500} c={isDark ? 'white' : 'dark'}>
                        {getTipoLabel(tipo)}
                      </Text>
                    </Group>
                    <Badge color={getTipoColor(tipo)} variant="light">
                      {cantidad}
                    </Badge>
                  </Group>
                  <Progress
                    value={(cantidad / estadisticas.totalCitas) * 100}
                    color={getTipoColor(tipo)}
                    size="sm"
                    radius="xl"
                  />
                </div>
              ))}
            </Stack>
          </Stack>
        </Card>
      </SimpleGrid>

      {/* Citas por mes */}
      <Card withBorder p="md" bg={isDark ? 'dark.6' : 'white'}>
        <Stack gap="md">
          <Text size="lg" fw={600} c={isDark ? 'white' : 'dark'}>
            Citas por Mes (Últimos 12 meses)
          </Text>
          <SimpleGrid cols={{ base: 2, sm: 3, md: 6 }} spacing="md">
            {estadisticas.citasPorMes.map((mes, index) => (
              <Card key={index} withBorder p="sm" bg={isDark ? 'dark.5' : 'gray.0'}>
                <Stack gap="xs" align="center">
                  <Text size="xs" c="dimmed" ta="center">
                    {mes.mes}
                  </Text>
                  <Text size="lg" fw={700} c={isDark ? 'white' : 'dark'}>
                    {mes.cantidad}
                  </Text>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        </Stack>
      </Card>
    </Stack>
  );
};

export default EstadisticasCitas;
