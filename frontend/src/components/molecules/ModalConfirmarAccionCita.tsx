import React, { useState } from 'react';
import {
  Modal,
  Title,
  Text,
  Group,
  Button,
  Stack,
  Alert,
  LoadingOverlay,
  Divider,
  Badge
} from '@mantine/core';
import GlobalNotificationOverlay from '../atoms/GlobalNotificationOverlay';
import { CitaService } from '../../services/citaService';
import { Cita } from '../../types/citas';
import {
  IconCheck,
  IconCalendar,
  IconUser,
  IconStethoscope,
  IconAlertCircle,
  IconInfoCircle,
  IconVideo
} from '@tabler/icons-react';

interface ModalConfirmarAccionCitaProps {
  opened: boolean;
  onClose: () => void;
  cita: Cita | null;
  accion: 'confirmar' | 'completar' | 'unirse';
  onConfirm: (cita: Cita) => Promise<void>;
  loading?: boolean;
}

const ModalConfirmarAccionCita: React.FC<ModalConfirmarAccionCitaProps> = ({
  opened,
  onClose,
  cita,
  accion,
  onConfirm,
  loading = false
}) => {
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const handleConfirm = async () => {
    if (!cita) return;

    try {
      await onConfirm(cita);
      onClose();
    } catch (error) {
      console.error(`Error al ${accion} cita:`, error);
      setNotification({
        type: 'error',
        message: `Error al ${accion} la cita`
      });
    }
  };

  const handleClose = () => {
    setNotification(null);
    onClose();
  };

  const getAccionInfo = () => {
    switch (accion) {
      case 'confirmar':
        return {
          icon: <IconCheck size={20} color="var(--mantine-color-green-6)" />,
          title: 'Confirmar Cita',
          description: '¿Estás seguro de que quieres confirmar esta cita?',
          buttonText: 'Confirmar',
          buttonColor: 'green',
          alertMessage: 'Al confirmar, el cliente será notificado de que la cita está confirmada.'
        };
      case 'completar':
        return {
          icon: <IconCheck size={20} color="var(--mantine-color-blue-6)" />,
          title: 'Completar Cita',
          description: '¿Has terminado esta cita y quieres marcarla como completada?',
          buttonText: 'Completar',
          buttonColor: 'blue',
          alertMessage: 'Al completar, la cita se marcará como finalizada y se generará un resumen.'
        };
      case 'unirse':
        return {
          icon: <IconVideo size={20} color="var(--mantine-color-purple-6)" />,
          title: 'Unirse a Videollamada',
          description: '¿Quieres unirte a la videollamada de esta cita?',
          buttonText: 'Unirse',
          buttonColor: 'purple',
          alertMessage: 'Se abrirá la videollamada en una nueva ventana.'
        };
      default:
        return {
          icon: <IconCheck size={20} />,
          title: 'Confirmar Acción',
          description: '¿Estás seguro de realizar esta acción?',
          buttonText: 'Confirmar',
          buttonColor: 'blue',
          alertMessage: ''
        };
    }
  };

  const accionInfo = getAccionInfo();

  if (!cita) return null;

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap="xs">
          {accionInfo.icon}
          <Title order={4}>{accionInfo.title}</Title>
        </Group>
      }
      size="md"
      centered
    >
      <div style={{ position: 'relative' }}>
        <LoadingOverlay visible={loading} />
        
        <Stack gap="md">
          {notification && (
            <GlobalNotificationOverlay
              message={notification.message}
              type={notification.type}
              withCloseButton
              onClose={() => setNotification(null)}
            />
          )}

          <Text size="sm" c="dimmed">
            {accionInfo.description}
          </Text>

          {/* Información de la cita */}
          <Stack gap="sm">
            <Group gap="xs">
              <IconCalendar size={16} color="var(--mantine-color-blue-6)" />
              <Text size="sm">
                <strong>Fecha:</strong> {CitaService.formatearFecha(cita.fecha)} a las {CitaService.formatearHora(cita.hora)}
              </Text>
            </Group>
            
            <Group gap="xs">
              <IconUser size={16} color="var(--mantine-color-green-6)" />
              <Text size="sm">
                <strong>Cliente:</strong> {cita.cliente.fullName}
              </Text>
            </Group>
            
            <Group gap="xs">
              <IconStethoscope size={16} color="var(--mantine-color-purple-6)" />
              <Text size="sm">
                <strong>Profesional:</strong> {cita.profesional.fullName}
              </Text>
            </Group>

            <Group gap="xs">
              <Badge color="blue" variant="light">
                {cita.tipo.replace('_', ' ')}
              </Badge>
              <Badge color="gray" variant="light">
                {cita.duracion} minutos
              </Badge>
            </Group>
          </Stack>

          {cita.motivo && (
            <div>
              <Text size="sm" fw={500} mb="xs">Motivo:</Text>
              <Text size="sm" c="dimmed" pl="md">
                {cita.motivo}
              </Text>
            </div>
          )}

          <Divider />

          {accionInfo.alertMessage && (
            <Alert icon={<IconInfoCircle size={16} />} color="blue">
              <Text size="sm">
                {accionInfo.alertMessage}
              </Text>
            </Alert>
          )}

          {/* Validaciones específicas */}
          {accion === 'unirse' && (
            <Alert icon={<IconAlertCircle size={16} />} color="yellow">
              <Text size="sm">
                <strong>Atención:</strong> Asegúrate de que sea la hora correcta de la cita antes de unirte.
              </Text>
            </Alert>
          )}

          <Group justify="flex-end" mt="md">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              color={accionInfo.buttonColor}
              onClick={handleConfirm}
              disabled={loading}
              loading={loading}
            >
              {accionInfo.buttonText}
            </Button>
          </Group>
        </Stack>
      </div>
    </Modal>
  );
};

export default ModalConfirmarAccionCita;
