import React, { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Text,
  Stack,
  Group,
  Card,
  Avatar,
  Badge,
  Button,
  Loader,
  Center,
  Alert,
  Modal,
  Divider,
  Box
} from '@mantine/core';
import {
  IconUser,
  IconStethoscope,
  IconBarbell,
  IconCheck,
  IconX,
  IconClock,
  IconAlertCircle,
  IconTrash,
  IconMessage
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  getAssignmentRequests, 
  updateAssignmentRequestStatus, 
  cancelAssignmentRequest,
  AssignmentRequestFull 
} from '../services/userService';
import { conversacionService } from '../services/chatService';
import { notifications } from '@mantine/notifications';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const RequestsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<AssignmentRequestFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [contactLoading, setContactLoading] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    opened: boolean;
    requestId: string;
    action: 'accept' | 'reject' | 'cancel';
    requestType: string;
    userName: string;
  }>({
    opened: false,
    requestId: '',
    action: 'accept',
    requestType: '',
    userName: ''
  });

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAssignmentRequests();
      setRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar solicitudes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const getStatusColor = () => {
    return 'blue'; 
  };

  const getStatusIcon = () => {
    return <IconClock size={16} />;
  };

  const getAssignmentTypeIcon = (type: string) => {
    switch (type) {
      case 'Nutricionista':
        return <IconStethoscope size={20} />;
      case 'Entrenador personal':
        return <IconBarbell size={20} />;
      default:
        return <IconUser size={20} />;
    }
  };

  const handleAction = async (requestId: string, action: 'accept' | 'reject' | 'cancel') => {
    try {
      setActionLoading(requestId);
      
      if (action === 'cancel') {
        await cancelAssignmentRequest(requestId);
      } else {
        const status = action === 'accept' ? 'aceptada' : 'rechazada';
        await updateAssignmentRequestStatus(requestId, status);
      }
      
      // Recargar las solicitudes
      await loadRequests();
      setConfirmModal({ ...confirmModal, opened: false });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar la acción');
    } finally {
      setActionLoading(null);
    }
  };

  const handleContact = async (request: AssignmentRequestFull) => {
    if (!user) return;
    
    // Determinar el ID del otro participante según el rol del usuario
    const otherParticipantId = user.role === 'user' 
      ? request.trabajadorSolicitado._id 
      : request.usuarioSolicitante._id;
    
    const otherParticipantName = user.role === 'user' 
      ? request.trabajadorSolicitado.fullName 
      : request.usuarioSolicitante.fullName;
    
    setContactLoading(request._id);
    
    try {
      // Buscar si ya existe una conversación entre el usuario y el otro participante
      const conversaciones = await conversacionService.obtenerConversacionesUsuario(user._id);
      
      // Buscar conversación existente con este participante
      const conversacionExistente = conversaciones.find(conv => 
        conv.participantes.some(p => p._id === otherParticipantId)
      );
      
      if (conversacionExistente) {
        // Si existe, navegar a esa conversación
        navigate(`/chat?conversacion=${conversacionExistente._id}`);
        notifications.show({
          title: 'Conversación encontrada',
          message: `Te has unido a la conversación con ${otherParticipantName}`,
          color: 'green',
        });
      } else {
        // Si no existe, crear una nueva conversación
        const nuevaConversacion = await conversacionService.crearConversacion({
          participantes: [user._id, otherParticipantId],
          metadata: {
            tipo: 'consulta',
            tags: ['solicitud', 'asignacion']
          }
        });
        
        // Navegar a la nueva conversación
        navigate(`/chat?conversacion=${nuevaConversacion._id}`);
        notifications.show({
          title: 'Conversación creada',
          message: `Se ha creado una nueva conversación con ${otherParticipantName}`,
          color: 'green',
        });
      }
    } catch (error) {
      console.error('Error al contactar:', error);
      notifications.show({
        title: 'Error',
        message: 'No se pudo establecer la conversación. Inténtalo de nuevo.',
        color: 'red',
      });
    } finally {
      setContactLoading(null);
    }
  };

  const openConfirmModal = (
    requestId: string, 
    action: 'accept' | 'reject' | 'cancel',
    requestType: string,
    userName: string
  ) => {
    setConfirmModal({
      opened: true,
      requestId,
      action,
      requestType,
      userName
    });
  };

  const getActionText = (action: string) => {
    switch (action) {
      case 'accept':
        return 'aceptar';
      case 'reject':
        return 'rechazar';
      case 'cancel':
        return 'cancelar';
      default:
        return 'procesar';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'accept':
        return 'green';
      case 'reject':
        return 'red';
      case 'cancel':
        return 'orange';
      default:
        return 'blue';
    }
  };

  if (loading) {
    return (
      <Container size="lg" py="xl">
        <Center>
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text>Cargando solicitudes...</Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="lg" py="xl">
        <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Box>
          <Title order={1} mb="xs">
            {user?.role === 'worker' ? 'Solicitudes Recibidas' : 'Mis Solicitudes'}
          </Title>
          <Text c="dimmed" size="lg">
            {user?.role === 'worker' 
              ? 'Gestiona las solicitudes de asignación que has recibido'
              : 'Revisa el estado de tus solicitudes de asignación'
            }
          </Text>
        </Box>

        {requests.length === 0 ? (
          <Card p="xl" radius="lg" withBorder>
            <Stack align="center" gap="md">
              <IconUser size={48} color="gray" />
              <Title order={3} c="dimmed">
                No hay solicitudes
              </Title>
              <Text c="dimmed" ta="center">
                {user?.role === 'worker' 
                  ? 'No has recibido ninguna solicitud de asignación aún'
                  : 'No has enviado ninguna solicitud de asignación aún'
                }
              </Text>
            </Stack>
          </Card>
        ) : (
          <Stack gap="md">
            {requests.map((request) => (
              <Card key={request._id} p="lg" radius="lg" withBorder>
                <Stack gap="md">
                  <Group justify="space-between" align="flex-start">
                    <Group gap="md">
                      <Avatar
                        src={user?.role === 'worker' 
                          ? request.usuarioSolicitante.profilePicture 
                          : request.trabajadorSolicitado.profilePicture
                        }
                        size="lg"
                        radius="xl"
                      >
                        {(user?.role === 'worker' 
                          ? request.usuarioSolicitante.fullName 
                          : request.trabajadorSolicitado.fullName
                        ).charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Title order={4} mb="xs">
                          {user?.role === 'worker' 
                            ? request.usuarioSolicitante.fullName
                            : request.trabajadorSolicitado.fullName
                          }
                        </Title>
                        <Text size="sm" c="dimmed" mb="xs">
                          {user?.role === 'worker' 
                            ? request.usuarioSolicitante.email
                            : request.trabajadorSolicitado.email
                          }
                        </Text>
                        <Group gap="xs" align="center">
                          <Text size="sm" c="dimmed">
                            Solicitado como:
                          </Text>
                          <Badge
                            color={request.tipoAsignacion === 'Nutricionista' ? 'nutroos-green' : 'blue'}
                            variant="light"
                            leftSection={getAssignmentTypeIcon(request.tipoAsignacion)}
                            size="md"
                          >
                            {request.tipoAsignacion}
                          </Badge>
                        </Group>
                      </Box>
                    </Group>
                    
                    <Group gap="sm">
                      <Badge
                        color={getStatusColor()}
                        variant="light"
                        leftSection={getStatusIcon()}
                      >
                        Pendiente
                      </Badge>
                    </Group>
                  </Group>

                  <Divider />

                  <Group justify="space-between" align="center">
                    <Text size="sm" c="dimmed">
                      Enviada el {format(new Date(request.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </Text>
                    
                    {(
                      <Group gap="sm">
                        {/* Botón de Contactar - visible para ambos roles */}
                        <Button
                          color="nutroos-green"
                          variant="light"
                          leftSection={<IconMessage size={16} />}
                          onClick={() => handleContact(request)}
                          loading={contactLoading === request._id}
                        >
                          Contactar
                        </Button>
                        
                        {user?.role === 'worker' ? (
                          <>
                            <Button
                              color="green"
                              variant="light"
                              leftSection={<IconCheck size={16} />}
                              onClick={() => openConfirmModal(
                                request._id, 
                                'accept', 
                                request.tipoAsignacion,
                                request.usuarioSolicitante.fullName
                              )}
                              loading={actionLoading === request._id}
                            >
                              Aceptar
                            </Button>
                            <Button
                              color="red"
                              variant="light"
                              leftSection={<IconX size={16} />}
                              onClick={() => openConfirmModal(
                                request._id, 
                                'reject', 
                                request.tipoAsignacion,
                                request.usuarioSolicitante.fullName
                              )}
                              loading={actionLoading === request._id}
                            >
                              Rechazar
                            </Button>
                          </>
                        ) : (
                          <Button
                            color="orange"
                            variant="light"
                            leftSection={<IconTrash size={16} />}
                            onClick={() => openConfirmModal(
                              request._id, 
                              'cancel', 
                              request.tipoAsignacion,
                              request.trabajadorSolicitado.fullName
                            )}
                            loading={actionLoading === request._id}
                          >
                            Cancelar
                          </Button>
                        )}
                      </Group>
                    )}
                  </Group>
                </Stack>
              </Card>
            ))}
          </Stack>
        )}
      </Stack>

      {/* Modal de Confirmación */}
      <Modal
        opened={confirmModal.opened}
        onClose={() => setConfirmModal({ ...confirmModal, opened: false })}
        title={`Confirmar ${getActionText(confirmModal.action)}`}
        size="sm"
        centered
      >
        <Stack gap="md">
          <Text>
            ¿Estás seguro de que quieres {getActionText(confirmModal.action)} la solicitud de{' '}
            <Text component="span" fw={500}>
              {confirmModal.requestType}
            </Text>{' '}
            de{' '}
            <Text component="span" fw={500}>
              {confirmModal.userName}
            </Text>
            ?
          </Text>
          
          <Group justify="flex-end" gap="sm">
            <Button
              color={getActionColor(confirmModal.action)}
              onClick={() => handleAction(
                confirmModal.requestId, 
                confirmModal.action
              )}
              loading={actionLoading === confirmModal.requestId}
            >
              {getActionText(confirmModal.action).charAt(0).toUpperCase() + 
               getActionText(confirmModal.action).slice(1)}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
};

export default RequestsPage;
