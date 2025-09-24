import React, { useState, useEffect, useCallback } from 'react';
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
  Divider,
  Grid,
  Select
} from '@mantine/core';
import { useForm } from '@mantine/form';
import DatePickerInput from '../atoms/DatePickerInput';
import GlobalNotificationOverlay from '../atoms/GlobalNotificationOverlay';
import { CitaService } from '../../services/citaService';
import { Cita, ReagendarCitaDTO } from '../../types/citas';
import {
  IconRefresh,
  IconCalendar,
  IconUser,
  IconStethoscope,
  IconAlertCircle,
  IconInfoCircle
} from '@tabler/icons-react';

interface ModalReagendarCitaProps {
  opened: boolean;
  onClose: () => void;
  cita: Cita | null;
  onConfirm: (cita: Cita, datos: ReagendarCitaDTO) => Promise<void>;
  loading?: boolean;
}

const ModalReagendarCita: React.FC<ModalReagendarCitaProps> = ({
  opened,
  onClose,
  cita,
  onConfirm,
  loading = false
}) => {
  const [horariosDisponibles, setHorariosDisponibles] = useState<string[]>([]);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const form = useForm<ReagendarCitaDTO>({
    initialValues: {
      nuevaFecha: '',
      nuevaHora: '',
      motivo: ''
    },
    validate: {
      nuevaFecha: (value) => (!value ? 'Selecciona una nueva fecha' : null),
      nuevaHora: (value) => (!value ? 'Selecciona una nueva hora' : null),
      motivo: (value) => (value && value.length > 500 ? 'El motivo no puede exceder 500 caracteres' : null)
    }
  });

  // Cargar horarios disponibles cuando cambie la fecha
  const cargarHorarios = useCallback(async () => {
    if (form.values.nuevaFecha && cita) {
      try {
        setLoadingHorarios(true);
        const disponibilidad = await CitaService.obtenerDisponibilidadProfesional(
          cita.profesional._id,
          form.values.nuevaFecha
        );
        setHorariosDisponibles(disponibilidad.horariosDisponibles);
        
        // Limpiar la hora seleccionada si no está disponible
        if (form.values.nuevaHora && !disponibilidad.horariosDisponibles.includes(form.values.nuevaHora)) {
          form.setFieldValue('nuevaHora', '');
        }
      } catch (error) {
        console.error('Error al cargar horarios:', error);
        setHorariosDisponibles([]);
        setNotification({
          type: 'error',
          message: 'Error al cargar horarios disponibles'
        });
      } finally {
        setLoadingHorarios(false);
      }
    }
  }, [cita, form]);

  useEffect(() => {
    cargarHorarios();
  }, [cargarHorarios]);

  const handleConfirm = async () => {
    if (!cita) return;

    try {
      await onConfirm(cita, form.values);
      form.reset();
      setHorariosDisponibles([]);
      onClose();
    } catch (error) {
      console.error('Error al reagendar cita:', error);
      setNotification({
        type: 'error',
        message: 'Error al reagendar la cita'
      });
    }
  };

  const handleClose = () => {
    form.reset();
    setHorariosDisponibles([]);
    setNotification(null);
    onClose();
  };

  const puedeReagendar = cita ? CitaService.puedeReagendarCita(cita) : false;


  if (!cita) return null;

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      zIndex={1000}
      title={
        <Group gap="xs">
          <IconRefresh size={20} color="var(--mantine-color-orange-6)" />
          <Title order={4}>Reagendar Cita</Title>
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

          {!puedeReagendar && (
            <Alert icon={<IconAlertCircle size={16} />} color="orange">
              <Text size="sm">
                Esta cita no puede ser reagendada porque ya ha pasado o está en un estado que no permite reagendación.
              </Text>
            </Alert>
          )}

          {/* Información actual de la cita */}
          <Stack gap="sm">
            <Text size="sm" fw={600} c="dimmed">Cita actual:</Text>
            
            <Group gap="xs">
              <IconCalendar size={16} color="var(--mantine-color-blue-6)" />
              <Text size="sm">
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

          {/* Formulario de reagendación */}
          <form onSubmit={form.onSubmit(handleConfirm)}>
            <Stack gap="md">
              <div>
                <Text size="sm" fw={600} mb="md" c="dimmed">Nueva fecha y hora:</Text>
                
                <Grid>
                  <Grid.Col span={6}>
                    <div>
                      <Text size="sm" fw={500} mb="xs">
                        Nueva Fecha *
                      </Text>
                      <DatePickerInput
                        placeholder="Selecciona una fecha"
                        value={form.values.nuevaFecha ? new Date(form.values.nuevaFecha) : null}
                        onChange={(date: Date | null) => form.setFieldValue('nuevaFecha', date ? date.toISOString().split('T')[0] : '')}
                        minDate={new Date()}
                        maxDate={new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)} // 3 meses
                        disabled={!puedeReagendar}
                      />
                    </div>
                  </Grid.Col>
                  
                  <Grid.Col span={6}>
                    <div>
                      <Text size="sm" fw={500} mb="xs">
                        Nueva Hora *
                      </Text>
                      <Select
                        placeholder="Selecciona una hora"
                        data={horariosDisponibles.map(h => ({
                          value: h,
                          label: h
                        }))}
                        disabled={!puedeReagendar || !form.values.nuevaFecha || loadingHorarios}
                        {...form.getInputProps('nuevaHora')}
                      />
                      {loadingHorarios && (
                        <Text size="xs" c="dimmed" mt={4}>
                          Cargando horarios disponibles...
                        </Text>
                      )}
                      {!form.values.nuevaFecha && (
                        <Text size="xs" c="dimmed" mt={4}>
                          Selecciona primero una fecha
                        </Text>
                      )}
                    </div>
                  </Grid.Col>
                </Grid>
              </div>

              <div>
                <Text size="sm" fw={500} mb="xs">
                  Motivo del reagendamiento (opcional)
                </Text>
                <Textarea
                  placeholder="Explica brevemente por qué reagendas esta cita..."
                  minRows={3}
                  maxRows={4}
                  disabled={!puedeReagendar}
                  {...form.getInputProps('motivo')}
                />
                <Text size="xs" c="dimmed" mt={4}>
                  Máximo 500 caracteres.
                </Text>
              </div>

              <Alert icon={<IconInfoCircle size={16} />} color="blue">
                <Text size="sm">
                  <strong>Importante:</strong> Al reagendar se creará una nueva cita y la cita actual se marcará como "reagendada". 
                  Recibirás confirmación de ambos cambios.
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
                  color="orange"
                  type="submit"
                  disabled={!puedeReagendar || !form.isValid() || loading}
                  loading={loading}
                  leftSection={<IconRefresh size={16} />}
                >
                  Reagendar Cita
                </Button>
              </Group>
            </Stack>
          </form>
        </Stack>
      </div>
    </Modal>
  );
};

export default ModalReagendarCita;
