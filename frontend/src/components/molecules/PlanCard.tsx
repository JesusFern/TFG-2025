import React from 'react';
import {
  Card,
  Group,
  Badge,
  Stack,
  Text,
  Title
} from '@mantine/core';
import {
  IconCheck,
  IconClock,
  IconCalendar,
  IconTarget,
  IconBarbell,
  IconArrowRight
} from '@tabler/icons-react';
import { PlanEntrenamiento } from '../../types/training';
import { formatDate } from '../../utils/trainingUtils';
import { useThemeDetection } from '../../hooks/useThemeDetection';
import { useMantineTheme } from '@mantine/core';

interface PlanCardProps {
  plan: PlanEntrenamiento;
  onClick: (planId: string) => void;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, onClick }) => {
  const isDark = useThemeDetection();
  const theme = useMantineTheme();

  return (
    <Card
      withBorder
      shadow="md"
      p="lg"
      radius="md"
      bg={isDark ? theme.colors.dark[7] : 'white'}
      c={isDark ? theme.colors.gray[0] : theme.colors.gray[9]}
      style={{
        borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3],
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        borderLeftWidth: 4,
        borderLeftStyle: 'solid',
        borderLeftColor: plan.draftMode === false ? 
          (isDark ? theme.colors["nutroos-green"][5] : theme.colors["nutroos-green"][6]) : 
          (isDark ? theme.colors.dark[3] : theme.colors.gray[4]),
        overflow: 'hidden',
        boxShadow: isDark ? '0 4px 8px rgba(0, 0, 0, 0.4)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
      }}
      onClick={() => onClick(plan._id!)}
      onMouseOver={e => {
        e.currentTarget.style.boxShadow = isDark ? '0 8px 16px rgba(0, 0, 0, 0.6)' : theme.shadows.xl;
        e.currentTarget.style.transform = 'translateY(-2px)';
        if (plan.draftMode === false) {
          e.currentTarget.style.borderLeftColor = isDark 
            ? theme.colors["nutroos-green"][4]
            : theme.colors["nutroos-green"][5];
        }
      }}
      onMouseOut={e => {
        e.currentTarget.style.boxShadow = isDark ? '0 4px 8px rgba(0, 0, 0, 0.4)' : theme.shadows.md;
        e.currentTarget.style.transform = 'translateY(0)';
        if (plan.draftMode === false) {
          e.currentTarget.style.borderLeftColor = isDark 
            ? theme.colors["nutroos-green"][5]
            : theme.colors["nutroos-green"][6];
        }
      }}
    >
      <Stack gap="md">
        {/* Header con estado */}
        <Group justify="space-between" align="flex-start">
          <Badge
            size="sm"
            color={plan.draftMode === false ? 'nutroos-green' : (isDark ? 'gray.6' : 'gray')}
            variant={plan.draftMode === false ? 'filled' : (isDark ? 'light' : 'outline')}
            leftSection={
              plan.draftMode === false 
                ? <IconCheck size={14} stroke={1.5} /> 
                : <IconClock size={14} stroke={1.5} />
            }
            fw={600}
            tt="uppercase"
          >
            {plan.draftMode === false ? 'Activo' : 'Borrador'}
          </Badge>
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
    </Card>
  );
};

export default PlanCard;
