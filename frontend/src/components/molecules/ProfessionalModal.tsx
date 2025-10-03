import React from 'react';
import {
  Modal,
  Stack,
  Group,
  Avatar,
  Text,
  Box,
  Divider,
  Button,
  ThemeIcon,
  Alert,
  Badge
} from '@mantine/core';
import { 
  IconUser, 
  IconUsers,
  IconStethoscope,
  IconBarbell,
  IconMail,
  IconX,
  IconStar
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { ProfessionalResponse, createAssignmentRequest, getPendingAssignmentRequests, PendingAssignmentRequest, checkAssignmentAvailability } from '../../services/userService';
import { conversacionService } from '../../services/chatService';
import { useAuth } from '../../contexts/useAuth';
import { notifications } from '@mantine/notifications';

interface ProfessionalModalProps {
  opened: boolean;
  onClose: () => void;
  professional: ProfessionalResponse | null;
  onRequestAssignment?: (professional: ProfessionalResponse) => void;
}

const ProfessionalModal: React.FC<ProfessionalModalProps> = ({
  opened,
  onClose,
  professional,
  onRequestAssignment
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [canContact, setCanContact] = React.useState(false);
  const [canRequestAssignment, setCanRequestAssignment] = React.useState(false);
  const [loadingCompatibility, setLoadingCompatibility] = React.useState(false);
  const [loadingNutritionRequest, setLoadingNutritionRequest] = React.useState(false);
  const [loadingTrainingRequest, setLoadingTrainingRequest] = React.useState(false);
  const [loadingContact, setLoadingContact] = React.useState(false);
  const [pendingRequests, setPendingRequests] = React.useState<PendingAssignmentRequest[]>([]);
  const [errorModalOpened, setErrorModalOpened] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [availableTypes, setAvailableTypes] = React.useState<string[]>([]);

  React.useEffect(() => {
    const checkCompatibility = async () => {
      if (!professional) return;
      
      setLoadingCompatibility(true);
      try {
        // Verificar disponibilidad de asignación usando el nuevo endpoint
        const availability = await checkAssignmentAvailability(professional._id);
        setAvailableTypes(availability.availableTypes);
        
        // Verificar si puede contactar (siempre puede contactar si hay tipos disponibles)
        setCanContact(availability.availableTypes.length > 0);
        
        // Verificar si puede solicitar asignación
        setCanRequestAssignment(availability.availableTypes.length > 0);
        
      } catch (error) {
        console.error('Error checking availability:', error);
        setCanContact(false);
        setCanRequestAssignment(false);
        setAvailableTypes([]);
      } finally {
        setLoadingCompatibility(false);
      }
    };

    const loadPendingRequests = async () => {
      try {
        const requests = await getPendingAssignmentRequests();
        setPendingRequests(requests);
      } catch (error) {
        console.error('Error loading pending requests:', error);
        setPendingRequests([]);
      }
    };

    if (opened && professional) {
      checkCompatibility();
      loadPendingRequests();
    }
  }, [opened, professional]);

  const getWorkerTypeIcon = (workerType: string) => {
    switch (workerType) {
      case 'Nutricionista':
        return <IconStethoscope size={20} />;
      case 'Entrenador personal':
        return <IconBarbell size={20} />;
      case 'Nutricionista y Entrenador personal':
        return <IconUsers size={20} />;
      default:
        return <IconUser size={20} />;
    }
  };

  const getWorkerTypeColor = (workerType: string) => {
    switch (workerType) {
      case 'Nutricionista':
        return 'green';
      case 'Entrenador personal':
        return 'blue';
      case 'Nutricionista y Entrenador personal':
        return 'violet';
      default:
        return 'gray';
    }
  };

  if (!professional) return null;

  // Verificar si el trabajador puede realizar asignaciones como nutricionista
  const canRequestAsNutritionist = () => {
    return availableTypes.includes('Nutricionista');
  };

  // Verificar si el trabajador puede realizar asignaciones como entrenador
  const canRequestAsTrainer = () => {
    return availableTypes.includes('Entrenador personal');
  };

  // Verificar si ya hay una solicitud pendiente como nutricionista para este trabajador
  const hasPendingNutritionRequest = () => {
    if (!professional) return false;
    return pendingRequests.some(request => 
      request.trabajadorSolicitado._id === professional._id && 
      request.tipoAsignacion === 'Nutricionista'
    );
  };

  // Verificar si ya hay una solicitud pendiente como entrenador para este trabajador
  const hasPendingTrainingRequest = () => {
    if (!professional) return false;
    return pendingRequests.some(request => 
      request.trabajadorSolicitado._id === professional._id && 
      request.tipoAsignacion === 'Entrenador personal'
    );
  };


  const handleContact = async () => {
    if (!professional || !user) return;
    
    setLoadingContact(true);
    
    try {
      // Buscar si ya existe una conversación entre el usuario y el profesional
      const conversaciones = await conversacionService.obtenerConversacionesUsuario(user._id);
      
      // Buscar conversación existente con este profesional
      const conversacionExistente = conversaciones.find(conv => 
        conv.participantes.some(p => p._id === professional._id)
      );
      
      if (conversacionExistente) {
        // Si existe, navegar a esa conversación
        navigate(`/chat?conversacion=${conversacionExistente._id}`);
        onClose();
        notifications.show({
          title: 'Conversación encontrada',
          message: `Te has unido a la conversación con ${professional.fullName}`,
          color: 'green',
        });
      } else {
        // Si no existe, crear una nueva conversación
        const nuevaConversacion = await conversacionService.crearConversacion({
          participantes: [user._id, professional._id],
          metadata: {
            tipo: 'consulta',
            tags: ['profesional', 'consulta']
          }
        });
        
        // Navegar a la nueva conversación
        navigate(`/chat?conversacion=${nuevaConversacion._id}`);
        onClose();
        notifications.show({
          title: 'Conversación creada',
          message: `Se ha creado una nueva conversación con ${professional.fullName}`,
          color: 'green',
        });
      }
    } catch (error) {
      console.error('Error al contactar profesional:', error);
      notifications.show({
        title: 'Error',
        message: 'No se pudo establecer la conversación. Inténtalo de nuevo.',
        color: 'red',
      });
    } finally {
      setLoadingContact(false);
    }
  };

  const handleRequestAsNutritionist = async () => {
    if (!professional) return;
    
    setLoadingNutritionRequest(true);
    try {
      await createAssignmentRequest({
        trabajadorSolicitado: professional._id,
        tipoAsignacion: 'Nutricionista',
        message: `Solicitud de asignación como nutricionista para ${professional.fullName}`
      });
      
      // Recargar las solicitudes pendientes
      const requests = await getPendingAssignmentRequests();
      setPendingRequests(requests);
      
      if (onRequestAssignment) {
        onRequestAssignment(professional);
      }
    } catch (error) {
      console.error('Error creating nutrition assignment request:', error);
      // Mostrar el mensaje de error del backend en un modal
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Error al crear la solicitud de asignación');
      }
      setErrorModalOpened(true);
    } finally {
      setLoadingNutritionRequest(false);
    }
  };

  const handleRequestAsTrainer = async () => {
    if (!professional) return;
    
    setLoadingTrainingRequest(true);
    try {
      await createAssignmentRequest({
        trabajadorSolicitado: professional._id,
        tipoAsignacion: 'Entrenador personal',
        message: `Solicitud de asignación como entrenador personal para ${professional.fullName}`
      });
      
      // Recargar las solicitudes pendientes
      const requests = await getPendingAssignmentRequests();
      setPendingRequests(requests);
      
      if (onRequestAssignment) {
        onRequestAssignment(professional);
      }
    } catch (error) {
      console.error('Error creating training assignment request:', error);
      // Mostrar el mensaje de error del backend en un modal
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Error al crear la solicitud de asignación');
      }
      setErrorModalOpened(true);
    } finally {
      setLoadingTrainingRequest(false);
    }
  };

  return (
    <>
    <Modal
      opened={opened}
      onClose={onClose}
      title="Detalles del Profesional"
      size="md"
      centered
      zIndex={1000}
    >
      <Stack gap="md">
        <Group gap="md">
          <Avatar
            src={professional.profilePicture}
            size="xl"
            radius="xl"
          >
            {professional.fullName.charAt(0).toUpperCase()}
          </Avatar>
          <Box style={{ flex: 1 }}>
            <Text fw={600} size="xl">
              {professional.fullName}
            </Text>
            <Group gap="xs" mt={4}>
              <ThemeIcon 
                size="sm" 
                variant="light" 
                color={getWorkerTypeColor(professional.workerType)}
              >
                {getWorkerTypeIcon(professional.workerType)}
              </ThemeIcon>
              <Text size="md" c="dimmed">
                {professional.workerType}
              </Text>
              {professional.satisfactionRating && professional.satisfactionRating > 0 ? (
                <Badge
                  color="yellow"
                  variant="light"
                  leftSection={<IconStar size={12} />}
                  size="sm"
                >
                  {professional.satisfactionRating.toFixed(1)}/5
                </Badge>
              ) : (
                <Badge
                  color="gray"
                  variant="light"
                  leftSection={<IconStar size={12} />}
                  size="sm"
                >
                  Sin calificar
                </Badge>
              )}
            </Group>
          </Box>
        </Group>

        <Divider />

        {professional.biography && (
          <Box>
            <Text fw={500} mb="xs">
              Biografía
            </Text>
            <Text size="sm">
              {professional.biography}
            </Text>
          </Box>
        )}

        {professional.availability && (
          <Box>
            <Text fw={500} mb="xs">
              Disponibilidad
            </Text>
            <Text size="sm">
              {professional.availability}
            </Text>
          </Box>
        )}


        <Group justify="center" mt="md">
          {loadingCompatibility ? (
            <Button disabled>
              Verificando...
            </Button>
          ) : (
            <>
              {canContact && (
                <Button 
                  leftSection={<IconMail size={16} />}
                  onClick={handleContact}
                  color="nutroos-green"
                  variant="light"
                  loading={loadingContact}
                >
                  Contactar
                </Button>
              )}
              {canRequestAssignment && canRequestAsNutritionist() && !hasPendingNutritionRequest() && (
                <Button 
                  leftSection={<IconStethoscope size={16} />}
                  onClick={handleRequestAsNutritionist}
                  color="nutroos-green"
                  loading={loadingNutritionRequest}
                  variant="light"
                >
                  Solicitar como Nutricionista
                </Button>
              )}
              {canRequestAssignment && canRequestAsTrainer() && !hasPendingTrainingRequest() && (
                <Button 
                  leftSection={<IconBarbell size={16} />}
                  onClick={handleRequestAsTrainer}
                  color="nutroos-green"
                  loading={loadingTrainingRequest}
                  variant="light"
                >
                  Solicitar como Entrenador
                </Button>
              )}
              {hasPendingNutritionRequest() && (
                <Button 
                  leftSection={<IconStethoscope size={16} />}
                  disabled
                  color="gray"
                  variant="light"
                >
                  Solicitud como Nutricionista Enviada
                </Button>
              )}
              {hasPendingTrainingRequest() && (
                <Button 
                  leftSection={<IconBarbell size={16} />}
                  disabled
                  color="gray"
                  variant="light"
                >
                  Solicitud como Entrenador Enviada
                </Button>
              )}
            </>
          )}
        </Group>
      </Stack>
    </Modal>

    {/* Modal de Error */}
    <Modal
      opened={errorModalOpened}
      onClose={() => setErrorModalOpened(false)}
      title="Error en la Solicitud"
      size="sm"
      centered
      zIndex={2000}
    >
      <Stack gap="md">
        <Alert
          icon={<IconX size={16} />}
          title="Error"
          color="red"
          variant="subtle"
        >
          {errorMessage}
        </Alert>
        <Group justify="center">
          <Button
            color="red"
            variant="light"
            onClick={() => setErrorModalOpened(false)}
          >
            Entendido
          </Button>
        </Group>
      </Stack>
    </Modal>
    </>
  );
};

export default ProfessionalModal;
