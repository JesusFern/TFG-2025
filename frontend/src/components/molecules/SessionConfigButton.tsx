import React from 'react';
import { Button, Group, Text } from '@mantine/core';
import { IconBarbell } from '@tabler/icons-react';
import { PlanEntrenamiento, SesionPlan } from '../../types/training';

interface SessionConfigButtonProps {
  sesionInfo: {
    weekDayIndex: number;
    sesionIndex: number;
    weekDayName: string;
    fecha: Date;
    fechaFormateada: string;
    data: SesionPlan | null;
  };
  plan: PlanEntrenamiento;
  onConfigurarSesion: (sesionInfo: {
    weekDayIndex: number;
    sesionIndex: number;
    weekDayName: string;
    fecha: Date;
    fechaFormateada: string;
    data: SesionPlan | null;
  }) => void;
}

const SessionConfigButton: React.FC<SessionConfigButtonProps> = ({
  sesionInfo,
  plan,
  onConfigurarSesion
}) => {
  const isDiaEntrenamiento = plan.diasSemana.includes(sesionInfo.fecha.getDay());
  const hasSesion = sesionInfo.data;

  if (!isDiaEntrenamiento) {
    return (
      <Text size="xs" c="dimmed" ta="center" py="md">
        Día de descanso
      </Text>
    );
  }

  if (!hasSesion) {
    return (
      <Button
        size="xs"
        variant="light"
        color="nutroos-green"
        leftSection={<IconBarbell size={14} />}
        onClick={() => onConfigurarSesion(sesionInfo)}
        fullWidth
      >
        Configurar sesión
      </Button>
    );
  }

  return (
    <Group gap="xs" mb="xs">
      <IconBarbell size={16} color="var(--mantine-color-nutroos-green-6)" />
      <Text fw={600} size="sm" c="nutroos-green">
        {sesionInfo.data?.tipoEntrenamiento}
      </Text>
    </Group>
  );
};

export default SessionConfigButton;
