import React from 'react';
import { Text, Group, Badge, Paper, Grid } from '@mantine/core';
import { IconScale, IconLeaf } from '@tabler/icons-react';

interface Ingrediente {
  _id: string;
  nombre: string;
  peso: number;
  calorias?: number;
  proteinas?: number;
  grasas?: number;
  hidratosCarbono?: number;
}

interface IngredientesListProps {
  ingredientes: Ingrediente[];
  isDark: boolean;
  isMobile?: boolean;
}

const IngredientesList: React.FC<IngredientesListProps> = ({ 
  ingredientes, 
  isDark
}) => {
  if (!ingredientes || ingredientes.length === 0) {
    return (
      <Paper p="sm" withBorder style={{ 
        backgroundColor: isDark ? 'rgba(148, 163, 184, 0.02)' : 'rgba(148, 163, 184, 0.01)',
        border: '1px dashed rgba(148, 163, 184, 0.2)'
      }}>
        <Group gap="xs" align="center" justify="center">
          <IconLeaf size={14} color="dimmed" />
          <Text size="xs" c="dimmed" fs="italic">
            Sin ingredientes especificados
          </Text>
        </Group>
      </Paper>
    );
  }

  return (
    <Grid gutter="xs">
      {ingredientes.map((ingrediente, index) => (
        <Grid.Col key={ingrediente._id || index} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
          <Group 
            justify="space-between" 
            align="center"
            p="xs"
            style={{
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.8)',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
              borderRadius: '6px',
              minHeight: '40px',
            }}
          >
            <Group gap="xs" align="center" style={{ flex: 1, minWidth: 0 }}>
              <IconScale size={12} color={isDark ? "#51cf66" : "#2f9e44"} />
              <Text 
                size="sm" 
                fw={500}
                c={isDark ? "gray.1" : "gray.8"}
                style={{ 
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1
                }}
              >
                {ingrediente.nombre}
              </Text>
            </Group>
            
            <Badge 
              color="nutroos-green" 
              variant="light"
              size="sm"
              style={{ flexShrink: 0 }}
            >
              {ingrediente.peso}g
            </Badge>
          </Group>
        </Grid.Col>
      ))}
    </Grid>
  );
};

export default IngredientesList;
