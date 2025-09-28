import React from 'react';
import { Paper, Group, Text, Button, ThemeIcon } from '@mantine/core';
import { IconCalendar, IconTarget, IconRefresh } from '@tabler/icons-react';

interface WeekPanelProps {
  semanaSeleccionada: number;
  añoSeleccionado: number;
  isCurrentWeek: boolean;
  onRefresh: () => void;
  onToggleHistorial: () => void;
  mostrarHistorial: boolean;
  color?: string;
}

const WeekPanel: React.FC<WeekPanelProps> = ({
  semanaSeleccionada,
  añoSeleccionado,
  isCurrentWeek,
  onRefresh,
  onToggleHistorial,
  mostrarHistorial,
  color = 'green'
}) => {
  return (
    <Paper p="md" radius="md" withBorder style={{ backgroundColor: '#f8f9fa' }}>
      <Group justify="space-between" align="center">
        <Group gap="md">
          <ThemeIcon color={color} variant="light" size="lg">
            <IconCalendar size={20} />
          </ThemeIcon>
          <div>
            <Text size="lg" fw={600}>
              Semana {semanaSeleccionada} de {añoSeleccionado}
            </Text>
            <Text size="sm" c="dimmed">
              {isCurrentWeek ? "Semana actual" : "Semana histórica"}
            </Text>
          </div>
        </Group>
        
        <Group gap="sm">
          <Button 
            variant="light" 
            leftSection={<IconRefresh size={16} />}
            onClick={onRefresh}
            size="sm"
          >
            Actualizar
          </Button>
          <Button 
            variant="outline" 
            leftSection={<IconTarget size={16} />}
            onClick={onToggleHistorial}
            size="sm"
          >
            {mostrarHistorial ? 'Ocultar Historial' : 'Ver Historial'}
          </Button>
        </Group>
      </Group>
    </Paper>
  );
};

export default WeekPanel;
