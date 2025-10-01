import React from 'react';
import { 
  Card, 
  Stack, 
  Text, 
  Button, 
  ThemeIcon,
  Group
} from '@mantine/core';
import { 
  IconApple, 
  IconPlus, 
  IconRefresh 
} from '@tabler/icons-react';

interface EmptyProgresoNutricionalStateProps {
  onRetry: () => void;
  onCrearDieta?: () => void;
}

const EmptyProgresoNutricionalState: React.FC<EmptyProgresoNutricionalStateProps> = ({ 
  onRetry, 
  onCrearDieta 
}) => {
  return (
    <Card shadow="sm" padding="xl" radius="md">
      <Stack align="center" gap="md">
        <ThemeIcon color="gray" variant="light" size="xl">
          <IconApple size={32} />
        </ThemeIcon>
        
        <div style={{ textAlign: 'center' }}>
          <Text fw={600} size="lg" mb="xs">
            No hay datos nutricionales
          </Text>
          <Text size="sm" c="dimmed" mb="md">
            Aún no tienes dietas asignadas o no has registrado el seguimiento de tus comidas.
            <br />
            ¡Comienza a seguir tu progreso nutricional!
          </Text>
        </div>

        <Group gap="sm">
          <Button 
            variant="light" 
            leftSection={<IconRefresh size={16} />}
            onClick={onRetry}
          >
            Actualizar
          </Button>
          
          {onCrearDieta && (
            <Button 
              color="nutroos-green"
              leftSection={<IconPlus size={16} />}
              onClick={onCrearDieta}
            >
              Ver Dietas
            </Button>
          )}
        </Group>
      </Stack>
    </Card>
  );
};

export default EmptyProgresoNutricionalState;
