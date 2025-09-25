import React, { useState } from 'react';
import { 
  Modal, 
  Group, 
  Text, 
  Button,
  Stack,
  Box,
  NumberInput,
  Textarea,
  Slider,
  FileInput,
  Alert,
  Card
} from '@mantine/core';
import { 
  IconRepeat, 
  IconTarget, 
  IconWeight, 
  IconClock, 
  IconVideo, 
  IconNotes,
  IconCheck,
  IconAlertCircle
} from '@tabler/icons-react';
import { useThemeDetection } from '../../hooks/useThemeDetection';
import { ActualizarRegistroEjercicioDTO, RegistroEjercicio, Ejercicio } from '../../types/training';
import { trainingService } from '../../services/trainingService';

interface ModalEditarRegistroProps {
  opened: boolean;
  onClose: () => void;
  registro: RegistroEjercicio;
  ejercicio: Ejercicio;
  onSuccess?: () => void;
}

const ModalEditarRegistro: React.FC<ModalEditarRegistroProps> = ({
  opened,
  onClose,
  registro,
  ejercicio,
  onSuccess
}) => {
  const isDark = useThemeDetection();
  const [formData, setFormData] = useState<ActualizarRegistroEjercicioDTO>({
    repeticionesRealizadas: registro.repeticionesRealizadas,
    seriesCompletadas: registro.seriesCompletadas,
    cargaUtilizada: registro.cargaUtilizada || 0,
    nivelEsfuerzo: registro.nivelEsfuerzo,
    videoCliente: registro.videoCliente || '',
    notas: registro.notas || '',
    tiempoDescanso: registro.tiempoDescanso || 0,
    duracionEjercicio: registro.duracionEjercicio || 0
  });
  // Calcular completado basado en series
  const completado = (formData.seriesCompletadas || 0) > 0;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      const datosActualizacion = {
        ...formData,
        completado
      };

      await trainingService.actualizarRegistroEjercicio(registro._id!, datosActualizacion);
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (err) {
      console.error('Error al actualizar registro:', err);
      setError(err instanceof Error ? err.message : 'Error al actualizar el registro');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setError(null);
      onClose();
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Editar Registro de Ejercicio"
      size="xl"
      centered
    >
      <Stack gap="lg">
        {/* Información del ejercicio */}
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
          </Group>
        </Card>

        {/* Error */}
        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            variant="light"
            title="Error"
          >
            {error}
          </Alert>
        )}

        {/* Formulario de edición */}
        <Card p="md" radius="md" withBorder bg={isDark ? "dark.7" : "white"}>
          <Text fw={600} size="md" mb="md" c="nutroos-green.6">
            Actualizar Registro
          </Text>

          <Stack gap="md">
            {/* Alerta informativa */}
            {(formData.seriesCompletadas || 0) === 0 && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                color="orange"
                variant="light"
                title="Añade al menos una serie"
              >
                Para habilitar los demás campos, primero debes completar al menos una serie.
              </Alert>
            )}

            {/* Repeticiones y Series */}
            <Group grow>
              <NumberInput
                label="Repeticiones Realizadas"
                placeholder="Ej: 12"
                min={0}
                value={formData.repeticionesRealizadas}
                onChange={(value) => setFormData(prev => ({ ...prev, repeticionesRealizadas: Number(value) || 0 }))}
                leftSection={<IconTarget size={16} />}
                disabled={(formData.seriesCompletadas || 0) === 0}
              />
              <NumberInput
                label="Series Completadas"
                placeholder="Ej: 3"
                min={0}
                value={formData.seriesCompletadas}
                onChange={(value) => setFormData(prev => ({ ...prev, seriesCompletadas: Number(value) || 0 }))}
                leftSection={<IconRepeat size={16} />}
              />
            </Group>

            {/* Carga y Tiempo de Descanso */}
            <Group grow>
              <NumberInput
                label="Carga Utilizada (kg)"
                placeholder="Ej: 20"
                min={0}
                value={formData.cargaUtilizada}
                onChange={(value) => setFormData(prev => ({ ...prev, cargaUtilizada: Number(value) || 0 }))}
                leftSection={<IconWeight size={16} />}
                disabled={(formData.seriesCompletadas || 0) === 0}
              />
              <NumberInput
                label="Tiempo de Descanso (segundos)"
                placeholder="Ej: 60"
                min={0}
                value={formData.tiempoDescanso}
                onChange={(value) => setFormData(prev => ({ ...prev, tiempoDescanso: Number(value) || 0 }))}
                leftSection={<IconClock size={16} />}
                disabled={(formData.seriesCompletadas || 0) === 0}
              />
            </Group>

            {/* Nivel de Esfuerzo */}
            <Box>
              <Text size="sm" fw={500} mb="xs">
                Nivel de Esfuerzo: {formData.nivelEsfuerzo}/10
              </Text>
            <Slider
              min={1}
              max={10}
              step={1}
              marks={[
                { value: 1, label: 'Fácil' },
                { value: 5, label: 'Moderado' },
                { value: 10, label: 'Máximo' }
              ]}
              color="nutroos-green"
              value={formData.nivelEsfuerzo}
              onChange={(value) => setFormData(prev => ({ ...prev, nivelEsfuerzo: value }))}
              disabled={formData.seriesCompletadas === 0}
            />
            </Box>

            {/* Video del ejercicio */}
            <Box>
              <Text size="sm" fw={500} mb="xs">
                Video del Ejercicio (Opcional)
              </Text>
              <FileInput
                placeholder="Selecciona un video"
                leftSection={<IconVideo size={16} />}
                accept="video/*"
                value={videoFile}
                onChange={setVideoFile}
              />
            </Box>

            {/* Notas */}
            <Box>
              <Text size="sm" fw={500} mb="xs">
                Notas del Ejercicio
              </Text>
              <Textarea
                placeholder="¿Cómo te sentiste? ¿Algún comentario sobre la técnica?"
                leftSection={<IconNotes size={16} />}
                value={formData.notas}
                onChange={(event) => setFormData(prev => ({ ...prev, notas: event.currentTarget.value }))}
                minRows={3}
              />
            </Box>

          </Stack>
        </Card>

        {/* Botones */}
        <Group justify="flex-end" gap="md">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            color="nutroos-green"
            leftSection={<IconCheck size={16} />}
            onClick={handleSubmit}
            loading={isSubmitting}
          >
            Actualizar Registro
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default ModalEditarRegistro;
