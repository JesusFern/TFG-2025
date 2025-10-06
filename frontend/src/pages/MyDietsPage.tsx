import React, { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Text,
  Grid,
  Paper,
  Group,
  Badge,
  Button,
  Stack,
  Alert,
  Loader,
  Center,
  ThemeIcon,
  Card,
  CardSection,
  Divider,
  useMantineColorScheme
} from '@mantine/core';
import {
  IconSoup,
  IconCalendar,
  IconClock,
  IconUser,
  IconAlertCircle,
  IconLeaf,
  IconTarget,
  IconChevronRight
} from '@tabler/icons-react';
import { IconArrowLeft } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getMyDiets } from '../services/dietService';
import { DietaResponse } from '../types/diets';

const MyDietsPage: React.FC = () => {
  const [dietas, setDietas] = useState<DietaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  
  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  useEffect(() => {
    const cargarDietas = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getMyDiets();
        setDietas(response.dietas);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar las dietas');
      } finally {
        setLoading(false);
      }
    };

    cargarDietas();
  }, []);

  const handleVerDieta = (dietaId: string) => {
    // Validar que el ID no esté vacío y tenga el formato correcto
    if (!dietaId || dietaId.trim() === '') {
      setError('ID de dieta inválido');
      return;
    }
    
    // Validar formato de ObjectId de MongoDB (24 caracteres hexadecimales)
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!objectIdRegex.test(dietaId)) {
      setError('ID de dieta con formato inválido');
      return;
    }
    
    navigate(`/ver-dieta/${dietaId}`);
  };

  const getTipoColor = (tipo: string[]) => {
    if (tipo.includes('Pérdida de peso')) return 'red';
    if (tipo.includes('Ganancia de peso')) return 'blue';
    if (tipo.includes('Mantenimiento')) return 'green';
    if (tipo.includes('Musculación')) return 'violet';
    return 'gray';
  };

  const formatFechaInicio = (fechaInicio: string) => {
    try {
      const fecha = new Date(fechaInicio);
      return format(fecha, "d 'de' MMMM 'de' yyyy", { locale: es });
    } catch {
      return fechaInicio;
    }
  };

  if (loading) {
    return (
      <Container size="lg" py="xl">
        <Center h={400}>
          <Stack align="center">
            <Loader size="lg" color="nutroos-green" />
            <Text>Cargando tus dietas...</Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="lg" py="xl">
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Error"
          color="red"
          variant="light"
        >
          {error}
        </Alert>
      </Container>
    );
  }

  return (
      <Container size="lg" py="xl">
        <Stack gap="xl">
          {/* Header */}
          <Paper p="xl" radius="lg" withBorder>
            <Stack gap="md">
              <Group justify="space-between" align="center">
                <Group align="center" gap="md">
                  <ThemeIcon size="xl" color="nutroos-green" variant="light">
                    <IconSoup size={32} />
                  </ThemeIcon>
                  <div>
                    <Title order={1} c={isDark ? "white" : "dark"}>
                      Mis Dietas
                    </Title>
                    <Text size="lg" c="dimmed">
                      Dietas personalizadas creadas por tus profesionales
                    </Text>
                  </div>
                </Group>
                <Button
                  leftSection={<IconArrowLeft size={16} />}
                  variant="light"
                  onClick={handleBackToDashboard}
                >
                  Volver al Dashboard
                </Button>
              </Group>
              
              <Group>
                <Badge color="nutroos-green" variant="light" size="lg">
                  {dietas.length} {dietas.length === 1 ? 'dieta' : 'dietas'} asignada{dietas.length !== 1 ? 's' : ''}
                </Badge>
                <Badge color="blue" variant="light" size="lg">
                  Cliente Activo
                </Badge>
              </Group>
            </Stack>
          </Paper>

          {/* Lista de dietas */}
          {dietas.length === 0 ? (
            <Paper p="xl" radius="lg" withBorder>
              <Center h={300}>
                <Stack align="center" gap="md">
                  <ThemeIcon size="xl" color="gray" variant="light">
                    <IconSoup size={48} />
                  </ThemeIcon>
                  <Title order={3} c={isDark ? "gray.4" : "gray.6"}>
                    No tienes dietas asignadas
                  </Title>
                  <Text c="dimmed" ta="center" maw={400}>
                    Cuando un nutricionista te asigne una dieta personalizada, aparecerá aquí.
                  </Text>
                </Stack>
              </Center>
            </Paper>
          ) : (
            <Grid>
              {dietas.map((dieta) => (
                <Grid.Col key={dieta._id} span={{ base: 12, md: 6 }}>
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
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => handleVerDieta(dieta._id)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = 'var(--mantine-shadow-md)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <CardSection>
                        <Group justify="space-between" align="flex-start" p="md" pb="xs">
                          <Group gap="xs">
                            <ThemeIcon color="nutroos-green" variant="light" size="sm">
                              <IconLeaf size={16} />
                            </ThemeIcon>
                            <Badge color="green" variant="light" size="sm">
                              Publicada
                            </Badge>
                          </Group>
                          <Button
                            variant="subtle"
                            size="xs"
                            rightSection={<IconChevronRight size={14} />}
                            color="nutroos-green"
                          >
                            Ver dieta
                          </Button>
                        </Group>
                      </CardSection>

                      <Stack gap="md">
                        <div>
                          <Title order={3} c={isDark ? "white" : "dark"} mb="xs" lineClamp={1}>
                            {dieta.nombre}
                          </Title>
                          <Text size="sm" c="dimmed" lineClamp={2}>
                            {dieta.descripcion || 'Sin descripción disponible'}
                          </Text>
                        </div>

                        {/* Información de la dieta */}
                        <Stack gap="xs">
                          <Group gap="md">
                            <Group gap="xs">
                              <ThemeIcon size="sm" color="blue" variant="light">
                                <IconCalendar size={14} />
                              </ThemeIcon>
                              <Text size="sm" fw={500}>
                                {dieta.duracion} días
                              </Text>
                            </Group>
                            <Group gap="xs">
                              <ThemeIcon size="sm" color="orange" variant="light">
                                <IconClock size={14} />
                              </ThemeIcon>
                              <Text size="sm" fw={500}>
                                {dieta.comidasDiarias} comidas/día
                              </Text>
                            </Group>
                          </Group>

                          {dieta.fechaInicio && (
                            <Group gap="xs">
                              <ThemeIcon size="sm" color="green" variant="light">
                                <IconTarget size={14} />
                              </ThemeIcon>
                              <Text size="sm" fw={500}>
                                Inicio: {formatFechaInicio(dieta.fechaInicio)}
                              </Text>
                            </Group>
                          )}
                        </Stack>

                        {/* Tipos de dieta */}
                        {dieta.tipo && dieta.tipo.length > 0 && (
                          <Group gap="xs">
                            {dieta.tipo.map((tipo, index) => (
                              <Badge
                                key={index}
                                color={getTipoColor([tipo])}
                                variant="light"
                                size="sm"
                              >
                                {tipo}
                              </Badge>
                            ))}
                          </Group>
                        )}

                        {/* Información del creador */}
                        {dieta.creador && (
                          <>
                            <Divider />
                            <Group gap="xs">
                              <ThemeIcon size="sm" color="gray" variant="light">
                                <IconUser size={14} />
                              </ThemeIcon>
                              <Text size="sm" c="dimmed">
                                Creada por: {typeof dieta.creador === 'string' ? dieta.creador : (dieta.creador as { fullName?: string })?.fullName || 'Desconocido'}
                              </Text>
                            </Group>
                          </>
                        )}
                      </Stack>
                    </Card>
                  </motion.div>
                </Grid.Col>
              ))}
            </Grid>
          )}
        </Stack>
      </Container>
  );
};

export default MyDietsPage;
