import React from 'react';
import {
  Paper,
  Stack,
  Group,
  Text,
  Badge,
  Progress,
  Divider
} from '@mantine/core';
import { 
  IconStar, 
  IconCheck, 
  IconTrendingUp,
  IconTrendingDown,
  IconMinus
} from '@tabler/icons-react';
import { useMantineColorScheme } from '@mantine/core';
import { SeguimientoPlato } from '../../services/seguimientoComidaService';

interface ResumenSeguimientoDiaProps {
  seguimientos: { [key: string]: SeguimientoPlato }; // Cambio: key será "comidaIndex-platoIndex"
  totalPlatos: number;
}

const ResumenSeguimientoDia: React.FC<ResumenSeguimientoDiaProps> = ({
  seguimientos,
  totalPlatos
}) => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  // Calcular estadísticas
  const platosConSeguimiento = Object.values(seguimientos).filter(
    s => s.satisfaccion || s.cumplimiento || s.notaUsuario
  ).length;

  const satisfaccionPromedio = Object.values(seguimientos)
    .filter(s => s.satisfaccion)
    .reduce((acc, s) => acc + (s.satisfaccion || 0), 0) / 
    Object.values(seguimientos).filter(s => s.satisfaccion).length || 0;

  const cumplimientoPromedio = Object.values(seguimientos)
    .filter(s => s.cumplimiento)
    .reduce((acc, s) => acc + (s.cumplimiento || 0), 0) / 
    Object.values(seguimientos).filter(s => s.cumplimiento).length || 0;

  const porcentajeSeguimiento = totalPlatos > 0 ? (platosConSeguimiento / totalPlatos) * 100 : 0;

  if (platosConSeguimiento === 0) {
    return null;
  }

  const getTendenciaIcon = (valor: number) => {
    if (valor >= 4) return <IconTrendingUp size={16} color={isDark ? "#51cf66" : "#2f9e44"} />;
    if (valor <= 2) return <IconTrendingDown size={16} color={isDark ? "#ff6b6b" : "#e03131"} />;
    return <IconMinus size={16} color={isDark ? "#ffd43b" : "#fab005"} />;
  };

  const getTendenciaColor = (valor: number) => {
    if (valor >= 4) return "green";
    if (valor <= 2) return "red";
    return "yellow";
  };

  return (
    <Paper p="md" withBorder bg={isDark ? "dark.6" : "gray.0"}>
      <Stack gap="sm">
        <Group justify="space-between" align="center">
          <Text fw={600} size="sm" c={isDark ? "gray.1" : "gray.8"}>
            Resumen de seguimiento del día
          </Text>
          <Badge color="nutroos-green" variant="light">
            {platosConSeguimiento}/{totalPlatos} platos
          </Badge>
        </Group>

        <Divider size="xs" />

        <Group gap="lg" wrap="wrap">
          {/* Satisfacción promedio */}
          {satisfaccionPromedio > 0 && (
            <Group gap="xs" align="center">
              <IconStar size={16} color={isDark ? "#ffd43b" : "#fab005"} />
              <Text size="xs" c="dimmed">Satisfacción:</Text>
              <Badge 
                size="sm" 
                color={getTendenciaColor(satisfaccionPromedio)} 
                variant="light"
                leftSection={getTendenciaIcon(satisfaccionPromedio)}
              >
                {satisfaccionPromedio.toFixed(1)}/5
              </Badge>
            </Group>
          )}

          {/* Cumplimiento promedio */}
          {cumplimientoPromedio > 0 && (
            <Group gap="xs" align="center">
              <IconCheck size={16} color={isDark ? "#51cf66" : "#2f9e44"} />
              <Text size="xs" c="dimmed">Cumplimiento:</Text>
              <Badge 
                size="sm" 
                color={getTendenciaColor(cumplimientoPromedio)} 
                variant="light"
                leftSection={getTendenciaIcon(cumplimientoPromedio)}
              >
                {cumplimientoPromedio.toFixed(1)}/5
              </Badge>
            </Group>
          )}
        </Group>

        {/* Barra de progreso */}
        <Stack gap="xs">
          <Group justify="space-between" align="center">
            <Text size="xs" c="dimmed">Progreso de seguimiento</Text>
            <Text size="xs" fw={600} c={isDark ? "gray.2" : "gray.7"}>
              {porcentajeSeguimiento.toFixed(0)}%
            </Text>
          </Group>
          <Progress
            value={porcentajeSeguimiento}
            color="nutroos-green"
            size="sm"
            radius="md"
          />
        </Stack>
      </Stack>
    </Paper>
  );
};

export default ResumenSeguimientoDia;
