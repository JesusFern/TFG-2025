import React from 'react';
import { 
  Group, 
  Text, 
  Badge,
  Button,
  Alert
} from '@mantine/core';
import { 
  IconCheck,
  IconAlertCircle,
  IconArrowLeft
} from '@tabler/icons-react';
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

  const { navigateToClientPlans } = useNavigation();
  
  return (
    <>
      
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
        
        <Group gap="sm">
          <Button
            variant="outline"
            color="nutroos-green"
            leftSection={<IconArrowLeft size={18} />}
            onClick={() => navigateToClientPlans(plan)}
            size="sm"
          >
            Volver a planes del cliente
          </Button>
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
