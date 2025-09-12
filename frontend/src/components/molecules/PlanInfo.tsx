import React from 'react';
import { Group, Text } from '@mantine/core';
import { IconCalendarEvent } from '@tabler/icons-react';
import type { PlanEntrenamiento } from '../../types/training';

interface PlanInfoProps {
  plan: PlanEntrenamiento;
  fechaInicioFormateada: string;
  isDark: boolean;
}

const PlanInfo: React.FC<PlanInfoProps> = ({ 
  plan, 
  fechaInicioFormateada,
  isDark
}) => {
  return (
    <Group gap="xs" mb="md">
      <IconCalendarEvent size={18} color={isDark ? 'var(--mantine-color-gray-4)' : 'var(--mantine-color-gray-6)'} />
      <Text size="sm" c="dimmed">
        {plan.duracionDias} días | {plan.sesionesPorSemana} sesiones/semana | Objetivo: {plan.objetivo} | Inicio: {fechaInicioFormateada}
      </Text>
    </Group>
  );
};

export default PlanInfo;
