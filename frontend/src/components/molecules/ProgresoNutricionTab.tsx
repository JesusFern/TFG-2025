import React from 'react';
import { 
  Alert, 
  Text, 
  Stack, 
  ThemeIcon,
  Group
} from '@mantine/core';
import { 
  IconApple, 
  IconClock, 
  IconInfoCircle 
} from '@tabler/icons-react';

const ProgresoNutricionTab: React.FC = () => {
  return (
    <Stack gap="md">
      <Alert
        icon={<IconInfoCircle size={16} />}
        title="Próximamente"
        color="blue"
        variant="light"
      >
        La funcionalidad de seguimiento nutricional estará disponible próximamente.
        Aquí podrás ver tu progreso en:
      </Alert>

      <Stack gap="sm" pl="md">
        <Group>
          <ThemeIcon color="green" variant="light" size="sm">
            <IconApple size={14} />
          </ThemeIcon>
          <Text size="sm">Seguimiento de calorías diarias</Text>
        </Group>
        
        <Group>
          <ThemeIcon color="blue" variant="light" size="sm">
            <IconApple size={14} />
          </ThemeIcon>
          <Text size="sm">Progreso de macronutrientes</Text>
        </Group>
        
        <Group>
          <ThemeIcon color="orange" variant="light" size="sm">
            <IconApple size={14} />
          </ThemeIcon>
          <Text size="sm">Hidratación y agua consumida</Text>
        </Group>
        
        <Group>
          <ThemeIcon color="purple" variant="light" size="sm">
            <IconClock size={14} />
          </ThemeIcon>
          <Text size="sm">Horarios de comidas</Text>
        </Group>
        
        <Group>
          <ThemeIcon color="red" variant="light" size="sm">
            <IconApple size={14} />
          </ThemeIcon>
          <Text size="sm">Objetivos nutricionales semanales</Text>
        </Group>
      </Stack>

      <Alert
        icon={<IconClock size={16} />}
        title="En desarrollo"
        color="yellow"
        variant="light"
      >
        Estamos trabajando en integrar el sistema de seguimiento nutricional 
        con el módulo de dietas existente para ofrecerte una experiencia completa.
      </Alert>
    </Stack>
  );
};

export default ProgresoNutricionTab;
