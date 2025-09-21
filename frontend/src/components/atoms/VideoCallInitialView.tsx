import React from 'react';
import {
  Stack,
  Group,
  Button,
  Title,
  Text,
} from '@mantine/core';
import {
  IconPhone,
  IconPhoneOff,
} from '@tabler/icons-react';

interface VideoCallInitialViewProps {
  onStartCall: () => void;
  onCloseModal: () => void;
  title: string;
  subtitle: string;
  startButtonText?: string;
  cancelButtonText?: string;
}

export const VideoCallInitialView: React.FC<VideoCallInitialViewProps> = ({
  onStartCall,
  onCloseModal,
  title,
  subtitle,
  startButtonText = "Configurar Dispositivos",
  cancelButtonText = "Cancelar",
}) => {
  return (
    <Stack gap="xl" align="center">
      <Title order={3} ta="center">
        {title}
      </Title>
      <Text size="md" c="dimmed" ta="center" maw={400}>
        {subtitle}
      </Text>
      {/* Botones de acción */}
      <Group gap="md" mt="md">
        <Button
          size="lg"
          variant="filled"
          color="green"
          leftSection={<IconPhone size={20} />}
          onClick={onStartCall}
          radius="xl"
        >
          {startButtonText}
        </Button>
        
        <Button
          size="lg"
          variant="outline"
          color="red"
          leftSection={<IconPhoneOff size={20} />}
          onClick={onCloseModal}
          radius="xl"
        >
          {cancelButtonText}
        </Button>
      </Group>
    </Stack>
  );
};
