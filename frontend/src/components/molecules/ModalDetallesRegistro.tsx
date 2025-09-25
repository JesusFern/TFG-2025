import React from 'react';
import { 
  Modal, 
  Group, 
  Text, 
  Badge, 
  Stack, 
  SimpleGrid, 
  Box, 
  Button,
  Card,
  Progress
} from '@mantine/core';
import { 
  IconRepeat, 
  IconTarget, 
  IconWeight, 
  IconClock, 
  IconCheck,
  IconNotes,
  IconVideo,
  IconEdit
} from '@tabler/icons-react';
import { useThemeDetection } from '../../hooks/useThemeDetection';
import { RegistroEjercicio, Ejercicio } from '../../types/training';

interface ModalDetallesRegistroProps {
  opened: boolean;
  onClose: () => void;
  registro: RegistroEjercicio;
  ejercicio: Ejercicio;
  onEditar?: () => void;
}

const ModalDetallesRegistro: React.FC<ModalDetallesRegistroProps> = ({
  opened,
  onClose,
  registro,
  ejercicio,
  onEditar
}) => {
  const isDark = useThemeDetection();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Detalles del Registro"
      size="lg"
      centered
      zIndex={1000}
    >
      <Stack gap="lg">
        {/* Header del ejercicio */}
        <Card p="md" radius="md" withBorder bg={isDark ? "dark.7" : "gray.0"}>
          <Group justify="space-between" align="flex-start" mb="md">
            <div>
              <Text fw={600} size="lg" c="nutroos-green.6">
                {ejercicio.nombre}
              </Text>
              <Text size="sm" c="dimmed">
                {ejercicio.grupoMuscular} • {ejercicio.equipamiento}
              </Text>
            </div>
            <Badge
              color={registro.completado ? "green" : "blue"}
              variant="light"
              leftSection={<IconCheck size={12} />}
            >
              {registro.completado ? "Completado" : "En Progreso"}
            </Badge>
          </Group>

          <Text size="sm" c="dimmed">
            Registrado el {formatDate(registro.fecha)}
          </Text>
        </Card>

        {/* Parámetros del registro */}
        <Card p="md" radius="md" withBorder bg={isDark ? "dark.7" : "white"}>
          <Text fw={600} size="md" mb="md" c="nutroos-green.6">
            Parámetros del Ejercicio
          </Text>

          <SimpleGrid 
            cols={(() => {
              const tieneSeries = registro.seriesCompletadas > 0;
              const tieneCarga = registro.cargaUtilizada !== undefined && registro.cargaUtilizada !== null && registro.cargaUtilizada > 0;
              const elementosVisibles = (tieneSeries ? 1 : 0) + 1 + (tieneCarga ? 1 : 0) + 1; // series + repeticiones + carga + descanso
              return elementosVisibles > 2 ? 2 : 1;
            })()} 
            spacing="md"
          >
            {registro.seriesCompletadas > 0 && (
              <Box>
                <Text size="xs" fw={600} c="dimmed" mb="xs">
                  SERIES COMPLETADAS
                </Text>
                <Group gap="xs">
                  <IconRepeat size={16} color="var(--mantine-color-blue-6)" />
                  <Text fw={600} size="lg">{registro.seriesCompletadas}</Text>
                </Group>
              </Box>
            )}

            <Box>
              <Text size="xs" fw={600} c="dimmed" mb="xs">
                REPETICIONES REALIZADAS
              </Text>
              <Group gap="xs">
                <IconTarget size={16} color="var(--mantine-color-teal-6)" />
                <Text fw={600} size="lg">{registro.repeticionesRealizadas}</Text>
              </Group>
            </Box>

            {registro.cargaUtilizada !== undefined && registro.cargaUtilizada !== null && registro.cargaUtilizada > 0 && (
              <Box>
                <Text size="xs" fw={600} c="dimmed" mb="xs">
                  CARGA UTILIZADA
                </Text>
                <Group gap="xs">
                  <IconWeight size={16} color="var(--mantine-color-orange-6)" />
                  <Text fw={600} size="lg">{registro.cargaUtilizada} kg</Text>
                </Group>
              </Box>
            )}

            <Box>
              <Text size="xs" fw={600} c="dimmed" mb="xs">
                TIEMPO DE DESCANSO
              </Text>
              <Group gap="xs">
                <IconClock size={16} color="var(--mantine-color-cyan-6)" />
                <Text fw={600} size="lg">{registro.tiempoDescanso}s</Text>
              </Group>
            </Box>
          </SimpleGrid>

          {/* Nivel de esfuerzo */}
          {registro.nivelEsfuerzo !== undefined && registro.nivelEsfuerzo !== null && registro.nivelEsfuerzo > 0 && (
            <Box mt="md">
              <Text size="xs" fw={600} c="dimmed" mb="xs">
                NIVEL DE ESFUERZO
              </Text>
              <Group gap="md">
                <Text fw={600} size="lg">{registro.nivelEsfuerzo}/10</Text>
                <Progress 
                  value={(registro.nivelEsfuerzo / 10) * 100} 
                  color="nutroos-green" 
                  size="sm" 
                  style={{ flex: 1 }}
                />
              </Group>
            </Box>
          )}

          {/* Duración del ejercicio */}
          {registro.duracionEjercicio !== undefined && registro.duracionEjercicio !== null && registro.duracionEjercicio > 0 && (
            <Box mt="md">
              <Text size="xs" fw={600} c="dimmed" mb="xs">
                DURACIÓN DEL EJERCICIO
              </Text>
              <Group gap="xs">
                <IconClock size={16} color="var(--mantine-color-grape-6)" />
                <Text fw={600} size="lg">{formatDuration(registro.duracionEjercicio)}</Text>
              </Group>
            </Box>
          )}
        </Card>

        {/* Notas */}
        {registro.notas && (
          <Card p="md" radius="md" withBorder bg={isDark ? "dark.7" : "white"}>
            <Text fw={600} size="md" mb="md" c="nutroos-green.6">
              Notas del Ejercicio
            </Text>
            <Group gap="xs" align="flex-start">
              <IconNotes size={16} color="var(--mantine-color-gray-6)" />
              <Text c="dimmed" style={{ fontStyle: 'italic' }}>
                "{registro.notas}"
              </Text>
            </Group>
          </Card>
        )}

        {/* Video del cliente */}
        {registro.videoCliente && (
          <Card p="md" radius="md" withBorder bg={isDark ? "dark.7" : "white"}>
            <Text fw={600} size="md" mb="md" c="nutroos-green.6">
              Video del Ejercicio
            </Text>
            <Group gap="xs">
              <IconVideo size={16} color="var(--mantine-color-red-6)" />
              <Text c="dimmed">Video subido por el cliente</Text>
            </Group>
          </Card>
        )}

        {/* Botones de acción */}
        <Group justify="flex-end" mt="lg">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cerrar
          </Button>
          {onEditar && (
            <Button
              color="nutroos-green"
              leftSection={<IconEdit size={16} />}
              onClick={onEditar}
            >
              Editar Registro
            </Button>
          )}
        </Group>
      </Stack>
    </Modal>
  );
};

export default ModalDetallesRegistro;
