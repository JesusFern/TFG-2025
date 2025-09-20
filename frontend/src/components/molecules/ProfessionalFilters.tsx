import React from 'react';
import {
  Card,
  Group,
  Stack,
  Text,
  Select,
  TextInput
} from '@mantine/core';
import { 
  IconSearch, 
  IconFilter
} from '@tabler/icons-react';

interface ProfessionalFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedType: string | null;
  onTypeChange: (value: string | null) => void;
  workerTypes: string[];
  totalCount: number;
  filteredCount: number;
}

const ProfessionalFilters: React.FC<ProfessionalFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedType,
  onTypeChange,
  workerTypes,
  totalCount,
  filteredCount
}) => {
  return (
    <Card withBorder p="md">
      <Stack gap="md">
        <Group justify="space-between" align="flex-end">
          <TextInput
            placeholder="Buscar por nombre, especialidad o biografía..."
            leftSection={<IconSearch size={16} />}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ flex: 1 }}
          />
          <Select
            placeholder="Filtrar por especialidad"
            data={workerTypes}
            value={selectedType}
            onChange={onTypeChange}
            clearable
            leftSection={<IconFilter size={16} />}
            style={{ minWidth: 200 }}
          />
        </Group>
        
        <Group gap="xs">
          <Text size="sm" c="dimmed">
            Mostrando {filteredCount} de {totalCount} profesionales
          </Text>
        </Group>
      </Stack>
    </Card>
  );
};

export default ProfessionalFilters;
