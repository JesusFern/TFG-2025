import React from 'react';
import {
  Card,
  Center,
  Stack,
  Text,
  ThemeIcon
} from '@mantine/core';
import { IconUser } from '@tabler/icons-react';

interface EmptyProfessionalsStateProps {
  hasFilters: boolean;
}

const EmptyProfessionalsState: React.FC<EmptyProfessionalsStateProps> = ({ hasFilters }) => {
  return (
    <Card withBorder p="xl">
      <Center>
        <Stack align="center" gap="md">
          <ThemeIcon size={60} variant="light" color="gray">
            <IconUser size={30} />
          </ThemeIcon>
          <Text size="lg" fw={500}>
            No se encontraron profesionales
          </Text>
          <Text c="dimmed" ta="center">
            {hasFilters 
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'No hay profesionales disponibles en este momento'
            }
          </Text>
        </Stack>
      </Center>
    </Card>
  );
};

export default EmptyProfessionalsState;
