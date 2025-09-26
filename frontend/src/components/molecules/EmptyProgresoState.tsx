import React from 'react';
import { 
  Paper, 
  Stack, 
  Text, 
  Title, 
  Group, 
  ThemeIcon,
  Button,
  Alert
} from '@mantine/core';
import { 
  IconBarbell, 
  IconTarget, 
  IconCalendar,
  IconInfoCircle,
  IconArrowRight
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

interface EmptyProgresoStateProps {
  onRetry?: () => void;
}

const EmptyProgresoState: React.FC<EmptyProgresoStateProps> = ({ onRetry }) => {
  const navigate = useNavigate();

  return (
    <Paper p="xl" radius="lg" withBorder>
      <Stack gap="lg" align="center">
        <ThemeIcon size={80} radius="xl" variant="light" color="blue">
          <IconBarbell size={40} />
        </ThemeIcon>

        <Stack gap="xs" align="center">
          <Title order={3} c="gray.7">
            ¡Comienza tu viaje de entrenamiento!
          </Title>
          <Text c="dimmed" ta="center" size="lg">
            Aún no tienes datos de entrenamiento registrados.
          </Text>
        </Stack>

        <Alert 
          icon={<IconInfoCircle size={16} />}
          title="¿Cómo empezar?"
          color="blue"
          variant="light"
          w="100%"
        >
          <Stack gap="xs">
            <Text size="sm">
              Para ver tu progreso semanal, necesitas seguir estos pasos:
            </Text>
            
            <Group gap="md" mt="sm">
              <ThemeIcon color="green" variant="light" size="sm">
                <IconCalendar size={16} />
              </ThemeIcon>
              <Text size="sm" flex={1}>
                <strong>1.</strong> Tener un plan de entrenamiento asignado por tu entrenador
              </Text>
            </Group>
            
            <Group gap="md">
              <ThemeIcon color="blue" variant="light" size="sm">
                <IconBarbell size={16} />
              </ThemeIcon>
              <Text size="sm" flex={1}>
                <strong>2.</strong> Completar al menos una sesión de entrenamiento
              </Text>
            </Group>
            
            <Group gap="md">
              <ThemeIcon color="orange" variant="light" size="sm">
                <IconTarget size={16} />
              </ThemeIcon>
              <Text size="sm" flex={1}>
                <strong>3.</strong> Registrar el progreso de tus ejercicios en cada sesión
              </Text>
            </Group>
          </Stack>
        </Alert>

        <Group gap="md" mt="md">
          <Button
            variant="filled"
            color="nutroos-green"
            rightSection={<IconArrowRight size={16} />}
            onClick={() => navigate('/mis-entrenamientos')}
          >
            Ver Mis Entrenamientos
          </Button>
          
          {onRetry && (
            <Button
              variant="light"
              onClick={onRetry}
            >
              Reintentar
            </Button>
          )}
        </Group>

        <Text size="xs" c="dimmed" ta="center">
          Una vez que completes algunas sesiones, aquí podrás ver tu progreso detallado.
        </Text>
      </Stack>
    </Paper>
  );
};

export default EmptyProgresoState;
