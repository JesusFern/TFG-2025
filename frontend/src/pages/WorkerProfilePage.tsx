import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Title,
  Text,
  Stack,
  Group,
  Button,
  Card,
  Box,
  Avatar,
  Badge,
  Divider,
  Alert,
  ThemeIcon,
  Grid
} from '@mantine/core';
import { 
  IconStar, 
  IconChefHat,
  IconBarbell,
  IconCalendar,
  IconMail,
  IconPhone,
  IconAlertCircle,
  IconUser
} from '@tabler/icons-react';
import { useParams } from 'react-router-dom';
import { 
  EstadisticasValoraciones, 
  EstadisticasValoracionesPorTipo,
  TipoTrabajadorDisponible,
  VerificacionValoracion
} from '../types/valoraciones';
import { ValoracionService } from '../services/valoracionService';
import { ProfessionalResponse } from '../services/userService';
import { getUserById } from '../services/userService';
import ValoracionList from '../components/molecules/ValoracionList';
import ValoracionStats from '../components/molecules/ValoracionStats';
import ValoracionForm from '../components/molecules/ValoracionForm';

const WorkerProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [trabajador, setTrabajador] = useState<ProfessionalResponse | null>(null);
  const [estadisticas, setEstadisticas] = useState<EstadisticasValoraciones | null>(null);
  const [estadisticasPorTipo, setEstadisticasPorTipo] = useState<EstadisticasValoracionesPorTipo[]>([]);
  const [tiposDisponibles, setTiposDisponibles] = useState<TipoTrabajadorDisponible[]>([]);
  const [verificacion, setVerificacion] = useState<VerificacionValoracion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalValoracion, setModalValoracion] = useState(false);

  const cargarDatos = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      // Cargar datos del trabajador
      const trabajadorData = await getUserById(id) as ProfessionalResponse;
      setTrabajador(trabajadorData);

      // Las valoraciones se cargan en ValoracionList

      // Cargar estadísticas
      const estadisticasResponse = await ValoracionService.obtenerEstadisticas({
        trabajadorId: id
      });
      setEstadisticas(estadisticasResponse);

      // Cargar estadísticas por tipo
      const estadisticasPorTipoResponse = await ValoracionService.obtenerEstadisticasPorTipo(id);
      setEstadisticasPorTipo(estadisticasPorTipoResponse);

      // Cargar tipos disponibles para valorar
      const tiposResponse = await ValoracionService.obtenerTiposTrabajadorDisponibles(id);
      setTiposDisponibles(tiposResponse);

      // Verificar si el usuario actual puede valorar
      const verificacionResponse = await ValoracionService.verificarPuedeValorar(id);
      setVerificacion(verificacionResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    cargarDatos();
  }, [id, cargarDatos]);

  const handleCrearValoracion = () => {
    setModalValoracion(true);
  };

  const handleValoracionGuardada = () => {
    cargarDatos();
    setModalValoracion(false);
  };

  const getTipoTrabajadorIcon = (tipo: string) => {
    return tipo === 'Nutricionista' ? IconChefHat : IconBarbell;
  };

  const getTipoTrabajadorColor = (tipo: string) => {
    return tipo === 'Nutricionista' ? 'green' : 'blue';
  };

  if (loading) {
    return (
      <Container size="xl" py="md">
        <Stack align="center" gap="md">
          <Text>Cargando perfil...</Text>
        </Stack>
      </Container>
    );
  }

  if (error || !trabajador) {
    return (
      <Container size="xl" py="md">
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Error"
          color="red"
          variant="light"
        >
          {error || 'Trabajador no encontrado'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        {/* Header del perfil */}
        <Card shadow="sm" padding="xl" radius="md" withBorder>
          <Grid>
            <Grid.Col span={{ base: 12, md: 3 }}>
              <Stack align="center" gap="md">
                <Avatar
                  size={120}
                  radius="xl"
                  color="blue"
                  src={trabajador.profilePicture}
                >
                  <IconUser size={60} />
                </Avatar>
                
                {verificacion?.puedeValorar && (
                  <Button
                    leftSection={<IconStar size={16} />}
                    onClick={handleCrearValoracion}
                    fullWidth
                  >
                    Valorar Profesional
                  </Button>
                )}
              </Stack>
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 9 }}>
              <Stack gap="md">
                <Box>
                  <Title order={1} size="h2">
                    {trabajador.fullName}
                  </Title>
                  <Group gap="xs" mt="xs">
                    {trabajador.workerType && (
                      <Badge
                        size="lg"
                        color={getTipoTrabajadorColor(trabajador.workerType)}
                        leftSection={
                          <ThemeIcon
                            size="sm"
                            color={getTipoTrabajadorColor(trabajador.workerType)}
                            variant="light"
                          >
                            {React.createElement(getTipoTrabajadorIcon(trabajador.workerType), { size: 14 })}
                          </ThemeIcon>
                        }
                      >
                        {trabajador.workerType}
                      </Badge>
                    )}
                    {estadisticas && (
                      <Badge size="lg" variant="light" color="yellow">
                        <Group gap="xs">
                          <IconStar size={14} />
                          <Text size="sm" fw={600}>
                            {estadisticas.promedioCalificacion.toFixed(1)}/5
                          </Text>
                        </Group>
                      </Badge>
                    )}
                  </Group>
                </Box>

                {trabajador.biography && (
                  <Text size="md" style={{ lineHeight: 1.6 }}>
                    {trabajador.biography}
                  </Text>
                )}

                <Divider />

                <Grid>
                  <Grid.Col span={{ base: 6, md: 3 }}>
                    <Group gap="xs">
                      <IconMail size={16} color="dimmed" />
                      <Text size="sm">{trabajador.email}</Text>
                    </Group>
                  </Grid.Col>
                  <Grid.Col span={{ base: 6, md: 3 }}>
                    <Group gap="xs">
                      <IconPhone size={16} color="dimmed" />
                      <Text size="sm">{trabajador.email || 'No disponible'}</Text>
                    </Group>
                  </Grid.Col>
                  {trabajador.availability && (
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <Group gap="xs">
                        <IconCalendar size={16} color="dimmed" />
                        <Text size="sm">{trabajador.availability}</Text>
                      </Group>
                    </Grid.Col>
                  )}
                </Grid>
              </Stack>
            </Grid.Col>
          </Grid>
        </Card>

        {/* Estadísticas */}
        {estadisticas && (
          <ValoracionStats 
            estadisticas={estadisticas}
            estadisticasPorTipo={estadisticasPorTipo}
            compact={false}
          />
        )}

        {/* Lista de valoraciones */}
        <ValoracionList
          trabajadorId={id}
          showFilters={true}
          showCreateButton={false}
          compact={false}
        />

        {/* Modal de valoración */}
        {trabajador && (
          <ValoracionForm
            opened={modalValoracion}
            onClose={() => setModalValoracion(false)}
            onSuccess={handleValoracionGuardada}
            trabajadorId={trabajador._id}
            trabajadorName={trabajador.fullName}
            tiposDisponibles={tiposDisponibles}
          />
        )}
      </Stack>
    </Container>
  );
};

export default WorkerProfilePage;
