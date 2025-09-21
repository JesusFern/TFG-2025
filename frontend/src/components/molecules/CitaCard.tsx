import React from 'react';
import {
  Card,
  Group,
  Text,
  Badge,
  Stack,
  ActionIcon,
  Tooltip,
  Button,
  Divider,
  Box,
  Alert
} from '@mantine/core';
import { useThemeDetection } from '../../hooks/useThemeDetection';
import { Cita, TipoCita, EstadoCita } from '../../types/citas';
import { CitaService } from '../../services/citaService';
import {
  IconCalendar,
  IconClock,
  IconUser,
  IconStethoscope,
  IconEdit,
  IconVideo,
  IconCheck,
  IconX,
  IconRefresh,
  IconAlertCircle,
  IconFileText
} from '@tabler/icons-react';

interface CitaCardProps {
  cita: Cita;
  onEdit?: (cita: Cita) => void;
  onCancel?: (cita: Cita) => void;
  onReschedule?: (cita: Cita) => void;
  onJoin?: (cita: Cita) => void;
  onConfirm?: (cita: Cita) => void;
  onComplete?: (cita: Cita) => void;
  showActions?: boolean;
  isProfessional?: boolean;
}

const CitaCard: React.FC<CitaCardProps> = ({
  cita,
  onEdit,
  onCancel,
  onReschedule,
  onJoin,
  onConfirm,
  onComplete,
  showActions = true,
  isProfessional = false
}) => {
  const isDark = useThemeDetection();

  const getTipoIcon = (tipo: TipoCita) => {
    switch (tipo) {
      case 'seguimiento':
        return '📊';
      case 'consulta_nutricion':
        return '🥗';
      case 'consulta_entrenamiento':
        return '💪';
      case 'evaluacion':
        return '📋';
      case 'revision':
        return '🔍';
      default:
        return '📅';
    }
  };

  const getTipoLabel = (tipo: TipoCita) => {
    return tipo.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getEstadoColor = (estado: EstadoCita) => {
    switch (estado) {
      case 'pendiente':
        return 'yellow';
      case 'confirmada':
        return 'blue';
      case 'en_progreso':
        return 'orange';
      case 'completada':
        return 'green';
      case 'cancelada':
        return 'red';
      case 'reagendada':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const getEstadoIcon = (estado: EstadoCita) => {
    switch (estado) {
      case 'pendiente':
        return <IconAlertCircle size={14} />;
      case 'confirmada':
        return <IconCheck size={14} />;
      case 'en_progreso':
        return <IconClock size={14} />;
      case 'completada':
        return <IconCheck size={14} />;
      case 'cancelada':
        return <IconX size={14} />;
      case 'reagendada':
        return <IconRefresh size={14} />;
      default:
        return <IconAlertCircle size={14} />;
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatearHora = (hora: string) => {
    return hora;
  };

  const puedeEditar = CitaService.puedeEditarCita(cita);
  const puedeCancelar = CitaService.puedeCancelarCita(cita);
  const puedeReagendar = CitaService.puedeReagendarCita(cita);

  const esHoy = () => {
    const hoy = new Date();
    const fechaCita = new Date(cita.fecha);
    return hoy.toDateString() === fechaCita.toDateString();
  };

  const esPasada = () => {
    const ahora = new Date();
    const fechaCita = new Date(cita.fecha);
    const [hora, minutos] = cita.hora.split(':').map(Number);
    fechaCita.setHours(hora, minutos, 0, 0);
    return fechaCita < ahora;
  };

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      style={{
        backgroundColor: isDark ? 'var(--mantine-color-dark-6)' : 'white',
        borderColor: esHoy() ? 'var(--mantine-color-blue-4)' : undefined,
        borderWidth: esHoy() ? 2 : 1
      }}
    >
      <Stack gap="md">
        {/* Header con tipo y estado */}
        <Group justify="space-between" align="flex-start">
          <Group gap="xs">
            <Text size="xl">{getTipoIcon(cita.tipo)}</Text>
            <div>
              <Text size="lg" fw={600} c={isDark ? 'white' : 'dark'}>
                {getTipoLabel(cita.tipo)}
              </Text>
              <Badge
                color={getEstadoColor(cita.estado || 'pendiente')}
                variant="light"
                leftSection={getEstadoIcon(cita.estado || 'pendiente')}
                size="sm"
              >
                {cita.estado ? cita.estado.replace('_', ' ') : 'Sin estado'}
              </Badge>
            </div>
          </Group>
          
          {esHoy() && (
            <Badge color="blue" variant="filled" size="sm">
              Hoy
            </Badge>
          )}
        </Group>

        {/* Información de fecha y hora */}
        <Box>
          <Group gap="md">
            <Group gap="xs">
              <IconCalendar size={16} color="var(--mantine-color-blue-6)" />
              <Text size="sm" c={isDark ? 'dimmed' : 'dark'}>
                {formatearFecha(cita.fecha)}
              </Text>
            </Group>
            
            <Group gap="xs">
              <IconClock size={16} color="var(--mantine-color-green-6)" />
              <Text size="sm" c={isDark ? 'dimmed' : 'dark'}>
                {formatearHora(cita.hora)} ({cita.duracion} min)
              </Text>
            </Group>
          </Group>
        </Box>

        {/* Participantes */}
        <Stack gap="xs">
          <Group gap="xs">
            <IconUser size={16} color="var(--mantine-color-blue-6)" />
            <Text size="sm" fw={500}>Cliente:</Text>
            <Text size="sm" c={isDark ? 'dimmed' : 'dark'}>
              {cita.cliente.fullName}
            </Text>
          </Group>
          
          <Group gap="xs">
            <IconStethoscope size={16} color="var(--mantine-color-green-6)" />
            <Text size="sm" fw={500}>Profesional:</Text>
            <Text size="sm" c={isDark ? 'dimmed' : 'dark'}>
              {cita.profesional.fullName}
            </Text>
          </Group>
        </Stack>

        {/* Motivo */}
        {cita.motivo && (
          <Box>
            <Group gap="xs" mb="xs">
              <IconFileText size={16} color="var(--mantine-color-orange-6)" />
              <Text size="sm" fw={500}>Motivo:</Text>
            </Group>
            <Text size="sm" c={isDark ? 'dimmed' : 'dark'} pl="lg">
              {cita.motivo}
            </Text>
          </Box>
        )}

        {/* Motivo de cancelación si existe */}
        {cita.motivoCancelacion && (
          <Alert color="red" variant="light" icon={<IconAlertCircle size={16} />}>
            <Text size="sm">
              <strong>Cancelada:</strong> {cita.motivoCancelacion}
            </Text>
          </Alert>
        )}

        {/* Acciones */}
        {showActions && (
          <>
            <Divider />
            <Group justify="space-between">
              <Group gap="xs">
                {/* Acciones para profesionales */}
                {isProfessional && (
                  <>
                    {(cita.estado || 'pendiente') === 'pendiente' && (
                      <Tooltip label="Confirmar cita">
                        <ActionIcon
                          color="green"
                          variant="light"
                          onClick={() => onConfirm?.(cita)}
                        >
                          <IconCheck size={16} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                    
                    {((cita.estado || 'pendiente') === 'confirmada' || (cita.estado || 'pendiente') === 'en_progreso') && (
                      <Tooltip label="Completar cita">
                        <ActionIcon
                          color="blue"
                          variant="light"
                          onClick={() => onComplete?.(cita)}
                        >
                          <IconCheck size={16} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </>
                )}

                {/* Acciones generales */}
                {puedeEditar && (
                  <Tooltip label="Editar cita">
                    <ActionIcon
                      color="blue"
                      variant="light"
                      onClick={() => onEdit?.(cita)}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                  </Tooltip>
                )}

                {puedeCancelar && (
                  <Tooltip label="Cancelar cita">
                    <ActionIcon
                      color="red"
                      variant="light"
                      onClick={() => onCancel?.(cita)}
                    >
                      <IconX size={16} />
                    </ActionIcon>
                  </Tooltip>
                )}

                {puedeReagendar && (
                  <Tooltip label="Reagendar cita">
                    <ActionIcon
                      color="orange"
                      variant="light"
                      onClick={() => onReschedule?.(cita)}
                    >
                      <IconRefresh size={16} />
                    </ActionIcon>
                  </Tooltip>
                )}
              </Group>

              {/* Botón de unirse a videollamada */}
              {!esPasada() && ['confirmada', 'en_progreso'].includes(cita.estado || 'pendiente') && (
                <Button
                  size="sm"
                  leftSection={<IconVideo size={16} />}
                  variant="filled"
                  color="blue"
                  onClick={() => onJoin?.(cita)}
                >
                  Unirse a videollamada
                </Button>
              )}
            </Group>
          </>
        )}
      </Stack>
    </Card>
  );
};

export default CitaCard;
