import React, { useState } from 'react';
import {
  Modal,
  Title,
  Text,
  Textarea,
  Group,
  Button,
  Stack,
  Alert,
  LoadingOverlay,
  Divider
} from '@mantine/core';
import { useForm } from '@mantine/form';
import GlobalNotificationOverlay from '../atoms/GlobalNotificationOverlay';
import { CitaService } from '../../services/citaService';
import { Cita, CancelarCitaDTO } from '../../types/citas';
import {
  IconAlertCircle,
  IconX,
  IconInfoCircle,
  IconCalendar,
  IconUser,
  IconStethoscope
} from '@tabler/icons-react';

interface ModalCancelarCitaProps {
  opened: boolean;
  onClose: () => void;
  cita: Cita | null;
  onConfirm: (cita: Cita) => Promise<void>;
  loading?: boolean;
}

const ModalCancelarCita: React.FC<ModalCancelarCitaProps> = ({
  opened,
  onClose,
  cita,
  onConfirm,
  loading = false
}) => {
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const form = useForm<CancelarCitaDTO>({
    initialValues: {
      motivo: ''
    },
    validate: {
      motivo: (value) => (value.length < 5 ? 'El motivo debe tener al menos 5 caracteres' : null)
    }
  });

  const handleConfirm = async () => {
    if (!cita) return;

    try {
      await onConfirm(cita);
      form.reset();
      onClose();
    } catch (error) {
      console.error('Error al cancelar cita:', error);
      setNotification({
        type: 'error',
        message: 'Error al cancelar la cita'
      });
    }
  };

  const handleClose = () => {
    form.reset();
    setNotification(null);
    onClose();
  };

  const puedeCancelar = cita ? CitaService.puedeCancelarCita(cita) : false;

  if (!cita) return null;

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap="xs">
          <IconX size={20} color="var(--mantine-color-red-6)" />
          <Title order={4}>Cancelar Cita</Title>
        </Group>
      }
      size="md"
      centered
      zIndex={1000}
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

          {!puedeCancelar && (
            <Alert icon={<IconAlertCircle size={16} />} color="orange">
              <Text size="sm">
                Esta cita no puede ser cancelada porque ya ha pasado o está en un estado que no permite cancelación.
              </Text>
            </Alert>
          )}

          {/* Información de la cita */}
          <Stack gap="sm">
            <Group gap="xs">
              <IconCalendar size={16} color="var(--mantine-color-blue-6)" />
              <Text size="sm" fw={500}>
                {CitaService.formatearFecha(cita.fecha)} a las {CitaService.formatearHora(cita.hora)}
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
          </Stack>

          <Divider />

          {/* Formulario de cancelación */}
          <form onSubmit={form.onSubmit(handleConfirm)}>
            <Stack gap="md">
              <div>
                <Text size="sm" fw={500} mb="xs">
                  Motivo de la cancelación *
                </Text>
                <Textarea
                  placeholder="Explica brevemente por qué cancelas esta cita..."
                  minRows={3}
                  maxRows={6}
                  disabled={!puedeCancelar}
                  {...form.getInputProps('motivo')}
                />
                <Text size="xs" c="dimmed" mt={4}>
                  Mínimo 5 caracteres. Máximo 500 caracteres.
                </Text>
              </div>

              <Alert icon={<IconInfoCircle size={16} />} color="blue">
                <Text size="sm">
                  <strong>Importante:</strong> Una vez cancelada, esta cita no podrá ser recuperada. 
                  Si necesitas reagendar, considera usar la opción "Reagendar" en su lugar.
                </Text>
              </Alert>

              <Group justify="flex-end" mt="md">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  color="red"
                  type="submit"
                  disabled={!puedeCancelar || !form.isValid() || loading}
                  loading={loading}
                >
                  Confirmar Cancelación
                </Button>
              </Group>
            </Stack>
          </form>
        </Stack>
      </div>
    </Modal>
  );
};

export default ModalCancelarCita;
