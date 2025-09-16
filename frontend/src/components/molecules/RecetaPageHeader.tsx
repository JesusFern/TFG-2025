import React from 'react';
import { 
  Paper, 
  Group, 
  Avatar, 
  Box, 
  Title 
} from '@mantine/core';
import { IconChefHat } from '@tabler/icons-react';

interface RecetaPageHeaderProps {
  title: string;
  subtitle: string;
}

const RecetaPageHeader: React.FC<RecetaPageHeaderProps> = ({ title, subtitle }) => {
  return (
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
          color="nutroos-green" 
          radius="xl"
        >
          <IconChefHat size="1.5rem" />
        </Avatar>
        
        <Box style={{ flex: 1 }}>
          <Title order={2} mb={5} c="nutroos-green.6">{title}</Title>
          <p style={{ margin: 0, color: 'var(--mantine-color-dimmed)' }}>
            {subtitle}
          </p>
        </Box>
      </Group>
    </Paper>
  );
};

export default RecetaPageHeader;
