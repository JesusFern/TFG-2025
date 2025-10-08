import React, { useState } from 'react';
import {
  NumberInput,
  Textarea,
  Button,
  Group,
  Stack,
  Text,
  Card,
  Badge,
  SimpleGrid,
  Box,
  Slider,
  FileInput,
  Progress
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { 
  IconRepeat, 
  IconTarget, 
  IconWeight, 
  IconClock, 
  IconVideo, 
  IconNotes,
  IconCheck
} from '@tabler/icons-react';
import { useThemeDetection } from '../../../hooks/useThemeDetection';
import { CrearRegistroEjercicioDTO } from '../../../types/training';
import { ejercicioVideoService } from '../../../services/ejercicioVideoService';

interface FormularioRegistroEjercicioProps {
  ejercicio: {
    _id: string;
    nombre: string;
    grupoMuscular: string;
    equipamiento: string;
    nivelDificultad: string;
  };
  sesionId: string;
  ejercicioSesion: {
    series: number;
    repeticiones: number;
    peso?: number;
    tiempoDescanso: number;
    nivelIntensidad: string;
  };
  onSubmit: (data: CrearRegistroEjercicioDTO) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const FormularioRegistroEjercicio: React.FC<FormularioRegistroEjercicioProps> = ({
  ejercicio,
  sesionId,
  ejercicioSesion,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const isDark = useThemeDetection();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [tiempoInicio] = useState<Date | null>(null);
  const [tiempoFin] = useState<Date | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  
  // Constantes para validación de video
  const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB para videos de clientes
  const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/avi', 'video/mov', 'video/quicktime', 'video/x-msvideo', 'video/webm'];

  const form = useForm<CrearRegistroEjercicioDTO>({
    initialValues: {
      ejercicio: ejercicio._id,
      sesion: sesionId,
      repeticionesRealizadas: ejercicioSesion.repeticiones,
      seriesCompletadas: ejercicioSesion.series,
      cargaUtilizada: ejercicioSesion.peso || 0,
      nivelEsfuerzo: 5,
      videoCliente: '',
      notas: '',
      tiempoDescanso: ejercicioSesion.tiempoDescanso,
      duracionEjercicio: 0,
      ordenEnSesion: 1,
      completado: true
    },
    validate: {
      repeticionesRealizadas: (value) => (value > 0 ? null : 'Las repeticiones deben ser mayores a 0'),
      seriesCompletadas: (value) => (value > 0 ? null : 'Las series deben ser mayores a 0'),
      nivelEsfuerzo: (value) => (value >= 1 && value <= 10 ? null : 'El nivel de esfuerzo debe estar entre 1 y 10'),
      cargaUtilizada: (value) => (value !== undefined && value >= 0 ? null : 'La carga no puede ser negativa')
    }
  });

  // Función para validar el archivo de video
  const validarArchivoVideo = (file: File): string | null => {
    // Validar tipo de archivo
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      return `El archivo debe ser un video válido (MP4, AVI, MOV, WebM). Archivo seleccionado: ${file.type || 'tipo desconocido'}`;
    }
    
    // Validar tamaño
    if (file.size > MAX_VIDEO_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      return `El video es demasiado grande (${sizeMB}MB). El tamaño máximo permitido es 100MB.`;
    }
    
    return null;
  };

  const handleSubmit = async (values: CrearRegistroEjercicioDTO) => {
    try {
      // Validar el video antes de intentar subirlo
      if (videoFile) {
        const errorValidacion = validarArchivoVideo(videoFile);
        if (errorValidacion) {
          setVideoError(errorValidacion);
          throw new Error(errorValidacion);
        }
      }
      
      // Calcular duración del ejercicio si se proporcionaron tiempos
      if (tiempoInicio && tiempoFin) {
        const duracionMs = tiempoFin.getTime() - tiempoInicio.getTime();
        values.duracionEjercicio = Math.round(duracionMs / 1000); // en segundos
      }

      // Subir video si se seleccionó uno
      if (videoFile) {
        try {
          const videoResponse = await ejercicioVideoService.uploadVideo(videoFile);
          values.videoCliente = videoResponse.videoUrl;
        } catch (videoError) {
          console.error('Error al subir video:', videoError);
          const errorMessage = (videoError as Error).message;
          
          // Mejorar mensajes de error
          if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
            throw new Error('Error de conexión al servidor. Verifica que el archivo sea un video válido y que tu conexión a internet funcione correctamente.');
          } else if (errorMessage.includes('413') || errorMessage.includes('Payload Too Large')) {
            throw new Error('El archivo es demasiado grande. El tamaño máximo permitido es 100MB.');
          } else if (errorMessage.includes('415') || errorMessage.includes('Unsupported Media Type')) {
            throw new Error('Tipo de archivo no soportado. Solo se permiten videos (MP4, AVI, MOV, WebM).');
          } else {
            throw new Error('Error al subir el video. Intenta de nuevo.');
          }
        }
      }

      await onSubmit(values);
    } catch (error) {
      console.error('Error al enviar formulario:', error);
      throw error; // Re-lanzar el error para que se muestre en el modal
    }
  };

  const calcularProgreso = () => {
    const seriesCompletadas = form.values.seriesCompletadas;
    const seriesProgramadas = ejercicioSesion.series;
    return Math.min((seriesCompletadas / seriesProgramadas) * 100, 100);
  };

  const progreso = calcularProgreso();

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
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
            <Badge color="nutroos-green" variant="light">
              {ejercicio.nivelDificultad}
            </Badge>
          </Group>

          {/* Progreso de series */}
          <Box mb="md">
            <Group justify="space-between" mb="xs">
              <Text size="sm" fw={500}>Progreso de Series</Text>
              <Text size="sm" c="dimmed">
                {form.values.seriesCompletadas} / {ejercicioSesion.series}
              </Text>
            </Group>
            <Progress 
              value={progreso} 
              color="nutroos-green" 
              size="sm" 
              radius="md"
            />
          </Box>

          {/* Parámetros programados */}
          <SimpleGrid cols={ejercicioSesion.peso !== undefined && ejercicioSesion.peso !== null && ejercicioSesion.peso > 0 ? 4 : 3} spacing="md">
            <Box>
              <Text size="xs" fw={600} c="dimmed" mb="xs">
                SERIES PROGRAMADAS
              </Text>
              <Group gap="xs">
                <IconRepeat size={16} color="var(--mantine-color-blue-6)" />
                <Text fw={600}>{ejercicioSesion.series}</Text>
              </Group>
            </Box>

            <Box>
              <Text size="xs" fw={600} c="dimmed" mb="xs">
                REPETICIONES
              </Text>
              <Group gap="xs">
                <IconTarget size={16} color="var(--mantine-color-teal-6)" />
                <Text fw={600}>{ejercicioSesion.repeticiones}</Text>
              </Group>
            </Box>

            {(() => {
              return ejercicioSesion.peso !== undefined && ejercicioSesion.peso !== null && ejercicioSesion.peso > 0;
            })() && (
              <Box>
                <Text size="xs" fw={600} c="dimmed" mb="xs">
                  PESO PROGRAMADO
                </Text>
                <Group gap="xs">
                  <IconWeight size={16} color="var(--mantine-color-orange-6)" />
                  <Text fw={600}>{ejercicioSesion.peso} kg</Text>
                </Group>
              </Box>
            )}

            <Box>
              <Text size="xs" fw={600} c="dimmed" mb="xs">
                DESCANSO
              </Text>
              <Group gap="xs">
                <IconClock size={16} color="var(--mantine-color-cyan-6)" />
                <Text fw={600}>{ejercicioSesion.tiempoDescanso}s</Text>
              </Group>
            </Box>
          </SimpleGrid>
        </Card>

        {/* Formulario de registro */}
        <Stack gap="md">
          <Text fw={600} size="lg" c="nutroos-green.6">
            Registro del Ejercicio
          </Text>

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <NumberInput
              label="Repeticiones Realizadas"
              placeholder="Ej: 12"
              leftSection={<IconTarget size={16} />}
              min={1}
              max={100}
              {...form.getInputProps('repeticionesRealizadas')}
            />

            <NumberInput
              label="Series Completadas"
              placeholder="Ej: 3"
              leftSection={<IconRepeat size={16} />}
              min={1}
              max={20}
              {...form.getInputProps('seriesCompletadas')}
            />

            <NumberInput
              label="Carga Utilizada (kg)"
              placeholder="Ej: 80"
              leftSection={<IconWeight size={16} />}
              min={0}
              max={1000}
              decimalScale={1}
              {...form.getInputProps('cargaUtilizada')}
            />

            <NumberInput
              label="Tiempo de Descanso (segundos)"
              placeholder="Ej: 120"
              leftSection={<IconClock size={16} />}
              min={0}
              max={600}
              {...form.getInputProps('tiempoDescanso')}
            />
          </SimpleGrid>

          <Box>
            <Text size="sm" fw={500} mb="xs">
              Nivel de Esfuerzo: {form.values.nivelEsfuerzo}/10
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
              {...form.getInputProps('nivelEsfuerzo')}
            />
          </Box>

          <FileInput
            label="Video del Ejercicio (Opcional)"
            placeholder="Selecciona un video"
            leftSection={<IconVideo size={16} />}
            accept="video/mp4,video/avi,video/mov,video/quicktime,video/x-msvideo,video/webm"
            value={videoFile}
            onChange={(file) => {
              if (file) {
                const errorValidacion = validarArchivoVideo(file);
                if (errorValidacion) {
                  setVideoError(errorValidacion);
                  return;
                }
              }
              setVideoError(null);
              setVideoFile(file);
            }}
            description="Sube un video de tu ejecución del ejercicio (MP4, AVI, MOV, WebM - máximo 100MB)"
            error={videoError}
          />

          <Textarea
            label="Notas del Ejercicio"
            placeholder="¿Cómo te sentiste? ¿Algún comentario sobre la técnica?"
            leftSection={<IconNotes size={16} />}
            minRows={3}
            maxRows={6}
            {...form.getInputProps('notas')}
          />
        </Stack>

        {/* Botones de acción */}
        <Group justify="flex-end" mt="lg">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            color="nutroos-green"
            leftSection={<IconCheck size={16} />}
            loading={loading}
          >
            Registrar Ejercicio
          </Button>
        </Group>
      </Stack>
    </form>
  );
};

export default FormularioRegistroEjercicio;
