import React from 'react';
import {
  Paper,
  Group,
  Title,
  Text,
  Badge
} from '@mantine/core';
import { useThemeDetection } from '../../hooks/useThemeDetection';
import { useMantineTheme } from '@mantine/core';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  badgeText: string;
  badgeIcon?: React.ReactNode;
  badgeColor?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badgeText,
  badgeIcon,
  badgeColor = "nutroos-green"
}) => {
  const isDark = useThemeDetection();
  const theme = useMantineTheme();

  return (
    <Paper 
      p="lg" 
      shadow="xs" 
      radius="md" 
      mb="xl" 
      withBorder
      bg={isDark ? "dark.6" : "gray.0"}
      c={isDark ? "gray.0" : "dark.9"}
      style={{ 
        borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3],
        background: `linear-gradient(135deg, ${isDark ? theme.colors.dark[6] : theme.colors.gray[0]} 0%, ${isDark ? theme.colors.dark[7] : theme.colors.gray[1]} 100%)`
      }}
    >
      <Group justify="space-between" align="flex-start">
        <div>
          <Title order={2} mb="xs" c="nutroos-green.6">
            {title}
          </Title>
          <Text c="dimmed" size="lg">
            {subtitle}
          </Text>
        </div>
        <Badge
          size="xl"
          color={badgeColor}
          variant="light"
          leftSection={badgeIcon}
          style={{ fontWeight: 600 }}
        >
          {badgeText}
        </Badge>
      </Group>
    </Paper>
  );
};

export default PageHeader;
