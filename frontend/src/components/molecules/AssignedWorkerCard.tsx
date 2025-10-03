import React, { useState } from 'react';
import {
  Card,
  Text,
  Group,
  Stack,
  Button,
  Avatar,
  Badge,
  Box,
  Modal
} from '@mantine/core';
import {
  IconMessage,
  IconStar,
  IconCalendar,
  IconChefHat,
  IconBarbell,
  IconUser
} from '@tabler/icons-react';
import { AssignedWorker } from '../../services/userService';
import { notifications } from '@mantine/notifications';
import { useWorkerRating } from '../../hooks/useWorkerRating';
import ValoracionForm from './ValoracionForm';

interface AssignedWorkerCardProps {
  worker: AssignedWorker;
  onContact: (worker: AssignedWorker) => void;
  onAppointment: (worker: AssignedWorker) => void;
  contactLoading?: boolean;
}

const AssignedWorkerCard: React.FC<AssignedWorkerCardProps> = ({
  worker,
  onContact,
  onAppointment,
  contactLoading = false
}) => {
  const [ratingModal, setRatingModal] = useState<{
    opened: boolean;
    tipoAsignacion: string;
  }>({
    opened: false,
    tipoAsignacion: ''
  });

  // Hook para obtener la calificación en tiempo real
  const { satisfactionRating } = useWorkerRating({
    workerId: worker._id,
    enabled: true
  });

  const getWorkerTypeIcon = (workerType: string) => {
    if (workerType.includes('Nutricionista') && workerType.includes('Entrenador')) {
      return <IconUser size={20} />;
    } else if (workerType.includes('Nutricionista')) {
      return <IconChefHat size={20} />;
    } else if (workerType.includes('Entrenador')) {
      return <IconBarbell size={20} />;
    }
    return <IconUser size={20} />;
  };

  const getWorkerTypeColor = (workerType: string) => {
    if (workerType.includes('Nutricionista') && workerType.includes('Entrenador')) {
      return 'purple';
    } else if (workerType.includes('Nutricionista')) {
      return 'green';
    } else if (workerType.includes('Entrenador')) {
      return 'blue';
    }
    return 'gray';
  };

  const handleRateClick = (tipoAsignacion: string) => {
    console.log('Calificar trabajador:', worker.fullName, 'Tipo:', tipoAsignacion);
    setRatingModal({
      opened: true,
      tipoAsignacion
    });
  };

  // Generar tipos disponibles basados en las asignaciones del worker
  const tiposDisponibles = worker.asignaciones?.map(asignacion => ({
    tipo: asignacion.tipoAsignacion,
    puedeValorar: true,
    yaValorado: false // Por ahora siempre false, se podría verificar si ya valoró
  })) || [];

  console.log('Worker asignaciones:', worker.asignaciones);
  console.log('Tipos disponibles:', tiposDisponibles);


  return (
    <>
      <Card p="lg" radius="lg" withBorder>
        <Stack gap="md">
          <Group justify="space-between" align="flex-start">
            <Group gap="md">
              <Avatar
                src={worker.profilePicture}
                size="lg"
                radius="xl"
              >
                {worker.fullName.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Text fw={600} size="lg" mb="xs">
                  {worker.fullName}
                </Text>
                <Text size="sm" c="dimmed" mb="xs">
                  {worker.email}
                </Text>
                <Group gap="xs" align="center" mb="xs">
                  <Badge
                    color={getWorkerTypeColor(worker.workerType)}
                    variant="light"
                    leftSection={getWorkerTypeIcon(worker.workerType)}
                    size="md"
                  >
                    {worker.workerType}
                  </Badge>
                  {satisfactionRating && satisfactionRating > 0 ? (
                    <Badge
                      color="yellow"
                      variant="light"
                      leftSection={<IconStar size={14} />}
                      size="md"
                    >
                      {satisfactionRating.toFixed(1)}/5
                    </Badge>
                  ) : (
                    <Badge
                      color="gray"
                      variant="light"
                      leftSection={<IconStar size={14} />}
                      size="md"
                    >
                      Sin calificar
                    </Badge>
                  )}
                </Group>
              </Box>
            </Group>
          </Group>

          {worker.biography && (
            <Text size="sm" c="dimmed" lineClamp={2}>
              {worker.biography}
            </Text>
          )}

          <Group gap="xs" wrap="wrap">
            {worker.asignaciones.map((asignacion, index) => (
              <Badge
                key={index}
                color={asignacion.tipoAsignacion === 'Nutricionista' ? 'green' : 'blue'}
                variant="outline"
                size="sm"
              >
                {asignacion.tipoAsignacion}
              </Badge>
            ))}
          </Group>

          <Group justify="space-between" align="center">
            <Group gap="sm">
              <Button
                color="nutroos-green"
                variant="light"
                leftSection={<IconMessage size={16} />}
                onClick={() => onContact(worker)}
                loading={contactLoading}
                size="sm"
              >
                Contactar
              </Button>
              
              <Button
                color="blue"
                variant="light"
                leftSection={<IconStar size={16} />}
                onClick={() => {
                  const tipoAsignacion = worker.asignaciones && worker.asignaciones.length > 0 
                    ? worker.asignaciones[0].tipoAsignacion 
                    : 'Nutricionista';
                  handleRateClick(tipoAsignacion);
                }}
                size="sm"
              >
                Calificar
              </Button>
              
              <Button
                color="orange"
                variant="light"
                leftSection={<IconCalendar size={16} />}
                onClick={() => onAppointment(worker)}
                size="sm"
              >
                Pedir Cita
              </Button>
            </Group>
          </Group>
        </Stack>
      </Card>

      {/* Modal de Valoración */}
      <Modal
        opened={ratingModal.opened}
        onClose={() => setRatingModal({ opened: false, tipoAsignacion: '' })}
        title="Calificar Trabajador"
        size="md"
        centered
      >
        <ValoracionForm
          opened={ratingModal.opened}
          onClose={() => setRatingModal({ opened: false, tipoAsignacion: '' })}
          onSuccess={() => {
            notifications.show({
              title: 'Valoración enviada',
              message: 'Tu valoración ha sido enviada correctamente',
              color: 'green',
            });
            setRatingModal({ opened: false, tipoAsignacion: '' });
          }}
          trabajadorId={worker._id}
          trabajadorName={worker.fullName}
          tiposDisponibles={tiposDisponibles}
        />
      </Modal>
    </>
  );
};

export default AssignedWorkerCard;
