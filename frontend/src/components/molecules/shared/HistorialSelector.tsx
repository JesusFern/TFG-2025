import React from 'react';
import { Paper, Text, Group, Select, Button } from '@mantine/core';
import { IconCalendar } from '@tabler/icons-react';

interface HistorialSelectorProps {
  semanaSeleccionada: number;
  añoSeleccionado: number;
  onSemanaChange: (semana: number) => void;
  onAñoChange: (año: number) => void;
  onVolverActual: () => void;
  getCurrentWeekNumber: () => number;
}

const HistorialSelector: React.FC<HistorialSelectorProps> = ({
  semanaSeleccionada,
  añoSeleccionado,
  onSemanaChange,
  onAñoChange,
  onVolverActual,
  getCurrentWeekNumber
}) => {
  return (
    <Paper p="md" radius="md" withBorder>
      <Text size="md" fw={500} mb="md">Historial de Progreso</Text>
      <Group>
        <Select
          label="Semana"
          placeholder="Seleccionar semana"
          data={Array.from({ length: 52 }, (_, i) => ({
            value: (i + 1).toString(),
            label: `Semana ${i + 1}`
          }))}
          value={semanaSeleccionada.toString()}
          onChange={(value) => onSemanaChange(parseInt(value || '1'))}
          style={{ minWidth: 150 }}
        />
        <Select
          label="Año"
          placeholder="Seleccionar año"
          data={Array.from({ length: 3 }, (_, i) => {
            const año = new Date().getFullYear() - i;
            return {
              value: año.toString(),
              label: año.toString()
            };
          })}
          value={añoSeleccionado.toString()}
          onChange={(value) => onAñoChange(parseInt(value || new Date().getFullYear().toString()))}
          style={{ minWidth: 120 }}
        />
        <Button 
          variant="outline" 
          leftSection={<IconCalendar size={16} />}
          onClick={onVolverActual}
          style={{ marginTop: 25 }}
        >
          Volver a Actual
        </Button>
      </Group>
    </Paper>
  );
};

export default HistorialSelector;
