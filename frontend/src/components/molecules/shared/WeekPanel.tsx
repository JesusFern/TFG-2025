import React from 'react';
import { Paper, Group, Text, Button, ThemeIcon, useMantineColorScheme } from '@mantine/core';
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
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  // Función para obtener el rango de fechas de una semana ISO
  const getWeekDateRange = (week: number, year: number) => {
    // Calcular el lunes de la semana ISO
    const jan4 = new Date(year, 0, 4); // 4 de enero siempre está en la semana 1
    const jan4Day = jan4.getDay() || 7; // Convertir domingo (0) a 7
    const mondayOfWeek1 = new Date(jan4);
    mondayOfWeek1.setDate(jan4.getDate() - jan4Day + 1);
    
    // Calcular el lunes de la semana solicitada
    const mondayOfWeek = new Date(mondayOfWeek1);
    mondayOfWeek.setDate(mondayOfWeek1.getDate() + (week - 1) * 7);
    
    // Calcular el domingo de la semana
    const sundayOfWeek = new Date(mondayOfWeek);
    sundayOfWeek.setDate(mondayOfWeek.getDate() + 6);
    
    return {
      lunes: mondayOfWeek,
      domingo: sundayOfWeek
    };
  };

  const weekRange = getWeekDateRange(semanaSeleccionada, añoSeleccionado);
  const formatDate = (date: Date) => date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <Paper p="md" radius="md" withBorder>
      <Group justify="space-between" align="center">
        <Group gap="md">
          <ThemeIcon color={color} variant="light" size="lg">
            <IconCalendar size={20} />
          </ThemeIcon>
          <div>
            <Text size="lg" fw={600} c={isDark ? 'white' : 'dark'}>
              {formatDate(weekRange.lunes)} - {formatDate(weekRange.domingo)}
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
