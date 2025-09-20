import React from 'react';
import {
  Group,
  Title,
  Text,
  Badge
} from '@mantine/core';
import GradientPaper from '../atoms/GradientPaper';

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
  return (
    <GradientPaper variant="header">
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
    </GradientPaper>
  );
};

export default PageHeader;
