import React from 'react';
import { 
  Box, 
  Group, 
  Text, 
  Button, 
  Select
} from '@mantine/core';
import { 
  IconChevronLeft,
  IconChevronRight
} from '@tabler/icons-react';

interface WeekSelectorProps {
  currentWeek: number;
  totalWeeks: number;
  onWeekChange: (week: number) => void;
  isDark: boolean;
}

const WeekSelector: React.FC<WeekSelectorProps> = ({
  currentWeek,
  totalWeeks,
  onWeekChange,
  isDark
}) => {
  return (
    <Box 
      py="md" 
      px="lg" 
      style={{ 
        borderBottom: '2px solid var(--mantine-color-nutroos-green-4)',
        backgroundColor: isDark ? 'var(--mantine-color-nutroos-green-9)' : 'var(--mantine-color-nutroos-green-1)'
      }}
    >
      <Group justify="space-between" align="center">
        <Group gap="md">
          <Button 
            size="sm" 
            variant="subtle" 
            color="nutroos-green" 
            leftSection={<IconChevronLeft size={16} />} 
            disabled={currentWeek <= 1}
            onClick={() => onWeekChange(currentWeek - 1)}
          >
            Anterior
          </Button>
          <Select
            value={currentWeek.toString()}
            onChange={(value) => onWeekChange(Number(value))}
            data={Array.from({ length: totalWeeks }, (_, i) => ({
              value: (i + 1).toString(),
              label: `Semana ${i + 1}`
            }))}
            size="sm"
            style={{ width: 140 }}
          />
          <Button 
            size="sm" 
            variant="subtle" 
            color="nutroos-green" 
            rightSection={<IconChevronRight size={16} />} 
            disabled={currentWeek >= totalWeeks}
            onClick={() => onWeekChange(currentWeek + 1)}
          >
            Siguiente
          </Button>
        </Group>
        
        <Text size="md" fw={600} c="nutroos-green.7">
          {currentWeek} de {totalWeeks} semanas
        </Text>
      </Group>
    </Box>
  );
};

export default WeekSelector;
