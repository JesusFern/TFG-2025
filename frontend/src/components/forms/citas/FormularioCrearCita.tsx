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
} from '@mantine/core';
import { useForm } from '@mantine/form';
import GlobalNotificationOverlay from '../../atoms/GlobalNotificationOverlay';
import CamposFechaHoraCita from '../../atoms/CamposFechaHoraCita';
import { useThemeDetection } from '../../../hooks/useThemeDetection';
import { useAuth } from '../../../contexts/useAuth';
import { CitaService } from '../../../services/citaService';
import { TIPOS_CITA } from '../../../constants/citas';
import {
  Cita,
  CrearCitaDTO,
  FormularioNuevaCita,
  TipoCita,
  ProfesionalCita
} from '../../../types/citas';
import {
  IconUser,
  IconStethoscope,
  IconFileText,
  IconInfoCircle
} from '@tabler/icons-react';

interface FormularioCrearCitaProps {
  onSuccess: (cita: Cita) => void;
  onError: (error: Error) => void;
  clienteId?: string;
  clienteNombre?: string;
  profesionalId?: string; // Si viene pre-seleccionado
}

const FormularioCrearCita: React.FC<FormularioCrearCitaProps> = ({
  onSuccess,
  onError,
  clienteId,
  clienteNombre: initialClienteNombre,
  profesionalId
}) => {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profesionales, setProfesionales] = useState<ProfesionalCita[]>([]);
  const [horariosDisponibles, setHorariosDisponibles] = useState<string[]>([]);
  const [loadingProfesionales, setLoadingProfesionales] = useState(true);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const isDark = useThemeDetection();


  const form = useForm<FormularioNuevaCita>({
    initialValues: {
      profesional: profesionalId || '',
      tipo: 'seguimiento' as TipoCita,
      fecha: null,
      hora: '',
      duracion: 60,
      motivo: ''
    },
    validate: {
      profesional: (value) => (!value ? 'Selecciona un profesional' : null),
      tipo: (value) => (!value ? 'Selecciona el tipo de cita' : null),
      fecha: (value) => (!value ? 'Selecciona una fecha' : null),
      hora: (value) => (!value ? 'Selecciona una hora' : null),
      motivo: (value) => (value.length < 10 ? 'El motivo debe tener al menos 10 caracteres' : null)
    }
  });

  // Cargar profesionales asignados al cliente
  useEffect(() => {
    const cargarProfesionales = async () => {
      if (!clienteId) return;
      
      try {
        setLoadingProfesionales(true);
        const profesionalesData = await CitaService.obtenerProfesionalesAsignados(clienteId);
        setProfesionales(profesionalesData);
        
        // Si no hay profesionales asignados, mostrar mensaje
        if (profesionalesData.length === 0) {
          setNotification({
            type: 'info',
            message: 'No hay profesionales asignados a este cliente. Contacta con un administrador.'
          });
        }
      } catch (error) {
        console.error('Error al cargar profesionales asignados:', error);
        setNotification({
          type: 'error',
          message: 'Error al cargar los profesionales asignados'
        });
      } finally {
        setLoadingProfesionales(false);
      }
    };

    cargarProfesionales();
  }, [clienteId]);

  // Cargar horarios disponibles cuando cambie la fecha y profesional
  const selectedProfesionalId = form.values.profesional;
  const fechaTimestamp = form.values.fecha ? form.values.fecha.getTime() : null;
  
  useEffect(() => {
    const cargarHorarios = async () => {
      if (selectedProfesionalId && form.values.fecha) {
        try {
          setLoadingHorarios(true);
          const fechaFormateada = form.values.fecha.toISOString().split('T')[0];
          const disponibilidad = await CitaService.obtenerDisponibilidadProfesional(
            selectedProfesionalId,
            fechaFormateada
          );
          setHorariosDisponibles(disponibilidad.horariosDisponibles);
        } catch (error) {
          console.error('Error al cargar horarios:', error);
          setHorariosDisponibles([]);
        } finally {
          setLoadingHorarios(false);
        }
      } else {
        // Limpiar horarios si no hay profesional o fecha
        setHorariosDisponibles([]);
      }
    };

    cargarHorarios();
  }, [selectedProfesionalId, fechaTimestamp, form.values.fecha]);

  const handleSubmit = async (values: FormularioNuevaCita) => {
    if (!isAuthenticated || !user) {
      setNotification({
        type: 'error',
        message: 'Debes estar autenticado para crear una cita'
      });
      return;
    }

    if (!clienteId) {
      setNotification({
        type: 'error',
        message: 'ID de cliente requerido'
      });
      return;
    }

    try {
      setLoading(true);
      setNotification(null);

      const datosCita: CrearCitaDTO = {
        cliente: clienteId,
        profesional: values.profesional,
        tipo: values.tipo,
        fecha: values.fecha!.toISOString().split('T')[0],
        hora: values.hora,
        duracion: values.duracion,
        motivo: values.motivo
      };

      const nuevaCita = await CitaService.crearCita(datosCita);

      setNotification({
        type: 'success',
        message: 'Cita creada exitosamente'
      });

      setTimeout(() => {
        onSuccess(nuevaCita);
      }, 800);

    } catch (error) {
      console.error('Error al crear cita:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al crear la cita';
      
      // Si es un error de token expirado, redirigir al login
      if (errorMessage.includes('Token expirado') || errorMessage.includes('401')) {
        setNotification({
          type: 'error',
          message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
        });
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setNotification({
          type: 'error',
          message: errorMessage
        });
        onError(error as Error);
      }
    } finally {
      setLoading(false);
    }
  };

  const getTipoCitaInfo = (tipo: TipoCita) => {
    return TIPOS_CITA.find(t => t.value === tipo);
  };


  return (
    <Paper p="xl" radius="md" style={{ position: 'relative' }}>
      <LoadingOverlay visible={loading} />
      
            <Stack gap="lg">
        <div>
          <Title order={2} mb="xs" c={isDark ? 'white' : 'dark'}>
            Nueva Cita
          </Title>
          <Text size="sm" c="dimmed">
            Programa una nueva cita virtual con tu profesional
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

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            {/* Información del cliente */}
            {initialClienteNombre && (
              <Card withBorder p="md" bg={isDark ? 'dark.6' : 'gray.0'}>
                <Group>
                  <IconUser size={20} color="var(--mantine-color-blue-6)" />
                  <div>
                    <Text size="sm" fw={500}>Cliente</Text>
                    <Text size="sm" c="dimmed">{initialClienteNombre}</Text>
                  </div>
                </Group>
              </Card>
            )}

            {/* Selección de profesional */}
            <div>
              <Text size="sm" fw={500} mb="xs">
                Profesional *
              </Text>
              <Select
                placeholder="Selecciona un profesional"
                data={profesionales.map(p => ({
                  value: p._id,
                  label: `${p.fullName} - ${p.workerType}`
                }))}
                leftSection={<IconStethoscope size={16} />}
                searchable
                disabled={loadingProfesionales}
                {...form.getInputProps('profesional')}
              />
              {loadingProfesionales && (
                <Text size="xs" c="dimmed" mt={4}>
                  Cargando profesionales...
                </Text>
              )}
            </div>

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
              fecha={form.values.fecha}
              hora={form.values.hora}
              horariosDisponibles={horariosDisponibles}
              loadingHorarios={loadingHorarios}
              disabled={!form.values.profesional}
              onFechaChange={(date) => form.setFieldValue('fecha', date)}
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
                {...form.getInputProps('motivo')}
              />
              <Text size="xs" c="dimmed" mt={4}>
                Mínimo 10 caracteres. Máximo 500 caracteres.
              </Text>
            </div>

            {/* Información adicional */}
            <Alert icon={<IconInfoCircle size={16} />} color="blue">
              <Text size="sm">
                <strong>Importante:</strong> Todas las citas son virtuales y se realizarán mediante videollamada. 
                Recibirás un enlace de acceso antes de la cita programada.
              </Text>
            </Alert>

            {/* Botones de acción */}
            <Group justify="flex-end" mt="lg">
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading || !form.isValid()}
                loading={loading}
              >
                Crear Cita
              </Button>
            </Group>
          </Stack>
        </form>
      </Stack>
    </Paper>
  );
};

export default FormularioCrearCita;
