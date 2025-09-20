import React from 'react';
import {
  Card,
  Avatar,
  Group,
  Badge,
  Stack,
  Text,
  Box,
  ThemeIcon
} from '@mantine/core';
import { 
  IconUser, 
  IconCheck,
  IconX,
  IconUsers,
  IconStethoscope,
  IconBarbell
} from '@tabler/icons-react';
import { ProfessionalResponse } from '../../services/userService';

interface ProfessionalCardProps {
  professional: ProfessionalResponse;
  onClick: (professional: ProfessionalResponse) => void;
}

const ProfessionalCard: React.FC<ProfessionalCardProps> = ({ professional, onClick }) => {
  const getWorkerTypeIcon = (workerType: string) => {
    switch (workerType) {
      case 'Nutricionista':
        return <IconStethoscope size={20} />;
      case 'Entrenador personal':
        return <IconBarbell size={20} />;
      case 'Nutricionista y Entrenador personal':
        return <IconUsers size={20} />;
      default:
        return <IconUser size={20} />;
    }
  };

  const getWorkerTypeColor = (workerType: string) => {
    switch (workerType) {
      case 'Nutricionista':
        return 'green';
      case 'Entrenador personal':
        return 'blue';
      case 'Nutricionista y Entrenador personal':
        return 'violet';
      default:
        return 'gray';
    }
  };

  const getAvailabilityStatus = (professional: ProfessionalResponse) => {
    if (professional.isWorkerAvailable) {
      return (
        <Badge color="green" variant="light" leftSection={<IconCheck size={12} />}>
          Disponible
        </Badge>
      );
    }
    return (
      <Badge color="red" variant="light" leftSection={<IconX size={12} />}>
        No disponible
      </Badge>
    );
  };

  return (
    <Card 
      withBorder 
      p="md" 
      h="100%"
      style={{ cursor: 'pointer' }}
      onClick={() => onClick(professional)}
      className="hover-card"
    >
      <Stack gap="md" h="100%">
        {/* Avatar y nombre */}
        <Group gap="md">
          <Avatar
            src={professional.profilePicture}
            size="lg"
            radius="xl"
          >
            {professional.fullName.charAt(0).toUpperCase()}
          </Avatar>
          <Box style={{ flex: 1 }}>
            <Text fw={600} size="lg">
              {professional.fullName}
            </Text>
            <Group gap="xs" mt={4}>
              <ThemeIcon 
                size="sm" 
                variant="light" 
                color={getWorkerTypeColor(professional.workerType)}
              >
                {getWorkerTypeIcon(professional.workerType)}
              </ThemeIcon>
              <Text size="sm" c="dimmed">
                {professional.workerType}
              </Text>
            </Group>
          </Box>
        </Group>

        {/* Biografía */}
        {professional.biography && (
          <Text size="sm" lineClamp={3}>
            {professional.biography}
          </Text>
        )}

        {/* Disponibilidad */}
        <Box mt="auto">
          {getAvailabilityStatus(professional)}
        </Box>
      </Stack>
    </Card>
  );
};

export default ProfessionalCard;
