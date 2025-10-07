import React, { useState } from 'react';
import {
  Select,
  MultiSelect,
  TextInput,
  Button,
  Stack,
  Group,
  Text,
  Alert,
  Box,
  Textarea
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle, IconCheck, IconPlus, IconX } from '@tabler/icons-react';
import { DatosActividadFisica } from '../../../types/profile';

interface ActivityDataFormProps {
  initialData?: DatosActividadFisica;
  onSubmit: (data: {
    frecuenciaEjercicio: string;
    tipoEjercicioPractica: string[];
    objetivosPrincipales: string[];
    preferenciasEjercicios: string[];
    limitacionesFisicas: string[];
  }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const ActivityDataForm: React.FC<ActivityDataFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [preferenciasEjercicios, setPreferenciasEjercicios] = useState<string[]>(
    initialData?.preferenciasEjercicios || []
  );
  const [limitacionesFisicas, setLimitacionesFisicas] = useState<string[]>(
    initialData?.limitacionesFisicas || []
  );

  const form = useForm({
    initialValues: {
      frecuenciaEjercicio: initialData?.frecuenciaEjercicio || '',
      tipoEjercicioPractica: initialData?.tipoEjercicioPractica || [],
      objetivosPrincipales: initialData?.objetivosPrincipales || []
    },
    validate: {
      frecuenciaEjercicio: (value) => (!value ? 'Selecciona una frecuencia de ejercicio' : null),
      tipoEjercicioPractica: (value) => (value.length === 0 ? 'Selecciona al menos un tipo de ejercicio' : null),
      objetivosPrincipales: (value) => (value.length === 0 ? 'Selecciona al menos un objetivo' : null)
    }
  });

  const frecuenciaEjercicioOptions = [
    { value: 'Sedentario', label: 'Sedentario' },
    { value: 'Ocasional', label: 'Ocasional' },
    { value: 'Regular', label: 'Regular' },
    { value: 'Frecuente', label: 'Frecuente' },
    { value: 'Diario', label: 'Diario' }
  ];

  const tipoEjercicioOptions = [
    { value: 'Cardio', label: 'Cardio' },
    { value: 'Musculación', label: 'Musculación' },
    { value: 'Deportes de equipo', label: 'Deportes de equipo' },
    { value: 'Yoga/Pilates', label: 'Yoga/Pilates' },
    { value: 'Natación', label: 'Natación' },
    { value: 'Ciclismo', label: 'Ciclismo' },
    { value: 'Running', label: 'Running' },
    { value: 'Otros', label: 'Otros' }
  ];

  const objetivosOptions = [
    { value: 'Pérdida de peso', label: 'Pérdida de peso' },
    { value: 'Ganancia muscular', label: 'Ganancia muscular' },
    { value: 'Resistencia', label: 'Resistencia' },
    { value: 'Flexibilidad', label: 'Flexibilidad' },
    { value: 'Salud general', label: 'Salud general' },
    { value: 'Rehabilitación', label: 'Rehabilitación' }
  ];

  const addPreferencia = () => {
    setPreferenciasEjercicios([...preferenciasEjercicios, '']);
  };

  const removePreferencia = (index: number) => {
    setPreferenciasEjercicios(preferenciasEjercicios.filter((_, i) => i !== index));
  };

  const updatePreferencia = (index: number, value: string) => {
    const updated = [...preferenciasEjercicios];
    updated[index] = value;
    setPreferenciasEjercicios(updated);
  };

  const addLimitacion = () => {
    setLimitacionesFisicas([...limitacionesFisicas, '']);
  };

  const removeLimitacion = (index: number) => {
    setLimitacionesFisicas(limitacionesFisicas.filter((_, i) => i !== index));
  };

  const updateLimitacion = (index: number, value: string) => {
    const updated = [...limitacionesFisicas];
    updated[index] = value;
    setLimitacionesFisicas(updated);
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      await onSubmit({
        ...values,
        preferenciasEjercicios: preferenciasEjercicios.filter(p => p.trim() !== ''),
        limitacionesFisicas: limitacionesFisicas.filter(l => l.trim() !== '')
      });
    } catch (error) {
      console.error('Error al enviar formulario:', error);
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="lg">
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Información Importante"
          color="blue"
          variant="light"
        >
          Esta información nos ayudará a personalizar tus planes de entrenamiento según tus necesidades y limitaciones.
        </Alert>

        <Select
          comboboxProps={{
            zIndex: 1000
          }}
          label="Frecuencia de Ejercicio"
          placeholder="Selecciona tu frecuencia actual"
          data={frecuenciaEjercicioOptions}
          {...form.getInputProps('frecuenciaEjercicio')}
          required
        />

        <MultiSelect
          comboboxProps={{
            zIndex: 1000
          }}
          label="Tipos de Ejercicio que Practicas"
          placeholder="Selecciona los tipos de ejercicio que realizas"
          data={tipoEjercicioOptions}
          {...form.getInputProps('tipoEjercicioPractica')}
          searchable
          required
        />

        <MultiSelect
          comboboxProps={{
            zIndex: 1000
          }}
          label="Objetivos Principales"
          placeholder="Selecciona tus objetivos principales"
          data={objetivosOptions}
          {...form.getInputProps('objetivosPrincipales')}
          searchable
          required
        />

        <Box>
          <Group justify="space-between" mb="md">
            <Text size="sm" fw={500}>Preferencias de Ejercicios</Text>
            <Button
              size="xs"
              variant="light"
              leftSection={<IconPlus size={14} />}
              onClick={addPreferencia}
            >
              Agregar Preferencia
            </Button>
          </Group>

          <Stack gap="sm">
            {preferenciasEjercicios.map((preferencia, index) => (
              <Group key={index} gap="sm">
                <Textarea
                  placeholder="Describe tu preferencia de ejercicio..."
                  value={preferencia}
                  onChange={(e) => updatePreferencia(index, e.target.value)}
                  style={{ flex: 1 }}
                  minRows={2}
                  maxRows={3}
                />
                <Button
                  size="sm"
                  variant="light"
                  color="red"
                  onClick={() => removePreferencia(index)}
                >
                  <IconX size={14} />
                </Button>
              </Group>
            ))}
          </Stack>
        </Box>

        <Box>
          <Group justify="space-between" mb="md">
            <Text size="sm" fw={500}>Limitaciones Físicas</Text>
            <Button
              size="xs"
              variant="light"
              leftSection={<IconPlus size={14} />}
              onClick={addLimitacion}
            >
              Agregar Limitación
            </Button>
          </Group>

          <Stack gap="sm">
            {limitacionesFisicas.map((limitacion, index) => (
              <Group key={index} gap="sm">
                <TextInput
                  placeholder="Describe una limitación física"
                  value={limitacion}
                  onChange={(e) => updateLimitacion(index, e.target.value)}
                  style={{ flex: 1 }}
                />
                <Button
                  size="sm"
                  variant="light"
                  color="red"
                  onClick={() => removeLimitacion(index)}
                >
                  <IconX size={14} />
                </Button>
              </Group>
            ))}
          </Stack>
        </Box>

        <Group justify="flex-end" gap="sm">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            leftSection={<IconCheck size={16} />}
            loading={isLoading}
          >
            Guardar Cambios
          </Button>
        </Group>
      </Stack>
    </form>
  );
};

export default ActivityDataForm;
