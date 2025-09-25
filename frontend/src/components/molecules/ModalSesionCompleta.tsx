import React from 'react';
import { 
  Modal, 
  Text, 
  Stack, 
  Group, 
  Button, 
  Card, 
  Progress, 
  Badge,
  Alert,
  SimpleGrid
} from '@mantine/core';
import { 
  IconCheck, 
  IconTarget, 
  IconBarbell, 
  IconAlertCircle,
  IconTrophy
} from '@tabler/icons-react';
import { useThemeDetection } from '../../hooks/useThemeDetection';
import { SesionCompleta } from '../../types/training';

interface ModalSesionCompletaProps {
  opened: boolean;
  onClose: () => void;
  sesionCompleta: SesionCompleta;
  onConfirmar: () => void;
  loading?: boolean;
}

const ModalSesionCompleta: React.FC<ModalSesionCompletaProps> = ({
  opened,
  onClose,
  sesionCompleta,
  onConfirmar,
  loading = false
}) => {
  const isDark = useThemeDetection();

  const getProgressColor = () => {
    const porcentaje = sesionCompleta?.porcentajeCompletado || 0;
    if (porcentaje >= 100) return "green";
    if (porcentaje >= 75) return "blue";
    if (porcentaje >= 50) return "yellow";
    return "red";
  };

  const getProgressMessage = () => {
    const porcentaje = sesionCompleta?.porcentajeCompletado || 0;
    if (porcentaje >= 100) {
      return "¡Excelente! Has completado todos los ejercicios de la sesión.";
    }
    if (porcentaje >= 75) {
      return "¡Muy bien! Has completado la mayoría de los ejercicios.";
    }
    if (porcentaje >= 50) {
      return "Buen progreso. Aún puedes completar más ejercicios.";
    }
    return "Puedes continuar registrando ejercicios para completar la sesión.";
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Estado de la Sesión"
      size="md"
      centered
    >
      <Stack gap="lg">
        {/* Resumen de progreso */}
        <Card p="md" radius="md" withBorder bg={isDark ? "dark.7" : "gray.0"}>
          <Group justify="space-between" align="flex-start" mb="md">
            <div>
              <Text fw={600} size="lg" c="nutroos-green.6">
                Progreso de la Sesión
              </Text>
              <Text size="sm" c="dimmed">
                {sesionCompleta?.ejerciciosCompletados || 0} de {sesionCompleta?.totalEjercicios || 0} ejercicios completados
              </Text>
            </div>
            <Badge
              color={getProgressColor()}
              variant="light"
              leftSection={<IconTarget size={12} />}
            >
              {(sesionCompleta?.porcentajeCompletado || 0).toFixed(0)}% Completado
            </Badge>
          </Group>

          <Progress 
            value={sesionCompleta?.porcentajeCompletado || 0} 
            color={getProgressColor()}
            size="lg" 
            radius="md"
            mb="md"
          />

          <Text size="sm" c="dimmed" style={{ fontStyle: 'italic' }}>
            {getProgressMessage()}
          </Text>
        </Card>

        {/* Estadísticas detalladas */}
        <SimpleGrid cols={2} spacing="md">
          <Card p="md" radius="md" withBorder bg={isDark ? "dark.7" : "white"}>
            <Group gap="xs" mb="xs">
              <IconBarbell size={16} color="var(--mantine-color-blue-6)" />
              <Text fw={600} size="sm">Ejercicios Totales</Text>
            </Group>
            <Text fw={600} size="xl" c="nutroos-green.6">
              {sesionCompleta?.totalEjercicios || 0}
            </Text>
          </Card>

          <Card p="md" radius="md" withBorder bg={isDark ? "dark.7" : "white"}>
            <Group gap="xs" mb="xs">
              <IconCheck size={16} color="var(--mantine-color-green-6)" />
              <Text fw={600} size="sm">Ejercicios Completados</Text>
            </Group>
            <Text fw={600} size="xl" c="nutroos-green.6">
              {sesionCompleta?.ejerciciosCompletados || 0}
            </Text>
          </Card>
        </SimpleGrid>

        {/* Mensaje de felicitación si está completa */}
        {sesionCompleta?.sesionCompleta && (
          <Alert
            icon={<IconTrophy size={16} />}
            color="green"
            variant="light"
            title="¡Felicidades!"
          >
            Has completado exitosamente todos los ejercicios de esta sesión. 
            ¡Excelente trabajo!
          </Alert>
        )}

        {/* Advertencia solo si faltan ejercicios por registrar */}
        {!sesionCompleta?.sesionCompleta && sesionCompleta && sesionCompleta.ejerciciosCompletados < sesionCompleta.totalEjercicios && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="yellow"
            variant="light"
            title="Sesión Incompleta"
          >
            Aún puedes completar más ejercicios para finalizar la sesión ({sesionCompleta.ejerciciosCompletados}/{sesionCompleta.totalEjercicios} completados). Los ejercicios sin registrar se marcarán como "no completados". ¿Estás seguro de que quieres marcar la sesión como completa?
          </Alert>
        )}

        {/* Botones de acción */}
        <Group justify="flex-end" mt="lg">
          {sesionCompleta && sesionCompleta.ejerciciosCompletados < sesionCompleta.totalEjercicios && (
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Continuar Entrenando
            </Button>
          )}
          
          <Button
            color="nutroos-green"
            leftSection={<IconCheck size={16} />}
            onClick={onConfirmar}
            loading={loading}
          >
            {sesionCompleta?.sesionCompleta ? "Confirmar Sesión Completa" : "Marcar como Completa"}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default ModalSesionCompleta;
