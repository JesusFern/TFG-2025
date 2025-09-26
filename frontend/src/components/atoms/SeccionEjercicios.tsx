import { Paper, Group, ThemeIcon, Text, ScrollArea } from '@mantine/core';
import { IconBarbell } from '@tabler/icons-react';
import TablaEjercicios from './TablaEjercicios';
import TablaEjerciciosConAcciones from './TablaEjerciciosConAcciones';
import EstadoVacioEjercicios from './EstadoVacioEjercicios';
import { RegistroEjercicioDetalle } from '../../types/estadisticas';

interface Ejercicio {
  id: string;
  nombre: string;
  series: number;
  repeticiones: number;
  peso: number;
  tiempoDescanso: number;
}

interface SeccionEjerciciosProps {
  ejercicios: Ejercicio[];
  registros?: RegistroEjercicioDetalle[];
  sesionId?: string;
  onRegistroClick?: (registro: RegistroEjercicioDetalle) => void;
  showAcciones?: boolean;
  descripcion?: string;
}

export const SeccionEjercicios = ({
  ejercicios,
  registros = [],
  sesionId = '',
  onRegistroClick,
  showAcciones = false,
  descripcion
}: SeccionEjerciciosProps) => {
  return (
    <Paper p="md" withBorder>
      <Group gap="md" mb="md">
        <ThemeIcon size="lg" radius="md" color="purple">
          <IconBarbell size={20} />
        </ThemeIcon>
        <div>
          <Text size="lg" fw={600}>Ejercicios de la Sesión</Text>
          {descripcion && (
            <Text size="sm" c="dimmed">
              {descripcion}
            </Text>
          )}
        </div>
      </Group>
      
      {ejercicios.length > 0 ? (
        <ScrollArea h={400}>
          {showAcciones && onRegistroClick ? (
            <TablaEjerciciosConAcciones
              ejercicios={ejercicios}
              registros={registros}
              sesionId={sesionId}
              onRegistroClick={onRegistroClick}
            />
          ) : (
            <TablaEjercicios ejercicios={ejercicios} />
          )}
        </ScrollArea>
      ) : (
        <EstadoVacioEjercicios />
      )}
    </Paper>
  );
};

export default SeccionEjercicios;
