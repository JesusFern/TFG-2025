import React from 'react';
import { 
  Paper, 
  Group, 
  Avatar, 
  Box, 
  Title, 
  Badge, 
  Text, 
  ActionIcon 
} from '@mantine/core';
import { IconChefHat, IconArrowLeft, IconClock, IconUsers } from '@tabler/icons-react';
import { RecetaResponse } from '../../services/recetaService';

interface RecetaHeaderProps {
  receta: RecetaResponse;
  onVolver: () => void;
  showBackButton?: boolean;
  children?: React.ReactNode;
}

const RecetaHeader: React.FC<RecetaHeaderProps> = ({ 
  receta, 
  onVolver, 
  showBackButton = true,
  children 
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
      <Group justify="space-between" align="flex-start">
        <Group gap="md">
          {showBackButton && (
            <ActionIcon
              variant="light"
              color="nutroos-green"
              size="lg"
              onClick={onVolver}
            >
              <IconArrowLeft size={20} />
            </ActionIcon>
          )}
          
          <Avatar 
            size="lg" 
            color="nutroos-green" 
            radius="xl"
          >
            <IconChefHat size="1.5rem" />
          </Avatar>
          
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Title 
              order={2} 
              mb={5} 
              c="nutroos-green.6"
              style={{ 
                wordWrap: 'break-word',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                maxWidth: '100%'
              }}
            >
              {receta.nombreReceta}
            </Title>
            <Group gap="md">
              <Badge 
                color={receta.publica ? "green" : "orange"} 
                variant="light"
                leftSection={<IconUsers size={12} />}
              >
                {receta.publica ? "Pública" : "Privada"}
              </Badge>
              {receta.tiempoPreparacion && (
                <Badge 
                  color="blue" 
                  variant="light"
                  leftSection={<IconClock size={12} />}
                >
                  {receta.tiempoPreparacion}
                </Badge>
              )}
              {receta.createdAt && (
                <Text size="sm" c="dimmed">
                  Creada: {formatDate(receta.createdAt)}
                </Text>
              )}
            </Group>
          </Box>
        </Group>

        {children && (
          <Group gap="sm">
            {children}
          </Group>
        )}
      </Group>
    </Paper>
  );
};

export default RecetaHeader;
