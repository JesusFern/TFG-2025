import React, { useState } from 'react';
import {
  Stack,
  Title,
  Text,
  Grid,
  Card,
  Group,
  Badge,
  Alert,
  Loader,
  Center,
  ThemeIcon,
  Button,
  Modal
} from '@mantine/core';
import {
  IconStar,
  IconChefHat,
  IconBarbell,
  IconUser,
  IconAlertCircle,
  IconRefresh
} from '@tabler/icons-react';
import { useAuth } from '../../hooks/useAuth';
import { useValoracionesRealtime } from '../../hooks/useValoracionesRealtime';
import { Valoracion, EstadisticasValoracionesPorTipo } from '../../types/valoraciones';
import ValoracionCard from './ValoracionCard';
import ValoracionStats from './ValoracionStats';
import ValoracionForm from './ValoracionForm';
import { ValoracionService } from '../../services/valoracionService';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';

interface WorkerRatingsTabProps {
  workerId: string;
}

const WorkerRatingsTab: React.FC<WorkerRatingsTabProps> = ({ workerId }) => {
  const { user } = useAuth();
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [valoracionAEditar, setValoracionAEditar] = useState<Valoracion | null>(null);
  
  const {
    valoraciones,
    estadisticas,
    estadisticasPorTipo,
    loading,
    error,
    refreshData,
    lastUpdated
  } = useValoracionesRealtime({
    workerId,
    enabled: true
  });

  const getTipoTrabajadorIcon = (tipo: string) => {
    switch (tipo) {
      case 'Nutricionista':
        return <IconChefHat size={16} />;
      case 'Entrenador personal':
        return <IconBarbell size={16} />;
      default:
        return <IconUser size={16} />;
    }
  };

  const getTipoTrabajadorColor = (tipo: string) => {
    switch (tipo) {
      case 'Nutricionista':
        return 'green';
      case 'Entrenador personal':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const handleEditValoracion = (valoracion: Valoracion) => {
    setValoracionAEditar(valoracion);
    setEditModalOpened(true);
  };

  const handleDeleteValoracion = (valoracion: Valoracion) => {
    modals.openConfirmModal({
      title: 'Eliminar valoración',
      children: (
        <Text size="sm">
          ¿Estás seguro de que deseas eliminar esta valoración? Esta acción no se puede deshacer.
        </Text>
      ),
      labels: { confirm: 'Eliminar', cancel: 'Cancelar' },
      confirmProps: { color: 'red' },
      zIndex: 1000,
      onConfirm: async () => {
        try {
          await ValoracionService.eliminarValoracion(valoracion._id);
          notifications.show({
            title: 'Valoración eliminada',
            message: 'Tu valoración ha sido eliminada correctamente',
            color: 'green',
          });
          await refreshData();
        } catch (error) {
          notifications.show({
            title: 'Error',
            message: error instanceof Error ? error.message : 'No se pudo eliminar la valoración',
            color: 'red',
          });
        }
      },
    });
  };

  const handleValoracionActualizada = async () => {
    setEditModalOpened(false);
    setValoracionAEditar(null);
    notifications.show({
      title: 'Valoración actualizada',
      message: 'Tu valoración ha sido actualizada correctamente',
      color: 'green',
    });
    await refreshData();
  };

  if (loading) {
    return (
      <Center py="xl">
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text>Cargando valoraciones...</Text>
        </Stack>
      </Center>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
        {error}
      </Alert>
    );
  }

  return (
    <Stack gap="xl">
      {/* Estadísticas generales */}
      {estadisticas && (
        <Card p="lg" radius="lg" withBorder>
          <Stack gap="md">
            <Group justify="space-between" align="center">
              <Title order={3}>Estadísticas Generales</Title>
              <Group gap="sm">
                {lastUpdated && (
                  <Text size="sm" c="dimmed">
                    Actualizado: {lastUpdated.toLocaleTimeString()}
                  </Text>
                )}
                <Button
                  variant="light"
                  size="sm"
                  leftSection={<IconRefresh size={16} />}
                  onClick={refreshData}
                  loading={loading}
                >
                  Actualizar
                </Button>
              </Group>
            </Group>
            <ValoracionStats 
              estadisticas={estadisticas}
              estadisticasPorTipo={estadisticasPorTipo}
            />
          </Stack>
        </Card>
      )}

      {/* Estadísticas por tipo de trabajador */}
      {estadisticasPorTipo.length > 0 && (
        <Card p="lg" radius="lg" withBorder>
          <Stack gap="md">
            <Title order={3}>Estadísticas por Tipo de Trabajo</Title>
            <Grid>
              {estadisticasPorTipo.map((estadistica: EstadisticasValoracionesPorTipo, index: number) => (
                <Grid.Col key={index} span={{ base: 12, md: 6 }}>
                  <Card p="md" radius="md" withBorder>
                    <Stack gap="sm">
                      <Group gap="xs">
                        <ThemeIcon 
                          size="sm" 
                          variant="light" 
                          color={getTipoTrabajadorColor(estadistica.tipo)}
                        >
                          {getTipoTrabajadorIcon(estadistica.tipo)}
                        </ThemeIcon>
                        <Text fw={600} size="sm">
                          {estadistica.tipo}
                        </Text>
                      </Group>
                      
                      <Group gap="xs">
                        <IconStar size={16} color="orange" />
                        <Text size="sm" c="dimmed">
                          Promedio: {estadistica.calificacionPromedio.toFixed(1)}/5
                        </Text>
                      </Group>
                      
                      <Text size="sm" c="dimmed">
                        {estadistica.totalValoraciones} valoración{estadistica.totalValoraciones !== 1 ? 'es' : ''}
                      </Text>
                    </Stack>
                  </Card>
                </Grid.Col>
              ))}
            </Grid>
          </Stack>
        </Card>
      )}

      {/* Lista de valoraciones */}
      <Card p="lg" radius="lg" withBorder>
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Title order={3}>Valoraciones Recibidas</Title>
            <Badge size="lg" variant="light" color="blue">
              {valoraciones.length} valoración{valoraciones.length !== 1 ? 'es' : ''}
            </Badge>
          </Group>

          {valoraciones.length === 0 ? (
            <Alert icon={<IconAlertCircle size={16} />} color="blue">
              Aún no has recibido valoraciones de tus clientes.
            </Alert>
          ) : (
            <Stack gap="md">
              {valoraciones.map((valoracion: Valoracion) => {
                // Verificar si la valoración es del usuario actual (cliente viendo perfil de trabajador)
                const esValoracionPropia = !!(user && valoracion.cliente._id === user._id);
                
                return (
                  <ValoracionCard
                    key={valoracion._id}
                    valoracion={valoracion}
                    showActions={esValoracionPropia}
                    onEdit={esValoracionPropia ? handleEditValoracion : undefined}
                    onDelete={esValoracionPropia ? handleDeleteValoracion : undefined}
                  />
                );
              })}
            </Stack>
          )}
        </Stack>
      </Card>

      {/* Modal de Edición */}
      {valoracionAEditar && (
        <Modal
          opened={editModalOpened}
          onClose={() => {
            setEditModalOpened(false);
            setValoracionAEditar(null);
          }}
          title="Editar Valoración"
          size="md"
          centered
        >
          <ValoracionForm
            opened={editModalOpened}
            onClose={() => {
              setEditModalOpened(false);
              setValoracionAEditar(null);
            }}
            onSuccess={handleValoracionActualizada}
            trabajadorId={workerId}
            trabajadorName={valoracionAEditar.trabajador.fullName}
            tiposDisponibles={[{
              tipo: valoracionAEditar.tipoTrabajador,
              puedeValorar: true,
              yaValorado: true,
              valoracionId: valoracionAEditar._id
            }]}
            valoracion={valoracionAEditar}
          />
        </Modal>
      )}
    </Stack>
  );
};

export default WorkerRatingsTab;
