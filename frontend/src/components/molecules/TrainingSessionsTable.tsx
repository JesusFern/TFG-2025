import React from 'react';
import { Box, Text, Stack, Group, Badge } from '@mantine/core';
import { IconBarbell, IconClock, IconTarget, IconCalendar, IconTrophy, IconX } from '@tabler/icons-react';
import type { PlanEntrenamiento, SesionPlan, Ejercicio } from '../../types/training';

interface SesionInfo {
  weekDayIndex: number;
  weekDayName: string;
  fecha: Date;
  fechaFormateada: string;
  data: SesionPlan | null;
}

interface TrainingSessionsTableProps {
  sesionesRange: { sesiones: SesionInfo[]; totalWeeks: number };
  plan: PlanEntrenamiento;
  isDark: boolean;
  getEjercicioById: (ejercicioId: string) => Ejercicio | null;
}

const TrainingSessionsTable: React.FC<TrainingSessionsTableProps> = ({
  sesionesRange,
  plan,
  isDark,
  getEjercicioById
}) => {
  // Función para determinar si una fecha es hoy
  const esHoy = (fecha: Date): boolean => {
    const hoy = new Date();
    const fechaSesion = new Date(fecha);
    
    // Resetear las horas para comparar solo fechas
    hoy.setHours(0, 0, 0, 0);
    fechaSesion.setHours(0, 0, 0, 0);
    
    return hoy.getTime() === fechaSesion.getTime();
  };

  // Función para determinar si una sesión está atrasada (no completada en su día)
  const esAtrasada = (fecha: Date, completada?: boolean): boolean => {
    const hoy = new Date();
    const fechaSesion = new Date(fecha);
    
    // Resetear las horas para comparar solo fechas
    hoy.setHours(0, 0, 0, 0);
    fechaSesion.setHours(0, 0, 0, 0);
    
    // Si la sesión es del pasado y no está completada, está atrasada
    return fechaSesion < hoy && !completada;
  };
  return (
    <Box px="xl" py="md" mx="auto" style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {sesionesRange.sesiones.map((sesionInfo) => (
              <th
                key={`header-${sesionInfo.weekDayIndex}`}
                style={{ 
                  padding: '12px 8px',
                  borderBottom: '2px solid var(--mantine-color-nutroos-green-4)',
                  backgroundColor: isDark ? 'var(--mantine-color-nutroos-green-9)' : 'var(--mantine-color-nutroos-green-1)',
                  textAlign: 'center' as const
                }}
              >
                <Text fw={700} c="nutroos-green" size="sm" ta="center">
                  {sesionInfo.weekDayName}
                </Text>
                <Text size="xs" c="dimmed" ta="center">
                  {sesionInfo.fechaFormateada}
                </Text>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {sesionesRange.sesiones.map((sesionInfo, index) => (
              <td 
                key={`sesion-${sesionInfo.weekDayIndex}`}
                style={{ 
                  padding: '16px 12px',
                  borderRight: '1px solid var(--app-border-color)',
                  verticalAlign: 'top' as const,
                  backgroundColor: index % 2 === 0 
                    ? (isDark ? 'var(--mantine-color-dark-6)' : 'var(--mantine-color-gray-0)')
                    : (isDark ? 'var(--mantine-color-dark-5)' : 'white')
                }}
              >
                {sesionInfo.data ? (
                  <Stack gap="sm">
                    {/* Información de la sesión */}
                    <Box>
                      <Group gap="xs" mb="xs" justify="space-between">
                        <Group gap="xs">
                          <IconBarbell size={16} color="var(--mantine-color-nutroos-green-6)" />
                          <Text fw={600} size="sm" c="nutroos-green">
                            {sesionInfo.data.tipoEntrenamiento}
                          </Text>
                        </Group>
                        
                        {/* Etiquetas de estado */}
                        <Group gap="xs">
                          {esHoy(sesionInfo.fecha) && (
                            <Badge 
                              color="blue" 
                              variant="filled" 
                              leftSection={<IconCalendar size={12} />}
                              size="xs"
                            >
                              Hoy
                            </Badge>
                          )}
                          {sesionInfo.data.completada && (
                            <Badge 
                              color="green" 
                              variant="filled" 
                              leftSection={<IconTrophy size={12} />}
                              size="xs"
                            >
                              Completada
                            </Badge>
                          )}
                          {esAtrasada(sesionInfo.fecha, sesionInfo.data.completada) && (
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
                      
                      {sesionInfo.data.hora && (
                        <Group gap="xs" mb="xs">
                          <IconClock size={14} color="var(--mantine-color-gray-6)" />
                          <Text size="xs" c="dimmed">
                            {sesionInfo.data.hora}
                          </Text>
                        </Group>
                      )}
                      
                      {sesionInfo.data.duracion && (
                        <Group gap="xs" mb="xs">
                          <IconTarget size={14} color="var(--mantine-color-gray-6)" />
                          <Text size="xs" c="dimmed">
                            {sesionInfo.data.duracion} min
                          </Text>
                        </Group>
                      )}
                    </Box>

                    {/* Ejercicios */}
                    {sesionInfo.data.ejercicios && sesionInfo.data.ejercicios.length > 0 ? (
                      <Stack gap="xs">
                        <Text size="xs" fw={500} c="dimmed">Ejercicios:</Text>
                        {sesionInfo.data.ejercicios.map((ejercicioSesion, ejIndex) => {
                          const ejercicio = getEjercicioById(ejercicioSesion.ejercicio);
                          return (
                            <Box key={ejIndex} p="xs" style={{ backgroundColor: isDark ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-gray-1)', borderRadius: '4px' }}>
                              <Text size="xs" fw={500} mb="2px">
                                {ejIndex + 1}. {ejercicio?.nombre || 'Ejercicio no encontrado'}
                              </Text>
                              <Text size="xs" c="dimmed">
                                {ejercicioSesion.series} series × {ejercicioSesion.repeticiones} reps
                                {ejercicioSesion.peso && ` @ ${ejercicioSesion.peso}kg`}
                              </Text>
                              {ejercicioSesion.tiempoDescanso && (
                                <Group gap="xs" mt="2px">
                                  <IconClock size={12} color="var(--mantine-color-gray-6)" />
                                  <Text size="xs" c="dimmed">
                                    Descanso: {ejercicioSesion.tiempoDescanso}s
                                  </Text>
                                </Group>
                              )}
                            </Box>
                          );
                        })}
                      </Stack>
                    ) : (
                      <Text size="xs" c="dimmed" ta="center" py="md">
                        Sin ejercicios asignados
                      </Text>
                    )}
                  </Stack>
                ) : (
                  <Box py="md" ta="center">
                    <Text size="xs" c="dimmed">
                      {plan.diasSemana.includes(sesionInfo.fecha.getDay()) 
                        ? 'Sin sesión programada' 
                        : 'Día de descanso'}
                    </Text>
                  </Box>
                )}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </Box>
  );
};

export default TrainingSessionsTable;
