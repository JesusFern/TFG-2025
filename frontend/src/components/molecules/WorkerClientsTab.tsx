import React, { useState, useEffect, useCallback } from 'react';
import {
  Stack,
  Title,
  Text,
  Grid,
  Card,
  Group,
  Badge,
  Avatar,
  Button,
  Alert,
  Loader,
  Center,
  ActionIcon,
  Tooltip,
  Box
} from '@mantine/core';
import {
  IconUser,
  IconMessage,
  IconSettings,
  IconAlertCircle
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { getClientsAssignedToWorker, AssignedClient } from '../../services/userService';
import { conversacionService } from '../../services/chatService';
import { notifications } from '@mantine/notifications';

interface WorkerClientsTabProps {
  workerId: string;
}

const WorkerClientsTab: React.FC<WorkerClientsTabProps> = ({ workerId }) => {
  const [clients, setClients] = useState<AssignedClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contactLoading, setContactLoading] = useState<string | null>(null);
  const navigate = useNavigate();

  const cargarClientes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getClientsAssignedToWorker(workerId);
      setClients(data);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los clientes');
    } finally {
      setLoading(false);
    }
  }, [workerId]);

  useEffect(() => {
    cargarClientes();
  }, [workerId, cargarClientes]);

  const handleContact = async (client: AssignedClient) => {
    setContactLoading(client._id);
    
    try {
      // Buscar si ya existe una conversación entre el trabajador y el cliente
      const conversaciones = await conversacionService.obtenerConversacionesUsuario(workerId);
      
      // Buscar conversación existente con este cliente
      const conversacionExistente = conversaciones.find(conv => 
        conv.participantes.some(p => p._id === client._id)
      );
      
      if (conversacionExistente) {
        // Si existe, navegar a esa conversación
        navigate(`/chat?conversacion=${conversacionExistente._id}`);
        notifications.show({
          title: 'Conversación encontrada',
          message: `Te has unido a la conversación con ${client.fullName}`,
          color: 'green',
        });
      } else {
        // Si no existe, crear una nueva conversación
        const nuevaConversacion = await conversacionService.crearConversacion({
          participantes: [workerId, client._id],
          metadata: {
            tipo: 'consulta',
            tags: ['trabajador', 'cliente']
          }
        });
        
        // Navegar a la nueva conversación
        navigate(`/chat?conversacion=${nuevaConversacion._id}`);
        notifications.show({
          title: 'Conversación creada',
          message: `Se ha creado una nueva conversación con ${client.fullName}`,
          color: 'green',
        });
      }
    } catch (error) {
      console.error('Error al contactar cliente:', error);
      notifications.show({
        title: 'Error',
        message: 'No se pudo establecer la conversación. Inténtalo de nuevo.',
        color: 'red',
      });
    } finally {
      setContactLoading(null);
    }
  };

  const handleManageClient = (client: AssignedClient) => {
    // Redirigir a la página de gestión de clientes con el nombre del cliente en el filtro
    navigate(`/worker/dashboard-clients?cliente=${encodeURIComponent(client.fullName)}`);
  };

  const getTipoAsignacionIcon = (tipo: string) => {
    switch (tipo) {
      case 'Nutricionista':
        return <IconUser size={16} />;
      case 'Entrenador personal':
        return <IconUser size={16} />;
      default:
        return <IconUser size={16} />;
    }
  };

  const getTipoAsignacionColor = (tipo: string) => {
    switch (tipo) {
      case 'Nutricionista':
        return 'green';
      case 'Entrenador personal':
        return 'blue';
      default:
        return 'gray';
    }
  };

  if (loading) {
    return (
      <Center py="xl">
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text>Cargando clientes...</Text>
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
      <Card p="lg" radius="lg" withBorder>
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Title order={3}>Mis Clientes Asignados</Title>
            <Badge size="lg" variant="light" color="blue">
              {clients.length} cliente{clients.length !== 1 ? 's' : ''}
            </Badge>
          </Group>

          {clients.length === 0 ? (
            <Alert icon={<IconAlertCircle size={16} />} color="blue">
              Aún no tienes clientes asignados.
            </Alert>
          ) : (
            <Grid>
              {clients.map((client) => (
                <Grid.Col key={client._id} span={{ base: 12, md: 6, lg: 4 }}>
                  <Card p="lg" radius="lg" withBorder>
                    <Stack gap="md">
                      <Group gap="md">
                        <Avatar
                          src={client.profilePicture}
                          size="lg"
                          radius="xl"
                        >
                          {client.fullName.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box style={{ flex: 1 }}>
                          <Text fw={600} size="lg" mb="xs">
                            {client.fullName}
                          </Text>
                          <Text size="sm" c="dimmed" mb="xs">
                            {client.email}
                          </Text>
                          <Text size="sm" c="dimmed">
                            {client.phoneNumber}
                          </Text>
                        </Box>
                      </Group>

                      {/* Tipos de asignación */}
                      <Group gap="xs" wrap="wrap">
                        {client.asignaciones.map((asignacion, index) => (
                          <Badge
                            key={index}
                            color={getTipoAsignacionColor(asignacion.tipoAsignacion)}
                            variant="light"
                            leftSection={getTipoAsignacionIcon(asignacion.tipoAsignacion)}
                            size="sm"
                          >
                            {asignacion.tipoAsignacion}
                          </Badge>
                        ))}
                      </Group>

                      {/* Botones de acción */}
                      <Group gap="sm">
                        <Button
                          color="nutroos-green"
                          variant="light"
                          leftSection={<IconMessage size={16} />}
                          onClick={() => handleContact(client)}
                          loading={contactLoading === client._id}
                          size="sm"
                          style={{ flex: 1 }}
                        >
                          Contactar
                        </Button>
                        
                        <Tooltip label="Gestionar cliente">
                          <ActionIcon
                            color="blue"
                            variant="light"
                            onClick={() => handleManageClient(client)}
                            size="lg"
                          >
                            <IconSettings size={16} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Stack>
                  </Card>
                </Grid.Col>
              ))}
            </Grid>
          )}
        </Stack>
      </Card>
    </Stack>
  );
};

export default WorkerClientsTab;
