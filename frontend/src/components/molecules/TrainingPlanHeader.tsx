import React from 'react';
import { 
  Group, 
  Text, 
  Badge,
  Button
} from '@mantine/core';
import { 
  IconArrowLeft,
  IconCalendarEvent,
  IconEdit
} from '@tabler/icons-react';
import { useNavigation } from '../../hooks/useNavigation';
import type { PlanEntrenamiento } from '../../types/training';

interface TrainingPlanHeaderProps {
  plan: PlanEntrenamiento;
  fechaInicioFormateada: string;
}

const TrainingPlanHeader: React.FC<TrainingPlanHeaderProps> = ({ 
  plan, 
  fechaInicioFormateada 
}) => {
  const { navigateToClientPlans, navigateToPlanEdit } = useNavigation();


  return (
    <>
      
      <Group justify="space-between" mb="xs" wrap="wrap">
        <Group gap="md" align="center">
          <Text size="xl" fw={700} c="nutroos-green.6">
            {plan.nombre}
          </Text>
          <Badge color="green" variant="filled" size="sm">
            Publicado
          </Badge>
        </Group>
        <Group gap="sm">
          <Button
            variant="outline"
            color="nutroos-green"
            leftSection={<IconArrowLeft size={18} />}
            onClick={() => navigateToClientPlans(plan)}
          >
            Volver a planes del cliente
          </Button>
          <Button
            variant="filled"
            color="nutroos-green"
            leftSection={<IconEdit size={18} />}
            onClick={() => plan._id && navigateToPlanEdit(plan._id)}
            disabled={!plan._id}
          >
            Editar plan
          </Button>
        </Group>
      </Group>
      
      <Text size="sm" c="dimmed" mb="md">
        {plan.descripcion || "Sin descripción"}
      </Text>
      
      <Group gap="xs" mb="md">
        <IconCalendarEvent size={18} color="var(--mantine-color-gray-6)" />
        <Text size="sm" c="dimmed">
          {plan.duracionDias} días | {plan.sesionesPorSemana} sesiones/semana | Objetivo: {plan.objetivo} | Inicio: {fechaInicioFormateada}
        </Text>
      </Group>
    </>
  );
};

export default TrainingPlanHeader;
