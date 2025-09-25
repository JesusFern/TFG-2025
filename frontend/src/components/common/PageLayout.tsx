import React from 'react';
import { Container, Paper, Breadcrumbs, Group, Avatar, Box, Title, Text } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import { renderClientInfo } from './BreadcrumbUtils';

interface PageLayoutProps {
  children: React.ReactNode;
  breadcrumbItems: React.ReactNode[];
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  iconColor?: string;
  clienteNombre?: string;
  clientId?: string | null;
  headerContent?: React.ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  breadcrumbItems,
  title,
  subtitle,
  icon,
  iconColor = 'nutroos-green',
  clienteNombre,
  clientId,
  headerContent
}) => {
  return (
    <Container size="lg" py="xl">
      <Paper 
        p="md" 
        mb="lg" 
        style={{ 
          backgroundColor: 'var(--app-paper-bg)', 
          borderBottom: '1px solid var(--app-border-color)' 
        }}
      >
        <Breadcrumbs separator={<IconChevronRight size={14} />}>
          {breadcrumbItems}
        </Breadcrumbs>
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
        <Group mb="md" align="flex-start">
          <Avatar 
            size="lg" 
            color={iconColor} 
            radius="xl"
          >
            {icon}
          </Avatar>
          
          <Box style={{ flex: 1 }}>
            <Title order={2} mb={5} c={`${iconColor}.6`}>{title}</Title>
            {clienteNombre && renderClientInfo(clienteNombre, clientId)}
            {subtitle && (
              <Text size="sm" c="dimmed" mt="xs">
                {subtitle}
              </Text>
            )}
            {headerContent}
          </Box>
        </Group>
      </Paper>

      {children}
    </Container>
  );
};
