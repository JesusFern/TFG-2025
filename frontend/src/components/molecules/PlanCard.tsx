import React from 'react';
import {
  Group,
  Badge,
  Stack,
  Text,
  Title
} from '@mantine/core';
import {
  IconCalendar,
  IconTarget,
  IconBarbell,
  IconArrowRight,
  IconClock
} from '@tabler/icons-react';
import { PlanEntrenamiento } from '../../types/training';
import { formatDate } from '../../utils/trainingUtils';
import { useThemeDetection } from '../../hooks/useThemeDetection';
import { useMantineTheme } from '@mantine/core';
import InteractiveCard from '../atoms/InteractiveCard';
import StatusBadge from '../atoms/StatusBadge';

interface PlanCardProps {
  plan: PlanEntrenamiento;
  onClick: (planId: string) => void;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, onClick }) => {
  const isDark = useThemeDetection();
  const theme = useMantineTheme();

  const handleClick = () => {
    if (plan._id) {
      onClick(plan._id);
    }
  };

  const isActive = plan.draftMode === false;

  return (
    <InteractiveCard
      isActive={isActive}
      variant="plan"
      onClick={handleClick}
    >
      <Stack gap="md">
        {/* Header con estado */}
        <Group justify="space-between" align="flex-start">
          <StatusBadge isActive={isActive} />
        </Group>

        {/* Título y descripción */}
        <div>
          <Title order={4} mb="xs" fw={600} c={isDark ? "gray.0" : "gray.9"}>
            {plan.nombre}
          </Title>
          {plan.descripcion && (
            <Text 
              size="sm" 
              c={isDark ? "gray.2" : "gray.7"} 
              lineClamp={2}
              fw={400}
            >
              {plan.descripcion}
            </Text>
          )}
        </div>

        {/* Objetivo */}
        <Group gap="xs">
          <IconTarget 
            size={16}
            stroke={1.5}
            color={isDark ? theme.colors.blue[3] : theme.colors.blue[6]}
          />
          <Badge 
            color={isDark ? "blue.5" : "blue.6"}
            variant="light"
            size="sm"
            radius="sm"
            fw={500}
          >
            {plan.objetivo}
          </Badge>
        </Group>

        {/* Detalles del plan */}
        <Stack gap="xs">
          <Group gap="xs">
            <IconCalendar 
              size={14} 
              stroke={1.5}
              color={isDark ? theme.colors.blue[3] : theme.colors.blue[6]} 
            />
            <Text size="xs" c={isDark ? "gray.2" : "gray.7"} fw={500}>
              Inicio: {formatDate(plan.fechaInicio)}
            </Text>
          </Group>
          
          <Group gap="xs">
            <IconClock 
              size={14} 
              stroke={1.5}
              color={isDark ? theme.colors.cyan[3] : theme.colors.cyan[6]} 
            />
            <Text size="xs" c={isDark ? "gray.2" : "gray.7"} fw={500}>
              Duración: {plan.duracionDias} días
            </Text>
          </Group>
          
          <Group gap="xs">
            <IconBarbell 
              size={14} 
              stroke={1.5}
              color={isDark ? theme.colors.teal[3] : theme.colors.teal[6]} 
            />
            <Text size="xs" c={isDark ? "gray.2" : "gray.7"} fw={500}>
              {plan.sesionesPorSemana} sesiones/semana
            </Text>
          </Group>
        </Stack>

        {/* Botón de acción */}
        <Group justify="space-between" align="center" mt="sm">
          <Text 
            size="xs" 
            c={isDark ? "gray.2" : "gray.6"} 
            fw={500}
            style={{ opacity: 0.9 }}
          >
            Haz clic para ver detalles
          </Text>
          <IconArrowRight 
            size={16} 
            color={isDark ? theme.colors["nutroos-green"][3] : theme.colors["nutroos-green"][6]}
            stroke={1.5}
          />
        </Group>
      </Stack>
    </InteractiveCard>
  );
};

export default PlanCard;
