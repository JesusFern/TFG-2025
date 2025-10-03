import React from 'react';
import { 
  Group, 
  Text, 
  Badge,
  Button,
  Alert
} from '@mantine/core';
import { 
  IconHome,
  IconCheck,
  IconAlertCircle
} from '@tabler/icons-react';
import TrainingBreadcrumbs from '../atoms/TrainingBreadcrumbs';
import { useNavigation } from '../../hooks/useNavigation';
import type { PlanEntrenamiento } from '../../types/training';

interface EditarPlanHeaderProps {
  plan: PlanEntrenamiento;
  publishLoading: boolean;
  onPublish: () => void;
}

const EditarPlanHeader: React.FC<EditarPlanHeaderProps> = ({ 
  plan, 
  publishLoading,
  onPublish
}) => {
  const { getTrainingBreadcrumbs } = useNavigation();

  const breadcrumbs = getTrainingBreadcrumbs('editar').map(item => ({
    ...item,
    icon: item.title === 'Inicio' ? <IconHome size={14} /> : item.icon
  }));

  return (
    <>
      <TrainingBreadcrumbs items={breadcrumbs} />
      
      <Group justify="space-between" mb="md" wrap="wrap">
        <Group gap="md" align="center">
          <Text size="xl" fw={700} c="nutroos-green.6">
            {plan.nombre}
          </Text>
          {!plan.draftMode && (
            <Badge color="green" variant="filled" size="sm">
              Publicado
            </Badge>
          )}
        </Group>
        
        {plan.draftMode && (
          <Button
            color="green"
            leftSection={<IconCheck size={18} />}
            onClick={onPublish}
            loading={publishLoading}
            size="md"
          >
            Publicar entrenamiento
          </Button>
        )}
      </Group>
      
      {!plan.draftMode && (
        <Alert 
          icon={<IconAlertCircle size={18} />} 
          title="Plan publicado" 
          color="blue" 
          mb="md"
        >
          Este plan de entrenamiento ha sido publicado. Puedes editarlo, pero las sesiones pasadas no se pueden modificar.
        </Alert>
      )}
    </>
  );
};

export default EditarPlanHeader;
