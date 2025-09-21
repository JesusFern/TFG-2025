import React from 'react';
import { Card, Group, Text, Avatar, Box } from '@mantine/core';

interface UserCardProps {
  user: {
    _id: string;
    fullName: string;
    email: string;
  };
  children?: React.ReactNode;
}

/**
 * Componente reutilizable para mostrar la información básica de un usuario
 * Incluye avatar, nombre y email
 */
const UserCard: React.FC<UserCardProps> = ({ user, children }) => {
  return (
    <Card key={user._id} shadow="sm" padding="md" radius="md" withBorder>
      <Group justify="space-between" align="center">
        <Group gap="md">
          <Avatar size="md" radius="xl" color="nutroos-green">
            {user.fullName.charAt(0).toUpperCase()}
          </Avatar>
          
          <Box>
            <Text fw={500} size="md">
              {user.fullName}
            </Text>
            <Text size="sm" c="dimmed">
              {user.email}
            </Text>
          </Box>
        </Group>

        {children}
      </Group>
    </Card>
  );
};

export default UserCard;
