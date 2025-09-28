import React from 'react';
import {
  Paper,
  Stack,
  Group,
  Text,
  Badge,
  Rating
} from '@mantine/core';
import { 
  IconStar, 
  IconCheck, 
  IconMessage
} from '@tabler/icons-react';
import { useMantineColorScheme } from '@mantine/core';
import { SeguimientoPlato } from '../../services/seguimientoComidaService';

interface SeguimientoPlatoDisplayProps {
  seguimiento: SeguimientoPlato;
  nombrePlato: string;
  soloLectura?: boolean;
}

const SeguimientoPlatoDisplay: React.FC<SeguimientoPlatoDisplayProps> = ({
  seguimiento
}) => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  const tieneSeguimiento = seguimiento.satisfaccion || seguimiento.cumplimiento || seguimiento.notaUsuario;

  if (!tieneSeguimiento) {
    return null;
  }

  return (
    <Paper p="sm" withBorder bg={isDark ? "dark.6" : "gray.0"}>
      <Stack gap="xs">
        <Text fw={600} size="sm" c={isDark ? "gray.1" : "gray.8"}>
          Seguimiento registrado
        </Text>

        <Group gap="md" wrap="wrap">
          {/* Satisfacción */}
          {seguimiento.satisfaccion && (
            <Group gap="xs" align="center">
              <IconStar size={16} color={isDark ? "#ffd43b" : "#fab005"} />
              <Text size="xs" c="dimmed">Satisfacción:</Text>
              <Rating
                value={seguimiento.satisfaccion}
                readOnly
                size="sm"
                count={5}
                color="yellow"
              />
              <Badge size="xs" color="yellow" variant="light">
                {seguimiento.satisfaccion}/5
              </Badge>
            </Group>
          )}

          {/* Cumplimiento */}
          {seguimiento.cumplimiento && (
            <Group gap="xs" align="center">
              <IconCheck size={16} color={isDark ? "#51cf66" : "#2f9e44"} />
              <Text size="xs" c="dimmed">Cumplimiento:</Text>
              <Rating
                value={seguimiento.cumplimiento}
                readOnly
                size="sm"
                count={5}
                color="green"
              />
              <Badge size="xs" color="green" variant="light">
                {seguimiento.cumplimiento}/5
              </Badge>
            </Group>
          )}
        </Group>

        {/* Nota del usuario */}
        {seguimiento.notaUsuario && (
          <Group gap="xs" align="flex-start">
            <IconMessage size={16} color={isDark ? "#74c0fc" : "#1971c2"} />
            <Stack gap="xs" style={{ flex: 1 }}>
              <Text size="xs" c="dimmed">Nota personal:</Text>
              <Text size="sm" c={isDark ? "gray.2" : "gray.7"} style={{ fontStyle: 'italic' }}>
                "{seguimiento.notaUsuario}"
              </Text>
            </Stack>
          </Group>
        )}
      </Stack>
    </Paper>
  );
};

export default SeguimientoPlatoDisplay;
