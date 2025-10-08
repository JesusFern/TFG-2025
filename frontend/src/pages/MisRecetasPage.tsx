import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Title, 
  Alert, 
  Group,
  Avatar,
  Paper,
  Box,
  Grid,
  Card,
  Text,
  Badge,
  Button,
  Stack,
  Center,
  Loader
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { obtenerMisRecetas, RecetaResponse } from '../services/recetaService';
import { IconAlertCircle, IconChefHat, IconPlus, IconEye, IconClock, IconUsers, IconArrowLeft } from '@tabler/icons-react';
import { motion } from 'framer-motion';

const MisRecetasPage: React.FC = () => {
  const navigate = useNavigate();
  const [recetas, setRecetas] = useState<RecetaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarRecetas();
  }, []);

  const cargarRecetas = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await obtenerMisRecetas();
      setRecetas(response.recetas);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar las recetas');
    } finally {
      setLoading(false);
    }
  };

  const handleCrearReceta = () => {
    navigate('/recetas/crear');
  };

  const handleVerReceta = (recetaId: string) => {
    navigate(`/recetas/${recetaId}`);
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Center style={{ height: '50vh' }}>
          <Stack align="center" gap="md">
            <Loader size="lg" color="nutroos-green" />
            <Text>Cargando tus recetas...</Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
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
            <Avatar 
              size="lg" 
              color="nutroos-green" 
              radius="xl"
            >
              <IconChefHat size="1.5rem" />
            </Avatar>
            
            <Box>
              <Title order={2} mb={5} c="nutroos-green.6">Mis Recetas</Title>
              <Text c="dimmed">
                Gestiona todas las recetas que has creado
              </Text>
            </Box>
          </Group>

          <Group gap="sm">
            <Button
              leftSection={<IconArrowLeft size={16} />}
              variant="light"
              onClick={handleBackToDashboard}
            >
              Volver al Dashboard
            </Button>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={handleCrearReceta}
              color="nutroos-green"
              size="md"
            >
              Crear Nueva Receta
            </Button>
          </Group>
        </Group>
      </Paper>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Alert 
            icon={<IconAlertCircle size={16} />}
            title="Error"
            color="red"
            variant="filled"
            mb="md"
            withCloseButton
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        </motion.div>
      )}

      {recetas.length === 0 ? (
        <Paper 
          p="xl" 
          withBorder 
          radius="md"
          style={{ 
            backgroundColor: 'var(--app-paper-bg)', 
            borderColor: 'var(--app-border-color)' 
          }}
        >
          <Center>
            <Stack align="center" gap="md">
              <IconChefHat size={64} color="var(--mantine-color-dimmed)" />
              <Title order={3} c="dimmed">No tienes recetas creadas</Title>
              <Text c="dimmed" ta="center">
                Comienza creando tu primera receta para compartir con tus clientes
              </Text>
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={handleCrearReceta}
                color="nutroos-green"
                size="lg"
                mt="md"
              >
                Crear Mi Primera Receta
              </Button>
            </Stack>
          </Center>
        </Paper>
      ) : (
        <Grid>
          {recetas.map((receta) => (
            <Grid.Col key={receta._id} span={{ base: 12, sm: 6, md: 4 }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  shadow="sm"
                  padding="lg"
                  radius="md"
                  withBorder
                  style={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease'
                  }}
                  onClick={() => handleVerReceta(receta._id)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <Card.Section>
                    {receta.imagenes && receta.imagenes.length > 0 ? (
                      <Box
                        style={{
                          height: 200,
                          backgroundImage: `url(${receta.imagenes[0]})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          borderRadius: 'var(--mantine-radius-md) var(--mantine-radius-md) 0 0'
                        }}
                      />
                    ) : (
                      <Box
                        style={{
                          height: 200,
                          backgroundColor: 'var(--mantine-color-gray-1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 'var(--mantine-radius-md) var(--mantine-radius-md) 0 0'
                        }}
                      >
                        <IconChefHat size={48} color="var(--mantine-color-dimmed)" />
                      </Box>
                    )}
                  </Card.Section>

                  <Stack gap="sm" style={{ flex: 1 }}>
                    <Group justify="space-between" align="flex-start">
                      <Title order={4} lineClamp={2} style={{ flex: 1 }}>
                        {receta.nombreReceta}
                      </Title>
                      <Badge 
                        color={receta.publica ? "green" : "orange"} 
                        variant="light"
                        size="sm"
                      >
                        {receta.publica ? "Pública" : "Privada"}
                      </Badge>
                    </Group>

                    <Text size="sm" c="dimmed" lineClamp={2}>
                      {receta.ingredientes.length} ingrediente{receta.ingredientes.length !== 1 ? 's' : ''}
                    </Text>

                    {receta.tiempoPreparacion && (
                      <Group gap="xs">
                        <IconClock size={14} />
                        <Text size="sm" c="dimmed">
                          {receta.tiempoPreparacion}
                        </Text>
                      </Group>
                    )}

                    {receta.createdAt && (
                      <Text size="xs" c="dimmed">
                        Creada: {formatDate(receta.createdAt)}
                      </Text>
                    )}
                  </Stack>

                  <Group justify="space-between" mt="md">
                    <Button
                      variant="light"
                      color="nutroos-green"
                      size="sm"
                      leftSection={<IconEye size={14} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVerReceta(receta._id);
                      }}
                    >
                      Ver
                    </Button>
                    
                    <Badge 
                      color="blue" 
                      variant="light"
                      leftSection={<IconUsers size={12} />}
                    >
                      {receta.ingredientes.length} ingredientes
                    </Badge>
                  </Group>
                </Card>
              </motion.div>
            </Grid.Col>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default MisRecetasPage;
