import React from 'react';
import { Button, Group, Text } from '@mantine/core';
import { IconCrown } from '@tabler/icons-react';

interface SubscriptionButtonProps {
  onClick: () => void;
  loading?: boolean;
}

const SubscriptionButton: React.FC<SubscriptionButtonProps> = ({ onClick, loading = false }) => {
  return (
    <Button
      color="nutroos-green"
      size="lg"
      leftSection={<IconCrown size={20} />}
      onClick={onClick}
      loading={loading}
      fullWidth
    >
      <Group gap="xs">
        <Text fw={600}>Ver profesionales disponibles para mi plan de suscripción</Text>
      </Group>
    </Button>
  );
};

export default SubscriptionButton;
