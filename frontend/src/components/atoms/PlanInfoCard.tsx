import React from 'react';
import { Card, Group, Text } from '@mantine/core';
import { useThemeDetection } from '../../hooks/useThemeDetection';
import { useMantineTheme } from '@mantine/core';

interface PlanInfoCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
}

const PlanInfoCard: React.FC<PlanInfoCardProps> = ({ icon, title, value }) => {
  const isDark = useThemeDetection();
  const theme = useMantineTheme();

  return (
    <Card
      p="md"
      radius="md"
      bg={isDark ? "dark.7" : "white"}
      withBorder
      style={{ borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3] }}
    >
      <Group gap="xs" mb="xs">
        {icon}
        <Text fw={600} size="sm">{title}</Text>
      </Group>
      <Text size="sm" c="dimmed">{value}</Text>
    </Card>
  );
};

export default PlanInfoCard;
