import React from 'react';
import { Paper, Group, Text, Button, Grid, TextInput, Select } from '@mantine/core';
import { IconFilter, IconSearch } from '@tabler/icons-react';

interface FilterConfig {
  search?: boolean;
  gender?: boolean;
  sorting?: boolean;
  customFilters?: React.ReactNode;
}

interface FiltersInfo {
  search: string;
  gender: string;
  [key: string]: string;
}

interface UserFiltersProps {
  filters: FiltersInfo;
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
  onApplyFilters?: () => void;
  config: FilterConfig;
  title?: string;
  sortBy?: string;
  sortOrder?: string;
  onSortChange?: (sortBy: string, sortOrder: string) => void;
  showApplyButton?: boolean;
}

const UserFilters: React.FC<UserFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  onApplyFilters,
  config,
  title = "Filtros",
  sortBy,
  sortOrder,
  onSortChange,
  showApplyButton = false
}) => {
  return (
    <Paper shadow="sm" p="md" radius="md" mb="md">
      <Group justify="space-between" mb="md">
        <Group gap="xs">
          <IconFilter size={20} color="var(--mantine-color-nutroos-green-6)" />
          <Text fw={500} c="nutroos-green.7">{title}</Text>
        </Group>
        <Button
          variant="light"
          size="xs"
          color="gray"
          onClick={onClearFilters}
        >
          Limpiar Filtros
        </Button>
      </Group>

      <Grid>
        {config.search && (
          <Grid.Col span={{ base: 12, sm: 6, md: 3, lg: 3 }}>
            <TextInput
              label="Buscar por nombre o email"
              placeholder="Buscar..."
              leftSection={<IconSearch size={16} />}
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && showApplyButton && onApplyFilters) {
                  onApplyFilters();
                }
              }}
            />
          </Grid.Col>
        )}

        {config.gender && (
          <Grid.Col span={{ base: 12, sm: 6, md: 3, lg: 3 }}>
            <Select
              label="Género"
              placeholder="Seleccionar género"
              value={filters.gender}
              onChange={(value) => onFilterChange('gender', value || '')}
              data={[
                { value: '', label: 'Todos los géneros' },
                { value: 'Masculino', label: 'Masculino' },
                { value: 'Femenino', label: 'Femenino' },
                { value: 'Otro', label: 'Otro' }
              ]}
            />
          </Grid.Col>
        )}


        {config.customFilters}
      </Grid>
      
      {config.sorting && onSortChange && (
        <Grid mt="md">
          <Grid.Col span={{ base: 6, sm: 6, md: 4, lg: 2.4 }}>
            <Select
              label="Ordenar por"
              placeholder="Seleccionar campo"
              value={sortBy}
              onChange={(value) => onSortChange(value || 'createdAt', sortOrder || 'desc')}
              data={[
                { value: 'createdAt', label: 'Fecha de registro' },
                { value: 'satisfactionRating', label: 'Satisfacción' }
              ]}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 6, sm: 6, md: 4, lg: 2.4 }}>
            <Select
              label="Orden"
              placeholder="Seleccionar orden"
              value={sortOrder}
              onChange={(value) => onSortChange(sortBy || 'createdAt', value || 'desc')}
              data={[
                { value: 'desc', label: 'Descendente' },
                { value: 'asc', label: 'Ascendente' }
              ]}
            />
          </Grid.Col>
          {showApplyButton && onApplyFilters && (
            <Grid.Col span={{ base: 12, sm: 12, md: 4, lg: 2.4 }}>
              <Group align="end" h="100%">
                <Button
                  color="nutroos-green"
                  onClick={onApplyFilters}
                  leftSection={<IconFilter size={16} />}
                  fullWidth
                >
                  Aplicar Filtros
                </Button>
              </Group>
            </Grid.Col>
          )}
        </Grid>
      )}
    </Paper>
  );
};

export default UserFilters;
