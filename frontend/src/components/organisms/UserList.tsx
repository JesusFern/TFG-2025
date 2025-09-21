import React from 'react';
import { Stack, Card, Group, Text, Badge, Avatar, Button, Box, Pagination } from '@mantine/core';
import { IconCalendar, IconUser, IconCrown } from '@tabler/icons-react';

interface User {
  _id: string;
  fullName: string;
  email: string;
  gender?: string;
  birthDate?: string;
  role: string;
  suscripcion?: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

interface UserPlans {
  [userId: string]: { nombre: string; tipoPrecio: string; tipoPlan: string | null };
}

interface UserListProps {
  users: User[];
  pagination: PaginationInfo | null;
  userPlans: UserPlans;
  onPageChange: (page: number) => void;
  onViewUser: (userId: string) => void;
  formatDate: (dateString: string) => string;
  calculateAge: (birthDate: string) => number;
  renderUserInfo?: (user: User, userPlan: UserPlans[string] | undefined) => React.ReactNode;
  emptyMessage?: string;
}

const UserList: React.FC<UserListProps> = ({
  users,
  pagination,
  userPlans,
  onPageChange,
  onViewUser,
  formatDate,
  calculateAge,
  renderUserInfo,
  emptyMessage = "No hay usuarios registrados"
}) => {
  if (users.length === 0) {
    return (
      <Stack align="center" gap="md">
        <IconUser size={48} color="var(--mantine-color-gray-4)" />
        <Text c="dimmed" size="lg">
          {emptyMessage}
        </Text>
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      {users.map((user) => (
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

            <Group justify="space-between" align="center" style={{ width: '100%' }}>
              <Group gap="md" align="center" style={{ flexWrap: 'wrap' }}>
                <Group gap="xs">
                  <IconCalendar size={16} color="var(--mantine-color-gray-6)" />
                  <Text size="sm">
                    {user.birthDate ? `${calculateAge(user.birthDate)} años` : 'N/A'}
                  </Text>
                </Group>
                
                <Group gap="xs">
                  <IconUser size={16} color="var(--mantine-color-gray-6)" />
                  <Text size="sm">
                    {user.gender || 'N/A'}
                  </Text>
                </Group>
                
                {renderUserInfo ? renderUserInfo(user, userPlans[user._id]) : (
                  <Group gap="xs">
                    <IconCrown size={16} color="var(--mantine-color-gray-6)" />
                    <Badge 
                      color={user.suscripcion ? 'green' : 'gray'} 
                      variant="light" 
                      size="sm"
                    >
                      {user.suscripcion ? (userPlans[user._id]?.nombre || 'Plan Activo') : 'Sin suscripción'}
                    </Badge>
                  </Group>
                )}

                <Text size="xs" c="dimmed">
                  Registrado: {formatDate(user.createdAt)}
                </Text>
              </Group>

              <Button
                size="sm"
                variant="light"
                color="nutroos-green"
                onClick={() => onViewUser(user._id)}
              >
                Ver Detalles
              </Button>
            </Group>
          </Group>
        </Card>
      ))}

      {pagination && pagination.totalPages > 1 && (
        <Group justify="center" mt="lg">
          <Pagination
            value={pagination.currentPage}
            onChange={onPageChange}
            total={pagination.totalPages}
            color="nutroos-green"
            size="sm"
          />
        </Group>
      )}
    </Stack>
  );
};

export default UserList;
