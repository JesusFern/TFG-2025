import React from 'react';
import { 
  Card, 
  Group, 
  Text, 
  Badge, 
  Button, 
  Stack, 
  Box, 
  Progress,
  SimpleGrid,
  ActionIcon,
  Tooltip,
  ThemeIcon,
  Alert
} from '@mantine/core';
import { 
  IconBarbell, 
  IconRepeat, 
  IconTarget, 
  IconWeight, 
  IconClock, 
  IconCheck,
  IconEdit,
  IconEye,
  IconX,
  IconInfoCircle
} from '@tabler/icons-react';
import { useThemeDetection } from '../../hooks/useThemeDetection';
import { Ejercicio, RegistroEjercicio } from '../../types/training';

interface EjercicioRegistroCardProps {
  ejercicio: Ejercicio;
  ejercicioSesion: {
    series: number;
    repeticiones: number;
    peso?: number;
    tiempoDescanso: number;
    nivelIntensidad: string;
  };
  registro?: RegistroEjercicio;
  onRegistrar: () => void;
  onNoCompletado: () => void;
  onVerRegistro: () => void;
  onEditarRegistro: () => void;
  onVerEjercicio: () => void;
  orden: number;
  sesionCompletada?: boolean;
  sesionMarcadaCompleta?: boolean;
  sesionFutura?: boolean;
  planGratuito?: boolean;
}

const EjercicioRegistroCard: React.FC<EjercicioRegistroCardProps> = ({
  ejercicio,
  ejercicioSesion,
  registro,
  onRegistrar,
  onNoCompletado,
  onVerRegistro,
  onEditarRegistro,
  onVerEjercicio,
  orden,
  sesionCompletada = false,
  sesionMarcadaCompleta = false,
  sesionFutura = false,
  planGratuito = false
}) => {
  const isDark = useThemeDetection();
  const isRegistrado = !!registro;
  const isCompletado = isRegistrado && registro.completado;

  const calcularProgreso = () => {
    if (!registro) return 0;
    return Math.min((registro.seriesCompletadas / ejercicioSesion.series) * 100, 100);
  };

  const progreso = calcularProgreso();

  // Determinar el color del estado
  const getEstadoColor = () => {
    if (!isRegistrado) return "gray";
    if (isCompletado) return "green";
    return "red";
  };

  const getEstadoTexto = () => {
    if (!isRegistrado) return "Sin Registrar";
    if (isCompletado) return "Completado";
    return "No Completado";
  };

  return (
    <Card
      p="md"
      radius="md"
      withBorder
      bg={isDark ? "dark.7" : "white"}
       style={{
         borderColor: isRegistrado 
           ? (isCompletado ? 'var(--mantine-color-green-4)' : 'var(--mantine-color-red-4)')
           : 'var(--mantine-color-gray-3)',
         borderWidth: isRegistrado ? 2 : 1
       }}
    >
      <Stack gap="md">
        {/* Header del ejercicio */}
        <Group justify="space-between" align="flex-start">
          <Group gap="md">
                   <ThemeIcon
                     size={32}
                     radius="xl"
                     color={getEstadoColor()}
                     variant="filled"
                     style={{
                       fontWeight: 600,
                       transition: 'all 150ms ease',
                       border: isRegistrado ? `2px solid var(--mantine-color-${getEstadoColor()}-4)` : 'none',
                       boxShadow: isRegistrado ? `0 0 8px var(--mantine-color-${getEstadoColor()}-3)` : 'none'
                     }}
                   >
              {orden}
            </ThemeIcon>
            <div>
              <Text fw={600} size="lg" c="nutroos-green.6">
                {ejercicio.nombre}
              </Text>
              <Text size="sm" c="dimmed">
                {ejercicio.grupoMuscular} • {ejercicio.equipamiento}
              </Text>
            </div>
          </Group>

                 <Group gap="xs">
                   {isRegistrado && (
                     <Badge
                       color={getEstadoColor()}
                       variant="light"
                       leftSection={<IconCheck size={12} />}
                     >
                       {getEstadoTexto()}
                     </Badge>
                   )}
                 </Group>
        </Group>

        {/* Progreso si está registrado */}
        {isRegistrado && (
          <Box>
            <Group justify="space-between" mb="xs">
              <Text size="sm" fw={500}>Progreso de Series</Text>
              <Text size="sm" c="dimmed">
                {registro.seriesCompletadas} / {ejercicioSesion.series}
              </Text>
            </Group>
                   <Progress
                     value={progreso}
                     color={getEstadoColor()}
                     size="sm"
                     radius="md"
                   />
          </Box>
        )}

        {/* Parámetros del ejercicio */}
        <SimpleGrid 
          cols={(() => {
            const pesoMostrar = isRegistrado ? registro?.cargaUtilizada : ejercicioSesion.peso;
            return pesoMostrar !== undefined && pesoMostrar !== null && pesoMostrar > 0;
          })() ? 4 : 3} 
          spacing="md"
        >
          <Box>
            <Text size="xs" fw={600} c="dimmed" mb="xs">
              SERIES
            </Text>
            <Group gap="xs">
              <IconRepeat size={16} color="var(--mantine-color-blue-6)" />
              <Text fw={600}>
                {isRegistrado ? registro.seriesCompletadas : ejercicioSesion.series}
                {isRegistrado && ` / ${ejercicioSesion.series}`}
              </Text>
            </Group>
          </Box>

                 <Box>
                   <Text size="xs" fw={600} c="dimmed" mb="xs">
                     REPETICIONES
                   </Text>
                   <Group gap="xs">
                     <IconTarget size={16} color="var(--mantine-color-teal-6)" />
                     <Text fw={600}>
                       {isRegistrado ? `${registro.repeticionesRealizadas} / ${ejercicioSesion.repeticiones}` : ejercicioSesion.repeticiones}
                     </Text>
                   </Group>
                 </Box>

          {(() => {
            const pesoMostrar = isRegistrado ? registro?.cargaUtilizada : ejercicioSesion.peso;
            return pesoMostrar !== undefined && pesoMostrar !== null && pesoMostrar > 0;
          })() && (
            <Box>
              <Text size="xs" fw={600} c="dimmed" mb="xs">
                PESO
              </Text>
              <Group gap="xs">
                <IconWeight size={16} color="var(--mantine-color-orange-6)" />
                <Text fw={600}>
                  {isRegistrado ? registro.cargaUtilizada : ejercicioSesion.peso} kg
                </Text>
              </Group>
            </Box>
          )}

                 <Box>
                   <Text size="xs" fw={600} c="dimmed" mb="xs">
                     DESCANSO
                   </Text>
                   <Group gap="xs">
                     <IconClock size={16} color="var(--mantine-color-cyan-6)" />
                     <Text fw={600}>
                       {isRegistrado ? `${registro.tiempoDescanso} / ${ejercicioSesion.tiempoDescanso}s` : `${ejercicioSesion.tiempoDescanso}s`}
                     </Text>
                   </Group>
                 </Box>
        </SimpleGrid>

        {/* Nivel de esfuerzo si está registrado */}
        {isRegistrado && (
          <Box>
            <Text size="xs" fw={600} c="dimmed" mb="xs">
              NIVEL DE ESFUERZO
            </Text>
            <Group gap="xs">
              <IconTarget size={16} color="var(--mantine-color-grape-6)" />
              <Text fw={600}>{registro.nivelEsfuerzo}/10</Text>
            </Group>
          </Box>
        )}

        {/* Notas si existen */}
        {isRegistrado && registro.notas && (
          <Box>
            <Text size="xs" fw={600} c="dimmed" mb="xs">
              NOTAS
            </Text>
            <Text size="sm" c="dimmed" style={{ fontStyle: 'italic' }}>
              "{registro.notas}"
            </Text>
          </Box>
        )}

        {/* Botones de acción */}
        <Group justify="space-between">
          <Button
            size="xs"
            variant="light"
            leftSection={<IconEye size={14} />}
            onClick={onVerEjercicio}
          >
            Ver Detalles
          </Button>
          
          <Group gap="xs">
            {planGratuito && !isRegistrado ? (
              <Alert
                icon={<IconInfoCircle size={16} />}
                title="Plan Gratuito"
                color="blue"
                variant="light"
                style={{ flex: 1 }}
              >
                <Text size="xs">
                  El registro de ejercicios y seguimiento de progreso está disponible solo para usuarios con suscripción premium.
                </Text>
              </Alert>
            ) : !sesionCompletada && !isRegistrado ? (
              <>
                <Button
                  color="nutroos-green"
                  leftSection={<IconBarbell size={16} />}
                  onClick={onRegistrar}
                  size="sm"
                  disabled={sesionFutura}
                >
                  Registrar Ejercicio
                </Button>
                <Button
                  color="red"
                  variant="light"
                  leftSection={<IconX size={16} />}
                  onClick={onNoCompletado}
                  size="sm"
                  disabled={sesionFutura}
                >
                  No Completado
                </Button>
              </>
            ) : isRegistrado ? (
              <>
                <Tooltip label="Ver detalles del registro">
                  <ActionIcon
                    color="blue"
                    variant="light"
                    onClick={onVerRegistro}
                  >
                    <IconEye size={16} />
                  </ActionIcon>
                </Tooltip>
                
                {!sesionMarcadaCompleta && (
                  <Tooltip label="Editar registro">
                    <ActionIcon
                      color="orange"
                      variant="light"
                      onClick={onEditarRegistro}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                  </Tooltip>
                )}
              </>
            ) : null}
          </Group>
        </Group>
      </Stack>
    </Card>
  );
};

export default EjercicioRegistroCard;
