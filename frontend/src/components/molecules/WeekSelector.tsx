import React from 'react';
import {
  Group,
  Title,
  Text,
  Pagination
} from '@mantine/core';
import GradientPaper from '../atoms/GradientPaper';

interface WeekSelectorProps {
  currentWeek: number;
  totalWeeks: number;
  sessionsCount: number;
  onWeekChange: (week: number) => void;
}

const WeekSelector: React.FC<WeekSelectorProps> = ({
  currentWeek,
  totalWeeks,
  sessionsCount,
  onWeekChange
}) => {
  return (
    <GradientPaper variant="content" mb="xl">
      <Group justify="space-between" align="center">
        <div>
          <Title order={4} mb="xs">Semana {currentWeek}</Title>
          <Text size="sm" c="dimmed">
            {sessionsCount} sesiones programadas
          </Text>
        </div>
        
        <Pagination
          value={currentWeek}
          onChange={onWeekChange}
          total={totalWeeks}
          color="nutroos-green"
          withEdges
          size="sm"
          radius="md"
        />
      </Group>
    </GradientPaper>
  );
};

export default WeekSelector;