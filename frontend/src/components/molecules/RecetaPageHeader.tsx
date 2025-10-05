import React from 'react';
import { 
  Paper, 
  Group, 
  Avatar, 
  Box, 
  Title,
  Button
} from '@mantine/core';
import { IconChefHat, IconArrowLeft } from '@tabler/icons-react';

interface RecetaPageHeaderProps {
  title: string;
  subtitle: string;
  onVolver?: () => void;
}

const RecetaPageHeader: React.FC<RecetaPageHeaderProps> = ({ title, subtitle, onVolver }) => {
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
      <Group justify="space-between" align="flex-start" mb="md">
        <Group align="flex-start">
          <Avatar 
            size="lg" 
            color="nutroos-green" 
            radius="xl"
          >
            <IconChefHat size="1.5rem" />
          </Avatar>
          
          <Box>
            <Title order={2} mb={5} c="nutroos-green.6">{title}</Title>
            <p style={{ margin: 0, color: 'var(--mantine-color-dimmed)' }}>
              {subtitle}
            </p>
          </Box>
        </Group>

        {onVolver && (
          <Button 
            variant="subtle" 
            leftSection={<IconArrowLeft size={16} />}
            onClick={onVolver}
            color="gray"
            size="sm"
          >
            Volver al listado
          </Button>
        )}
      </Group>
    </Paper>
  );
};

export default RecetaPageHeader;
