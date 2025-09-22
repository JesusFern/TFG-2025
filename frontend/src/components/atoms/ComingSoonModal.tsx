import React from 'react';
import {
  Modal,
  Stack,
  Text,
  Title,
  Group,
  Button,
  ThemeIcon,
  Alert
} from '@mantine/core';
import { IconClock, IconInfoCircle } from '@tabler/icons-react';

interface ComingSoonModalProps {
  opened: boolean;
  onClose: () => void;
  title: string;
  description?: string;
}

/**
 * Modal que se muestra cuando el usuario intenta acceder a una funcionalidad no implementada
 */
export const ComingSoonModal: React.FC<ComingSoonModalProps> = ({
  opened,
  onClose,
  title,
  description = 'Esta funcionalidad estará disponible en una próxima actualización.'
}) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm">
          <ThemeIcon color="orange" variant="light" size="lg">
            <IconClock size={20} />
          </ThemeIcon>
          <Title order={3}>Próximamente</Title>
        </Group>
      }
      centered
      size="md"
    >
      <Stack gap="md">
        <Alert
          icon={<IconInfoCircle size={16} />}
          title={title}
          color="blue"
          variant="light"
        >
          {description}
        </Alert>
        
        <Text size="sm" c="dimmed">
          Estamos trabajando para traerte las mejores funcionalidades. 
          ¡Mantente atento a las actualizaciones!
        </Text>
        
        <Group justify="flex-end" mt="md">
          <Button onClick={onClose} color="blue">
            Entendido
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
