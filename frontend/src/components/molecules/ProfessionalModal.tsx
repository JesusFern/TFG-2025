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
  Alert
} from '@mantine/core';
import { 
  IconUser, 
  IconUsers,
  IconStethoscope,
  IconBarbell,
  IconMail,
  IconX
} from '@tabler/icons-react';
import { ProfessionalResponse, checkWorkerCompatibility, createAssignmentRequest, getPendingAssignmentRequests, PendingAssignmentRequest, checkAssignmentAvailability, AssignmentAvailabilityResponse } from '../../services/userService';

interface ProfessionalModalProps {
  opened: boolean;
  onClose: () => void;
  professional: ProfessionalResponse | null;
  onContact?: (professional: ProfessionalResponse) => void;
  onRequestAssignment?: (professional: ProfessionalResponse) => void;
}

const ProfessionalModal: React.FC<ProfessionalModalProps> = ({
  opened,
  onClose,
  professional,
  onContact,
  onRequestAssignment
}) => {
  if (!professional) return null;

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

  const [canContact, setCanContact] = React.useState(false);
  const [canRequestAssignment, setCanRequestAssignment] = React.useState(false);
  const [loadingCompatibility, setLoadingCompatibility] = React.useState(false);
  const [loadingNutritionRequest, setLoadingNutritionRequest] = React.useState(false);
  const [loadingTrainingRequest, setLoadingTrainingRequest] = React.useState(false);
  const [pendingRequests, setPendingRequests] = React.useState<PendingAssignmentRequest[]>([]);
  const [errorModalOpened, setErrorModalOpened] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [availableTypes, setAvailableTypes] = React.useState<string[]>([]);
  const [assignmentAvailability, setAssignmentAvailability] = React.useState<AssignmentAvailabilityResponse | null>(null);

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

  React.useEffect(() => {
    const checkCompatibility = async () => {
      if (!professional) return;
      
      setLoadingCompatibility(true);
      try {
        // Verificar disponibilidad de asignación usando el nuevo endpoint
        const availability = await checkAssignmentAvailability(professional._id);
        setAssignmentAvailability(availability);
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
        setAssignmentAvailability(null);
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
      // Resetear los estados de carga cuando se abre el modal
      setLoadingNutritionRequest(false);
      setLoadingTrainingRequest(false);
    }
  }, [opened, professional]);

  const handleContact = () => {
    if (onContact && professional) {
      onContact(professional);
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
