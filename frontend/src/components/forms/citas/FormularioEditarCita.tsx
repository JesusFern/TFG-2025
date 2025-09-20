import React, { useState, useEffect } from 'react';
import {
  Paper,
  Title,
  Select,
  Button,
  Group,
  Textarea,
  NumberInput,
  Alert,
  LoadingOverlay,
  Text,
  Card,
  Stack,
  Badge
} from '@mantine/core';
import { useForm } from '@mantine/form';
import GlobalNotificationOverlay from '../../atoms/GlobalNotificationOverlay';
import CamposFechaHoraCita from '../../atoms/CamposFechaHoraCita';
import { useThemeDetection } from '../../../hooks/useThemeDetection';
import { CitaService } from '../../../services/citaService';
import { TIPOS_CITA } from '../../../constants/citas';
import {
  Cita,
  ActualizarCitaDTO,
  TipoCita
} from '../../../types/citas';
import {
  IconUser,
  IconStethoscope,
  IconFileText,
  IconAlertCircle,
  IconInfoCircle
} from '@tabler/icons-react';

interface FormularioEditarCitaProps {
  cita: Cita;
  onSuccess: (cita: Cita) => void;
  onError: (error: Error) => void;
  onCancel: () => void;
}

const FormularioEditarCita: React.FC<FormularioEditarCitaProps> = ({
  cita,
  onSuccess,
  onError,
  onCancel
}) => {
  const [loading, setLoading] = useState(false);
  const [horariosDisponibles, setHorariosDisponibles] = useState<string[]>([]);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const isDark = useThemeDetection();


  const form = useForm({
    initialValues: {
      tipo: cita.tipo,
      fecha: new Date(cita.fecha),
      hora: cita.hora,
      duracion: cita.duracion,
      motivo: cita.motivo
    },
    validate: {
      tipo: (value) => (!value ? 'Selecciona el tipo de cita' : null),
      fecha: (value) => (!value ? 'Selecciona una fecha' : null),
      hora: (value) => (!value ? 'Selecciona una hora' : null),
      motivo: (value) => (value.length < 10 ? 'El motivo debe tener al menos 10 caracteres' : null)
    }
  });

  // Cargar profesionales disponibles
  useEffect(() => {
    const cargarProfesionales = async () => {
      try {
        await CitaService.obtenerProfesionalesDisponibles();
        // setProfesionales(profesionalesData);
      } catch (error) {
        console.error('Error al cargar profesionales:', error);
        setNotification({
          type: 'error',
          message: 'Error al cargar los profesionales disponibles'
        });
      }
    };

    cargarProfesionales();
  }, []);

  // Cargar horarios disponibles cuando cambie la fecha
  useEffect(() => {
    const cargarHorarios = async () => {
      if (form.values.fecha) {
        try {
          setLoadingHorarios(true);
          const fechaFormateada = form.values.fecha.toISOString().split('T')[0];
          const disponibilidad = await CitaService.obtenerDisponibilidadProfesional(
            cita.profesional._id,
            fechaFormateada
          );
          setHorariosDisponibles(disponibilidad.horariosDisponibles);
        } catch (error) {
          console.error('Error al cargar horarios:', error);
          setHorariosDisponibles([]);
        } finally {
          setLoadingHorarios(false);
        }
      }
    };

    cargarHorarios();
  }, [form.values.fecha, cita.profesional._id]);

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setLoading(true);
      setNotification(null);

      const datosActualizacion: ActualizarCitaDTO = {
        tipo: values.tipo,
        fecha: values.fecha.toISOString().split('T')[0],
        hora: values.hora,
        duracion: values.duracion,
        motivo: values.motivo
      };

      const citaActualizada = await CitaService.actualizarCita(cita._id, datosActualizacion);

      setNotification({
        type: 'success',
        message: 'Cita actualizada exitosamente'
      });

      setTimeout(() => {
        onSuccess(citaActualizada);
      }, 800);

    } catch (error) {
      console.error('Error al actualizar cita:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar la cita';
      setNotification({
        type: 'error',
        message: errorMessage
      });
      onError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  const getTipoCitaInfo = (tipo: TipoCita) => {
    return TIPOS_CITA.find(t => t.value === tipo);
  };


  const puedeEditar = CitaService.puedeEditarCita(cita);

  return (
    <Paper p="xl" radius="md" style={{ position: 'relative' }}>
      <LoadingOverlay visible={loading} />
      
      <Stack gap="lg">
        <div>
          <Title order={2} mb="xs" c={isDark ? 'white' : 'dark'}>
            Editar Cita
          </Title>
          <Text size="sm" c="dimmed">
            Modifica los detalles de tu cita
          </Text>
        </div>

        {notification && (
          <GlobalNotificationOverlay
            message={notification.message}
            type={notification.type}
            withCloseButton
            onClose={() => setNotification(null)}
          />
        )}

        {!puedeEditar && (
          <Alert icon={<IconAlertCircle size={16} />} color="orange">
            <Text size="sm">
              Esta cita no puede ser editada porque ya ha pasado o está en un estado que no permite modificaciones.
            </Text>
          </Alert>
        )}

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            {/* Información actual de la cita */}
            <Card withBorder p="md" bg={isDark ? 'dark.6' : 'gray.0'}>
              <Stack gap="sm">
                <Group>
                  <IconUser size={20} color="var(--mantine-color-blue-6)" />
                  <div>
                    <Text size="sm" fw={500}>Cliente</Text>
                    <Text size="sm" c="dimmed">{cita.cliente.fullName}</Text>
                  </div>
                </Group>
                
                <Group>
                  <IconStethoscope size={20} color="var(--mantine-color-green-6)" />
                  <div>
                    <Text size="sm" fw={500}>Profesional</Text>
                    <Text size="sm" c="dimmed">{cita.profesional.fullName}</Text>
                  </div>
                </Group>

                <Group>
                  <Badge color="blue" variant="light">
                    {cita.estado}
                  </Badge>
                  <Badge color="gray" variant="light">
                    {cita.tipo.replace('_', ' ')}
                  </Badge>
                </Group>
              </Stack>
            </Card>

            {/* Tipo de cita */}
            <div>
              <Text size="sm" fw={500} mb="xs">
                Tipo de Cita *
              </Text>
              <Select
                placeholder="Selecciona el tipo de cita"
                data={TIPOS_CITA.map(t => ({
                  value: t.value,
                  label: `${t.icon} ${t.label}`
                }))}
                leftSection={<IconFileText size={16} />}
                disabled={!puedeEditar}
                {...form.getInputProps('tipo')}
              />
              {form.values.tipo && (
                <Text size="xs" c="dimmed" mt={4}>
                  {getTipoCitaInfo(form.values.tipo)?.description}
                </Text>
              )}
            </div>

            {/* Fecha y hora */}
            <CamposFechaHoraCita
              fecha={form.values.fecha ? new Date(form.values.fecha) : null}
              hora={form.values.hora}
              horariosDisponibles={horariosDisponibles}
              loadingHorarios={loadingHorarios}
              disabled={!puedeEditar}
              onFechaChange={(date) => form.setFieldValue('fecha', date || new Date())}
              onHoraChange={(hora) => form.setFieldValue('hora', hora)}
            />

            {/* Duración */}
            <div>
              <Text size="sm" fw={500} mb="xs">
                Duración (minutos)
              </Text>
              <NumberInput
                placeholder="Duración en minutos"
                min={15}
                max={480}
                step={15}
                disabled={!puedeEditar}
                {...form.getInputProps('duracion')}
              />
              <Text size="xs" c="dimmed" mt={4}>
                Duración recomendada: 60 minutos
              </Text>
            </div>

            {/* Motivo */}
            <div>
              <Text size="sm" fw={500} mb="xs">
                Motivo de la cita *
              </Text>
              <Textarea
                placeholder="Describe brevemente el motivo de la cita..."
                minRows={3}
                maxRows={6}
                disabled={!puedeEditar}
                {...form.getInputProps('motivo')}
              />
              <Text size="xs" c="dimmed" mt={4}>
                Mínimo 10 caracteres. Máximo 500 caracteres.
              </Text>
            </div>

            {/* Información adicional */}
            <Alert icon={<IconInfoCircle size={16} />} color="blue">
              <Text size="sm">
                <strong>Importante:</strong> Las citas son virtuales y se realizarán mediante videollamada. 
                Recibirás un enlace de acceso antes de la cita programada.
              </Text>
            </Alert>

            {/* Botones de acción */}
            <Group justify="flex-end" mt="lg">
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancelar
              </Button>
              {puedeEditar && (
                <Button
                  type="submit"
                  disabled={loading || !form.isValid()}
                  loading={loading}
                >
                  Actualizar Cita
                </Button>
              )}
            </Group>
          </Stack>
        </form>
      </Stack>
    </Paper>
  );
};

export default FormularioEditarCita;
