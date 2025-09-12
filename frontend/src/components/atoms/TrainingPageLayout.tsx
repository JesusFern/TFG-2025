import React from 'react';
import { Container, Paper, Group, Text, Title, Box, ActionIcon } from '@mantine/core';
import { IconBarbell } from '@tabler/icons-react';
import TrainingBreadcrumbs from './TrainingBreadcrumbs';

interface BreadcrumbItem {
  title: string;
  href: string;
  icon?: React.ReactNode;
}

interface TrainingPageLayoutProps {
  breadcrumbs: BreadcrumbItem[];
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const TrainingPageLayout: React.FC<TrainingPageLayoutProps> = ({
  breadcrumbs,
  title,
  subtitle,
  icon = <IconBarbell size={18} />,
  children
}) => {
  return (
    <Container size="md" py="xl">
      <Paper 
        p="md" 
        mb="lg" 
        style={{ 
          backgroundColor: 'var(--app-paper-bg)', 
          borderBottom: '1px solid var(--app-border-color)' 
        }}
      >
        <TrainingBreadcrumbs items={breadcrumbs} />
      </Paper>

      <Paper 
        p="lg" 
        mb="xl" 
        withBorder 
        radius="md"
        style={{ 
          backgroundColor: 'var(--app-paper-bg)', 
          borderColor: 'var(--app-border-color)' 
        }}
      >
        <Group justify="space-between" mb="md" align="center">
          <Box style={{ flex: 1 }}>
            <Title order={2} mb={5} c="nutroos-green.6">{title}</Title>
            {subtitle && <Text size="sm" c="dimmed">{subtitle}</Text>}
          </Box>
          <ActionIcon variant="light" color="nutroos-green" radius="xl" size="lg">
            {icon}
          </ActionIcon>
        </Group>
      </Paper>
      
      {children}
    </Container>
  );
};

export default TrainingPageLayout;
