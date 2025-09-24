import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  Breadcrumbs, 
  Title, 
  Avatar, 
  Box, 
  Group,
  SimpleGrid,
  Card,
  Text,
  Button,
  Stack,
  Badge
} from '@mantine/core';
import { 
  IconBarbell, 
  IconChevronRight, 
  IconPlus, 
  IconTemplate,
  IconTarget,
  IconCalendar,
  IconUsers
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import GlobalNotificationOverlay from '../components/atoms/GlobalNotificationOverlay';
import { getUserById } from '../services/userService';
import { BREADCRUMBS_TRAINING_BASE } from '../constants/training';
import { createBreadcrumbItems, renderClientInfo } from '../components/common/BreadcrumbUtils';

const SeleccionarTipoPlanPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get('clientId');
  const [clienteNombre, setClienteNombre] = useState<string>('');
  const [notice, setNotice] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  useEffect(() => {
    if (clientId) {
      (async () => {
        try {
          const userData = await getUserById(clientId);
          setClienteNombre(userData.fullName);
        } catch {
          // ignore
        }
      })();
    }
  }, [clientId]);

  const handleCrearDesdeCero = () => {
    navigate(`/training/planes/crear?clientId=${clientId}`);
  };

  const handleUsarPlantilla = () => {
    navigate(`/training/planes/plantillas/objetivos?clientId=${clientId}`);
  };

  const items = createBreadcrumbItems(BREADCRUMBS_TRAINING_BASE, [
    { title: 'Seleccionar tipo de plan', href: '#', icon: undefined }
  ]);

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
          {items}
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
            color="nutroos-green" 
            radius="xl"
          >
            <IconBarbell size="1.5rem" />
          </Avatar>
          
          <Box style={{ flex: 1 }}>
            <Title order={2} mb={5} c="nutroos-green.6">Crear Plan de Entrenamiento</Title>
            {renderClientInfo(clienteNombre, clientId)}
            <Text size="sm" c="dimmed" mt="xs">
              Elige cómo quieres crear el plan de entrenamiento
            </Text>
          </Box>
        </Group>
      </Paper>
      
      {notice && (
        <GlobalNotificationOverlay
          message={notice.message}
          type={notice.type}
          onClose={() => setNotice(null)}
        />
      )}

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
        {/* Opción 1: Crear desde cero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card
            p="xl"
            radius="md"
            withBorder
            style={{ 
              backgroundColor: 'var(--app-paper-bg)', 
              borderColor: 'var(--app-border-color)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onClick={handleCrearDesdeCero}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Stack align="center" gap="md">
              <Avatar size="xl" color="blue" radius="xl">
                <IconPlus size="2rem" />
              </Avatar>
              
              <Title order={3} ta="center">Crear desde Cero</Title>
              
              <Text size="sm" c="dimmed" ta="center">
                Diseña un plan completamente personalizado desde el principio
              </Text>

              <Stack gap="xs" w="100%">
                <Group gap="xs">
                  <IconTarget size={16} color="var(--mantine-color-blue-6)" />
                  <Text size="sm">Objetivos personalizados</Text>
                </Group>
                <Group gap="xs">
                  <IconCalendar size={16} color="var(--mantine-color-blue-6)" />
                  <Text size="sm">Duración flexible</Text>
                </Group>
                <Group gap="xs">
                  <IconUsers size={16} color="var(--mantine-color-blue-6)" />
                  <Text size="sm">Ejercicios específicos</Text>
                </Group>
              </Stack>

              <Button 
                color="blue" 
                fullWidth 
                leftSection={<IconPlus size={16} />}
                onClick={handleCrearDesdeCero}
              >
                Crear Plan Personalizado
              </Button>
            </Stack>
          </Card>
        </motion.div>

        {/* Opción 2: Usar plantilla */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card
            p="xl"
            radius="md"
            withBorder
            style={{ 
              backgroundColor: 'var(--app-paper-bg)', 
              borderColor: 'var(--app-border-color)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onClick={handleUsarPlantilla}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Stack align="center" gap="md">
              <Avatar size="xl" color="nutroos-green" radius="xl">
                <IconTemplate size="2rem" />
              </Avatar>
              
              <Title order={3} ta="center">Usar Plantilla</Title>
              
              <Text size="sm" c="dimmed" ta="center">
                Selecciona un objetivo y personaliza la duración y frecuencia
              </Text>

              <Stack gap="xs" w="100%">
                <Group gap="xs">
                  <IconTarget size={16} color="var(--mantine-color-nutroos-green-6)" />
                  <Text size="sm">Objetivos predefinidos</Text>
                </Group>
                <Group gap="xs">
                  <IconCalendar size={16} color="var(--mantine-color-nutroos-green-6)" />
                  <Text size="sm">Duración configurable</Text>
                </Group>
                <Group gap="xs">
                  <IconUsers size={16} color="var(--mantine-color-nutroos-green-6)" />
                  <Text size="sm">Ejercicios optimizados</Text>
                </Group>
              </Stack>

              <Badge color="nutroos-green" variant="light" size="lg">
                Recomendado
              </Badge>

              <Button 
                color="nutroos-green" 
                fullWidth 
                leftSection={<IconTemplate size={16} />}
                onClick={handleUsarPlantilla}
              >
                Usar Plantilla
              </Button>
            </Stack>
          </Card>
        </motion.div>
      </SimpleGrid>
    </Container>
  );
};

export default SeleccionarTipoPlanPage;
