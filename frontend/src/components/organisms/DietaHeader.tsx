import React from 'react';
import { Paper, Group, Title, Text, Badge, Button, Box, ThemeIcon, Container } from '@mantine/core';
import { IconArrowLeft, IconCalendarEvent, IconClock, IconTarget, IconLeaf } from '@tabler/icons-react';
import { Dieta } from '../../types';
import { dietaStyles as styles } from '../../helpers/diets/DietaHelper';

interface DietaHeaderProps {
  dieta: Dieta;
  isDark: boolean;
  fechaInicioFormateada: string;
  userRole?: string;
  onBackNavigation: () => void;
  isMobile?: boolean;
}

const DietaHeader: React.FC<DietaHeaderProps> = ({
  dieta,
  isDark,
  fechaInicioFormateada,
  userRole,
  onBackNavigation,
  isMobile = false
}) => {
  const containerSize = isMobile ? "sm" : "xl";
  const headerPadding = isMobile ? "md" : "lg";
  const buttonSize = isMobile ? "md" : "md";

  return (
    <Container 
      size={containerSize} 
      py={isMobile ? "md" : "xl"} 
      px={isMobile ? "sm" : "sm"}
      style={{ maxWidth: isMobile ? undefined : '1800px' }}
    >
      <Paper 
        p={headerPadding} 
        mb="md" 
        withBorder 
        radius="md"
        style={{ 
          ...styles.paperBg,
          ...styles.paperBorder
        }}
      >
        <Group justify="space-between" mb="lg" wrap="wrap">
          <Box>
            <Group gap="md" align="center" mb="sm">
              <Title order={2} c={isDark ? "gray.1" : "gray.8"} fw={700}>
                {dieta.nombre}
              </Title>
              <Badge 
                color="gray" 
                variant="light" 
                size="lg"
                leftSection={<IconLeaf size={14} />}
                style={styles.statusBadge(isDark)}
              >
                Publicada
              </Badge>
            </Group>
            <Text size="md" c="dimmed" mb="md" style={{ maxWidth: '600px' }}>
              {dieta.descripcion || "Esta dieta no tiene descripción disponible."}
            </Text>
            
            {/* Información básica con iconos */}
            <Group gap="lg" mb="md">
              <Group gap="xs">
                <ThemeIcon size="sm" color="gray" variant="light">
                  <IconCalendarEvent size={16} />
                </ThemeIcon>
                <Text size="sm" fw={500} c={isDark ? "gray.3" : "gray.6"}>
                  {dieta.duracion} días
                </Text>
              </Group>
              <Group gap="xs">
                <ThemeIcon size="sm" color="gray" variant="light">
                  <IconClock size={16} />
                </ThemeIcon>
                <Text size="sm" fw={500} c={isDark ? "gray.3" : "gray.6"}>
                  {dieta.comidasDiarias} comidas diarias
                </Text>
              </Group>
              <Group gap="xs">
                <ThemeIcon size="sm" color="gray" variant="light">
                  <IconTarget size={16} />
                </ThemeIcon>
                <Text size="sm" fw={500} c={isDark ? "gray.3" : "gray.6"}>
                  Inicio: {fechaInicioFormateada}
                </Text>
              </Group>
            </Group>
          </Box>
          
          <Button
            variant="outline"
            color="gray"
            leftSection={<IconArrowLeft size={18} />}
            size={buttonSize}
            onClick={onBackNavigation}
          >
            {userRole === 'user' ? 'Volver a mis dietas' : 'Volver a dietas del cliente'}
          </Button>
        </Group>
      </Paper>
    </Container>
  );
};

export default DietaHeader;
