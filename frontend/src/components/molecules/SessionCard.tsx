import React from 'react';
import {
  Group,
  Title,
  Text,
  Badge,
  Stack,
  Box
} from '@mantine/core';
import {
  IconClock,
  IconBarbell,
  IconCalendar,
  IconPlayerPlay,
  IconTrophy,
  IconX
} from '@tabler/icons-react';
import { SesionPlan } from '../../types/training';
import { Ejercicio } from '../../types/training';

type EjercicioSesion = {
  ejercicio: string;
  orden: number;
  series: number;
  repeticiones: number;
  peso?: number;
  tiempoDescanso: number;
  ejerciciosAlternativos?: string[];
  opcionesProgresion?: {
    aumentarPeso: boolean;
    masRepeticiones: boolean;
    mayorIntensidad: boolean;
  };
};
import InteractiveCard from '../atoms/InteractiveCard';

interface SessionCardProps {
  sesion: SesionPlan;
  fechaFormateada: string;
  fecha: Date;
  ejercicios: Ejercicio[];
  onSessionClick: (sesionId: string) => void;
}

const SessionCard: React.FC<SessionCardProps> = ({
  sesion,
  fechaFormateada,
  fecha,
  ejercicios,
  onSessionClick
}) => {
  // Función para determinar si una fecha es hoy
  const esHoy = (fechaSesion: Date): boolean => {
    const hoy = new Date();
    const fechaComparar = new Date(fechaSesion);
    
    // Resetear las horas para comparar solo fechas
    hoy.setHours(0, 0, 0, 0);
    fechaComparar.setHours(0, 0, 0, 0);
    
    return hoy.getTime() === fechaComparar.getTime();
  };

  // Función para determinar si una sesión está atrasada (no completada en su día)
  const esAtrasada = (fechaSesion: Date, completada?: boolean): boolean => {
    const hoy = new Date();
    const fechaComparar = new Date(fechaSesion);
    
    // Resetear las horas para comparar solo fechas
    hoy.setHours(0, 0, 0, 0);
    fechaComparar.setHours(0, 0, 0, 0);
    
    // Si la sesión es del pasado y no está completada, está atrasada
    return fechaComparar < hoy && !completada;
  };
  const handleClick = () => {
    if (sesion._id) {
      onSessionClick(sesion._id);
    }
  };

  return (
    <InteractiveCard
      isActive={true}
      variant="plan"
      onClick={handleClick}
    >
      <Stack gap="md">
        {/* Header de la sesión */}
        <Group justify="space-between" align="flex-start">
          <div>
            <Group align="center" mb="xs">
              <Title order={5} c="nutroos-green.6">
                {sesion.tipoEntrenamiento}
              </Title>
              {/* Etiquetas de estado */}
              <Group gap="xs">
                {esHoy(fecha) && (
                  <Badge 
                    color="blue" 
                    variant="filled" 
                    leftSection={<IconCalendar size={12} />}
                    size="xs"
                  >
                    Hoy
                  </Badge>
                )}
                {sesion.completada && (
                  <Badge 
                    color="green" 
                    variant="filled" 
                    leftSection={<IconTrophy size={12} />}
                    size="xs"
                  >
                    Completada
                  </Badge>
                )}
                {esAtrasada(fecha, sesion.completada) && (
                  <Badge 
                    color="red" 
                    variant="filled" 
                    leftSection={<IconX size={12} />}
                    size="xs"
                  >
                    No Completado
                  </Badge>
                )}
              </Group>
            </Group>
            <Text size="sm" c="dimmed" fw={500}>
              {fechaFormateada}
            </Text>
          </div>
          <Badge
            color="nutroos-green"
            variant="light"
            leftSection={<IconPlayerPlay size={14} />}
            fw={600}
          >
            Ver Sesión
          </Badge>
        </Group>

        {/* Detalles de la sesión */}
        <Stack gap="xs">
          <Group gap="xs">
            <IconClock size={16} color="#15aabf" />
            <Text size="sm" fw={500}>
              Duración: {sesion.duracion} minutos
            </Text>
          </Group>
          
          <Group gap="xs">
            <IconBarbell size={16} color="#12b886" />
            <Text size="sm" fw={500}>
              {sesion.ejercicios.length} ejercicio{sesion.ejercicios.length !== 1 ? 's' : ''}
            </Text>
          </Group>

          {sesion.hora && (
            <Group gap="xs">
              <IconCalendar size={16} color="#228be6" />
              <Text size="sm" fw={500}>
                Hora: {sesion.hora}
              </Text>
            </Group>
          )}
        </Stack>

        {/* Lista de ejercicios */}
        {sesion.ejercicios.length > 0 && (
          <Box>
            <Text size="xs" fw={600} c="dimmed" mb="xs">
              Ejercicios incluidos:
            </Text>
            <Stack gap="xs">
              {sesion.ejercicios.slice(0, 3).map((ejercicio: EjercicioSesion, idx: number) => {
                const ejercicioData = ejercicios.find(e => e._id === ejercicio.ejercicio);
                return (
                  <Group key={`${ejercicio.ejercicio}-${idx}`} gap="xs">
                    <Text size="xs" c="dimmed">
                      {idx + 1}.
                    </Text>
                    <Text size="xs" fw={500} lineClamp={1}>
                      {ejercicioData?.nombre || 'Ejercicio no encontrado'}
                    </Text>
                    <Text size="xs" c="dimmed">
                      ({ejercicio.series}x{ejercicio.repeticiones})
                    </Text>
                  </Group>
                );
              })}
              {sesion.ejercicios.length > 3 && (
                <Text size="xs" c="dimmed" fw={500}>
                  +{sesion.ejercicios.length - 3} más...
                </Text>
              )}
            </Stack>
          </Box>
        )}

        {/* Notas si las hay */}
        {sesion.notas && (
          <Box>
            <Text size="xs" fw={600} c="dimmed" mb="xs">
              Notas:
            </Text>
            <Text size="xs" c="dimmed" lineClamp={2}>
              {sesion.notas}
            </Text>
          </Box>
        )}
      </Stack>
    </InteractiveCard>
  );
};

export default SessionCard;
