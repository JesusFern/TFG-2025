import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Group, 
  Text, 
  Badge,
  Button,
  Breadcrumbs,
  Anchor
} from '@mantine/core';
import { 
  IconChevronRight,
  IconArrowLeft,
  IconHome,
  IconCalendarEvent
} from '@tabler/icons-react';
import type { PlanEntrenamiento } from '../../types/training';

interface TrainingPlanHeaderProps {
  plan: PlanEntrenamiento;
  fechaInicioFormateada: string;
}

const TrainingPlanHeader: React.FC<TrainingPlanHeaderProps> = ({ 
  plan, 
  fechaInicioFormateada 
}) => {
  const navigate = useNavigate();

  const breadcrumbItems = [
    { title: 'Inicio', href: '/', icon: <IconHome size={14} /> },
    { title: 'Entrenamiento', href: '/training/planes' },
    { title: 'Ver plan', href: '#' },
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

  const handleBackToClientPlans = () => {
    try {
      let clientId = null;
      
      if (plan && plan.clientes && Array.isArray(plan.clientes) && plan.clientes.length > 0) {
        const clientData = plan.clientes[0];
        
        if (typeof clientData === 'string') {
          clientId = clientData;
        } 
        else if (typeof clientData === 'object' && clientData !== null) {
          type ClientObject = { _id?: string; id?: string; };
          const clientObj = clientData as unknown as ClientObject;
          
          if (clientObj._id) {
            clientId = clientObj._id;
          } else if (clientObj.id) {
            clientId = clientObj.id;
          } else {
            clientId = String(clientData);
          }
        }
        else if (clientData) {
          clientId = String(clientData);
        }
      }
      
      if (clientId) {
        navigate(`/worker/dashboard-clients/${clientId}/training`);
      } else {
        navigate(-1);
      }
    } catch {
      navigate(-1);
    }
  };

  return (
    <>
      <Breadcrumbs separator={<IconChevronRight size={14} />}>{breadcrumbItems}</Breadcrumbs>
      
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
          onClick={handleBackToClientPlans}
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
