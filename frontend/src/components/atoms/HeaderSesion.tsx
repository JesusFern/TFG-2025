import { Paper, Group, ThemeIcon, Text } from '@mantine/core';
import { IconClock } from '@tabler/icons-react';
import EstadoBadge from './EstadoBadge';

interface HeaderSesionProps {
  tipoEntrenamiento: string;
  fecha: string | Date;
  completada: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const HeaderSesion = ({ 
  tipoEntrenamiento, 
  fecha, 
  completada, 
  size = 'lg' 
}: HeaderSesionProps) => {
  return (
    <Paper p={size === 'lg' ? 'lg' : 'md'} withBorder>
      <Group justify="space-between" mb={size === 'lg' ? 'lg' : 'md'}>
        <Group gap={size === 'lg' ? 'lg' : 'md'} align="flex-start">
          <ThemeIcon 
            size={size === 'lg' ? 'xl' : 'lg'} 
            radius="md" 
            color="blue" 
            variant="light"
            mt={size === 'lg' ? 'xs' : undefined}
          >
            <IconClock size={size === 'lg' ? 24 : 20} />
          </ThemeIcon>
          <div>
            <Text size={size === 'lg' ? 'xl' : 'lg'} fw={600} mb="xs">
              {tipoEntrenamiento}
            </Text>
            <Text size="md" c="dimmed" mb="xs">
              {new Date(fecha).toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </div>
        </Group>
        <EstadoBadge completado={completada} size={size === 'lg' ? 'lg' : 'sm'} />
      </Group>
    </Paper>
  );
};

export default HeaderSesion;
