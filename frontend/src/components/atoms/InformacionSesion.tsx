import { Paper, Group, ThemeIcon, Text } from '@mantine/core';
import { IconCalendar } from '@tabler/icons-react';

interface InformacionSesionProps {
  fecha: string | Date;
  completada?: boolean;
}

export const InformacionSesion = ({ 
  fecha, 
  completada 
}: InformacionSesionProps) => {
  return (
    <Paper p="md" withBorder>
      <Group gap="md" mb="md">
        <ThemeIcon size="lg" radius="md" color="orange">
          <IconCalendar size={20} />
        </ThemeIcon>
        <Text size="lg" fw={600}>Información de la Sesión</Text>
      </Group>
      
      <Text size="sm" c="dimmed" mb="sm">
        Fecha: {new Date(fecha).toLocaleDateString('es-ES', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </Text>
      {completada !== undefined && (
        <Text size="sm" c={completada ? 'green' : 'red'}>
          Estado: {completada ? 'Completada' : 'No completada'}
        </Text>
      )}
    </Paper>
  );
};

export default InformacionSesion;
