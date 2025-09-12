import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Group, 
  Text, 
  Badge,
  Button,
  Breadcrumbs,
  Anchor,
  Alert
} from '@mantine/core';
import { 
  IconChevronRight,
  IconHome,
  IconCheck,
  IconAlertCircle
} from '@tabler/icons-react';
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
  const breadcrumbItems = [
    { title: 'Inicio', href: '/', icon: <IconHome size={14} /> },
    { title: 'Entrenamiento', href: '/training/planes' },
    { title: 'Editar plan', href: '#' },
  ].map((item, index) => (
    <Anchor component={Link} to={item.href} key={index} size="sm" c="nutroos-green">
      {item.icon && (
        <Group gap={4}>
          {item.icon}
          <span>{item.title}</span>
        </Group>
      )}
      {!item.icon && item.title}
    </Anchor>
  ));

  return (
    <>
      <Breadcrumbs separator={<IconChevronRight size={14} />}>{breadcrumbItems}</Breadcrumbs>
      
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
          color="green" 
          mb="md"
        >
          Este plan está publicado y no se puede editar. Los clientes pueden verlo en su panel.
        </Alert>
      )}
    </>
  );
};

export default EditarPlanHeader;
