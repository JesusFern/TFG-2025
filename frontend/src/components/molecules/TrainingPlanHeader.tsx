import React from 'react';
import { 
  Group, 
  Text, 
  Badge,
  Button
} from '@mantine/core';
import { 
  IconArrowLeft,
  IconHome,
  IconCalendarEvent
} from '@tabler/icons-react';
import TrainingBreadcrumbs from '../atoms/TrainingBreadcrumbs';
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
  const { navigateToClientPlans, getTrainingBreadcrumbs } = useNavigation();

  const breadcrumbs = getTrainingBreadcrumbs('ver').map(item => ({
    ...item,
    icon: item.title === 'Inicio' ? <IconHome size={14} /> : item.icon
  }));

  return (
    <>
      <TrainingBreadcrumbs items={breadcrumbs} />
      
      <Group justify="space-between" mb="xs" wrap="wrap">
        <Group gap="md" align="center">
          <Text size="xl" fw={700} c="nutroos-green.6">
            {plan.nombre}
          </Text>
          <Badge color="green" variant="filled" size="sm">
            Publicado
          </Badge>
        </Group>
        <Button
          variant="outline"
          color="nutroos-green"
          leftSection={<IconArrowLeft size={18} />}
          onClick={() => navigateToClientPlans(plan)}
        >
          Volver a planes del cliente
        </Button>
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
