import React from 'react';
import { Avatar, Group, Stack, Text, Badge, ActionIcon, useMantineTheme } from '@mantine/core';
import { IconEdit, IconCamera } from '@tabler/icons-react';
import { UserProfile } from '../../types/profile';
import { useWorkerRating } from '../../hooks/useWorkerRating';

interface ProfileHeaderProps {
  profile: UserProfile;
  onEditProfile: () => void;
  onEditPhoto: () => void;
  canEdit?: boolean;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
  profile, 
  onEditProfile, 
  onEditPhoto,
  canEdit = true
}) => {
  const theme = useMantineTheme();
  
  // Hook para obtener la calificación en tiempo real si es un trabajador
  const { satisfactionRating } = useWorkerRating({
    workerId: profile._id,
    enabled: profile.role === 'worker'
  });
  
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'red';
      case 'worker':
        return 'nutroos-green';
      case 'user':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'worker':
        return 'Trabajador';
      case 'user':
        return 'Usuario';
      default:
        return role;
    }
  };

  return (
    <Group gap="xl" align="flex-start">
      <Stack align="center" gap="sm">
        <div style={{ position: 'relative' }}>
          <Avatar
            src={profile.profilePicture}
            size={120}
            radius="xl"
            color={theme.colors['nutroos-green'][6]}
            style={{ border: `4px solid ${theme.colors['nutroos-green'][3]}` }}
          >
            {profile.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
          </Avatar>
          <ActionIcon
            size="lg"
            variant="filled"
            color="nutroos-green"
            radius="xl"
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              border: `2px solid ${theme.white}`,
            }}
            onClick={onEditPhoto}
          >
            <IconCamera size={16} />
          </ActionIcon>
        </div>
      </Stack>

      <Stack gap="xs" style={{ flex: 1 }}>
        <Group justify="space-between" align="flex-start">
          <Stack gap="xs">
            <Text size="2rem" fw={700} c={theme.colors.gray[8]}>
              {profile.fullName}
            </Text>
            <Group gap="xs">
              <Badge 
                color={getRoleBadgeColor(profile.role)}
                variant="light"
                size="lg"
              >
                {getRoleLabel(profile.role)}
              </Badge>
              {profile.workerType && (
                <Badge 
                  color="nutroos-green"
                  variant="outline"
                  size="lg"
                >
                  {profile.workerType}
                </Badge>
              )}
            </Group>
          </Stack>
          
          {canEdit && (
            <ActionIcon
              size="lg"
              variant="light"
              color="nutroos-green"
              radius="md"
              onClick={onEditProfile}
            >
              <IconEdit size={20} />
            </ActionIcon>
          )}
        </Group>

        <Text size="lg" c={theme.colors.gray[6]}>
          {profile.email}
        </Text>
        
        {profile.phoneNumber && (
          <Text size="lg" c={theme.colors.gray[6]}>
            {profile.phoneNumber}
          </Text>
        )}

        {profile.biography && (
          <Text size="md" c={theme.colors.gray[7]} style={{ maxWidth: 500 }}>
            {profile.biography}
          </Text>
        )}

        {profile.availability && (
          <Text size="sm" c={theme.colors.gray[6]}>
            <strong>Disponibilidad:</strong> {profile.availability}
          </Text>
        )}

        {profile.role === 'worker' && (
          <Group gap="xs">
            <Text size="sm" c={theme.colors.gray[6]}>
              <strong>Valoración:</strong>
            </Text>
            <Group gap={4}>
              {(() => {
                // Usar la calificación en tiempo real para trabajadores
                const rating = satisfactionRating;
                
                return rating && rating > 0 ? (
                  <>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Text
                        key={star}
                        size="sm"
                        c={star <= rating ? 'yellow' : theme.colors.gray[4]}
                      >
                        ★
                      </Text>
                    ))}
                    <Text size="sm" c="yellow" fw={500}>
                      ({rating.toFixed(1)})
                    </Text>
                  </>
                ) : (
                  <Text size="sm" c={theme.colors.gray[5]}>
                    Sin calificar
                  </Text>
                );
              })()}
            </Group>
          </Group>
        )}
      </Stack>
    </Group>
  );
};
