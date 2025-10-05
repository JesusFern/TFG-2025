import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  Title, 
  Avatar, 
  Box, 
  Group,
  SimpleGrid,
  Card,
  Text,
  Button,
  Stack,
  Badge,
  Loader,
  Alert,
  TextInput,
  ActionIcon
} from '@mantine/core';
import { 
  IconBarbell, 
  IconArrowLeft,
  IconSearch,
  IconCalendar,
  IconTarget,
  IconUsers,
  IconCopy,
  IconAlertCircle
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import GlobalNotificationOverlay from '../components/atoms/GlobalNotificationOverlay';
import { getUserById } from '../services/userService';
import { trainingService } from '../services/trainingService';
import { renderClientInfo } from '../components/common/BreadcrumbUtils';
import { PlanEntrenamiento } from '../types/training';

const SeleccionarPlanExistentePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get('clientId');
  const [clienteNombre, setClienteNombre] = useState<string>('');
  const [notice, setNotice] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  
  const [planes, setPlanes] = useState<PlanEntrenamiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');

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

  useEffect(() => {
    const cargarPlanes = async () => {
      try {
        setLoading(true);
        const planesData = await trainingService.obtenerMisPlanes();
        
        // Filtrar planes que no estén asignados al cliente actual
        const planesDisponibles = planesData.filter(plan => 
          !plan.clientes || !plan.clientes.includes(clientId || '')
        );
        
        setPlanes(planesDisponibles);
      } catch (err) {
        console.error('Error al cargar planes:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar los planes');
      } finally {
        setLoading(false);
      }
    };

    cargarPlanes();
  }, [clientId]);

  const handleSeleccionarPlan = (plan: PlanEntrenamiento) => {
    // Navegar a la página de creación con los datos del plan seleccionado
    navigate(`/training/planes/crear?clientId=${clientId}&planId=${plan._id}&tipo=copia`);
  };

  const handleVolver = () => {
    navigate(`/training/planes/tipo?clientId=${clientId}`);
  };

  // Filtrar planes por búsqueda
  const planesFiltrados = planes.filter(plan =>
    plan.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    plan.objetivo.toLowerCase().includes(busqueda.toLowerCase()) ||
    (plan.descripcion && plan.descripcion.toLowerCase().includes(busqueda.toLowerCase()))
  );

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Container size="lg" py="xl">
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
              <IconBarbell size="1.5rem" />
            </Avatar>
            
            <Box style={{ flex: 1 }}>
              <Title order={2} mb={5} c="nutroos-green.6">Seleccionar Plan Existente</Title>
              {renderClientInfo(clienteNombre, clientId)}
              <Text size="sm" c="dimmed" mt="xs">
                Elige uno de tus planes anteriores para copiar y personalizar
              </Text>
            </Box>
          </Group>
          <Button
            leftSection={<IconArrowLeft size={16} />}
            variant="light"
            onClick={handleVolver}
          >
            Volver
          </Button>
        </Group>
      </Paper>
      
      {notice && (
        <GlobalNotificationOverlay
          message={notice.message}
          type={notice.type}
          onClose={() => setNotice(null)}
        />
      )}

      {/* Barra de búsqueda */}
      <Paper p="md" radius="md" withBorder style={{ backgroundColor: 'var(--app-paper-bg)' }} mb="xl">
        <TextInput
          placeholder="Buscar por nombre, objetivo o descripción..."
          leftSection={<IconSearch size={16} />}
          value={busqueda}
          onChange={(e) => setBusqueda(e.currentTarget.value)}
          size="md"
        />
      </Paper>

      {loading ? (
        <Paper p="xl" radius="md" withBorder style={{ backgroundColor: 'var(--app-paper-bg)' }}>
          <Group justify="center" mb="md">
            <Loader size="md" color="nutroos-green" />
          </Group>
          <Text ta="center" c="dimmed">Cargando planes...</Text>
        </Paper>
      ) : error ? (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Error"
          color="red"
          variant="filled"
          withCloseButton
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      ) : planesFiltrados.length === 0 ? (
        <Paper p="xl" radius="md" withBorder style={{ backgroundColor: 'var(--app-paper-bg)' }}>
          <Stack align="center" gap="md">
            <Avatar size="xl" color="gray" radius="xl">
              <IconCopy size="2rem" />
            </Avatar>
            <Title order={3} ta="center" c="dimmed">
              {planes.length === 0 ? 'No tienes planes creados' : 'No se encontraron planes'}
            </Title>
            <Text ta="center" c="dimmed" size="sm">
              {planes.length === 0 
                ? 'Crea tu primer plan para poder copiarlo después'
                : 'Intenta con otros términos de búsqueda'
              }
            </Text>
            <Button
              variant="outline"
              onClick={handleVolver}
              leftSection={<IconArrowLeft size={16} />}
            >
              Volver a selección
            </Button>
          </Stack>
        </Paper>
      ) : (
        <>
          <Group justify="space-between" mb="md">
            <Title order={3}>Planes Disponibles</Title>
            <Badge color="orange" variant="light" size="lg">
              {planesFiltrados.length} plan{planesFiltrados.length !== 1 ? 'es' : ''}
            </Badge>
          </Group>

          <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="xl">
            {planesFiltrados.map((plan, index) => (
              <motion.div
                key={plan._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card
                  p="lg"
                  radius="md"
                  withBorder
                  style={{ 
                    backgroundColor: 'var(--app-paper-bg)', 
                    borderColor: 'var(--app-border-color)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    height: '100%'
                  }}
                  onClick={() => handleSeleccionarPlan(plan)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.borderColor = 'var(--mantine-color-orange-4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = 'var(--app-border-color)';
                  }}
                >
                  <Stack gap="md" h="100%">
                    <Group justify="space-between" align="flex-start">
                      <Box style={{ flex: 1 }}>
                        <Title order={4} lineClamp={2} mb="xs">
                          {plan.nombre}
                        </Title>
                        <Text size="sm" c="dimmed" lineClamp={2}>
                          {plan.descripcion || 'Sin descripción'}
                        </Text>
                      </Box>
                      <ActionIcon
                        variant="light"
                        color="orange"
                        size="lg"
                        radius="xl"
                      >
                        <IconCopy size={18} />
                      </ActionIcon>
                    </Group>

                    <Stack gap="xs">
                      <Group gap="xs">
                        <IconTarget size={16} color="var(--mantine-color-orange-6)" />
                        <Text size="sm" fw={500}>{plan.objetivo}</Text>
                      </Group>
                      <Group gap="xs">
                        <IconCalendar size={16} color="var(--mantine-color-orange-6)" />
                        <Text size="sm">{plan.duracionDias} días</Text>
                      </Group>
                      <Group gap="xs">
                        <IconUsers size={16} color="var(--mantine-color-orange-6)" />
                        <Text size="sm">{plan.sesionesPorSemana} sesiones/semana</Text>
                      </Group>
                    </Stack>

                    <Box mt="auto">
                      <Text size="xs" c="dimmed" mb="xs">
                        Creado: {formatFecha(plan.createdAt || '')}
                      </Text>
                      <Button 
                        color="orange" 
                        fullWidth 
                        leftSection={<IconCopy size={16} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSeleccionarPlan(plan);
                        }}
                      >
                        Copiar Plan
                      </Button>
                    </Box>
                  </Stack>
                </Card>
              </motion.div>
            ))}
          </SimpleGrid>
        </>
      )}
    </Container>
  );
};

export default SeleccionarPlanExistentePage;
