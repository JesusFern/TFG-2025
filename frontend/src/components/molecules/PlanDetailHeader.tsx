import React from 'react';
import {
  Group,
  Title,
  Text,
  Badge,
  Button,
  SimpleGrid
} from '@mantine/core';
import {
  IconArrowLeft,
  IconCheck,
  IconTarget,
  IconCalendar,
  IconClock,
  IconBarbell
} from '@tabler/icons-react';
import { PlanEntrenamiento } from '../../types/training';
import GradientPaper from '../atoms/GradientPaper';
import PlanInfoCard from './../atoms/PlanInfoCard';

interface PlanDetailHeaderProps {
  plan: PlanEntrenamiento;
  fechaInicioFormateada: string;
  onBackClick: () => void;
}

const PlanDetailHeader: React.FC<PlanDetailHeaderProps> = ({
  plan,
  fechaInicioFormateada,
  onBackClick
}) => {
  return (
    <GradientPaper variant="header">
      <Group justify="space-between" align="flex-start" mb="md">
        <Button
          variant="subtle"
          leftSection={<IconArrowLeft size={16} />}
          onClick={onBackClick}
          color="gray"
          size="sm"
        >
          Volver a mis entrenamientos
        </Button>
        
        <Badge
          size="lg"
          color="nutroos-green"
          variant="light"
          leftSection={<IconCheck size={16} />}
          fw={600}
        >
          Plan Activo
        </Badge>
      </Group>

      <Title order={2} mb="xs" c="nutroos-green.6">
        {plan.nombre}
      </Title>
      
      {plan.descripcion && (
        <Text c="dimmed" size="lg" mb="md">
          {plan.descripcion}
        </Text>
      )}

      {/* Información del plan */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
        <PlanInfoCard
          icon={<IconTarget size={20} color="#228be6" />}
          title="Objetivo"
          value={plan.objetivo}
        />
        
        <PlanInfoCard
          icon={<IconCalendar size={20} color="#15aabf" />}
          title="Fecha de Inicio"
          value={fechaInicioFormateada}
        />
        
        <PlanInfoCard
          icon={<IconClock size={20} color="#12b886" />}
          title="Duración"
          value={`${plan.duracionDias} días`}
        />
        
        <PlanInfoCard
          icon={<IconBarbell size={20} color="#9775fa" />}
          title="Sesiones/Semana"
          value={plan.sesionesPorSemana.toString()}
        />
      </SimpleGrid>
    </GradientPaper>
  );
};

export default PlanDetailHeader;
