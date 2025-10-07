import React, { useState } from 'react';
import {
  TextInput,
  NumberInput,
  MultiSelect,
  Select,
  Button,
  Stack,
  Group,
  Text,
  Alert,
  SimpleGrid,
  Box
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle, IconCheck, IconPlus, IconX } from '@tabler/icons-react';
import { DatosSaludYNutricion } from '../../../types/profile';

interface HealthDataFormProps {
  initialData?: DatosSaludYNutricion;
  onSubmit: (data: {
    altura: number;
    pesoActual: number;
    objetivoPeso: number;
    condicionesMedicas: string[];
    restriccionesDieteticas: string[];
    alergiasIntolerancias: string[];
    medicacionActual: string[];
    preferenciasAlimentarias: string[];
    horariosComidas: Array<{ comida: string; hora: string; }>;
  }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

interface MealTime {
  comida: string;
  hora: string;
}

const HealthDataForm: React.FC<HealthDataFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [mealTimes, setMealTimes] = useState<MealTime[]>(
    initialData?.horariosComidas || [
      { comida: 'Desayuno', hora: '08:00' },
      { comida: 'Almuerzo', hora: '13:00' },
      { comida: 'Cena', hora: '20:00' }
    ]
  );

  const form = useForm({
    initialValues: {
      altura: initialData?.altura || 0,
      pesoActual: initialData?.pesoActual || 0,
      objetivoPeso: initialData?.objetivoPeso || 0,
      condicionesMedicas: initialData?.condicionesMedicas || [],
      restriccionesDieteticas: initialData?.restriccionesDieteticas || [],
      alergiasIntolerancias: initialData?.alergiasIntolerancias || [],
      medicacionActual: initialData?.medicacionActual || [],
      preferenciasAlimentarias: initialData?.preferenciasAlimentarias || []
    },
    validate: {
      altura: (value) => (value < 50 || value > 250 ? 'La altura debe estar entre 50 y 250 cm' : null),
      pesoActual: (value) => (value < 20 || value > 500 ? 'El peso debe estar entre 20 y 500 kg' : null),
      objetivoPeso: (value) => (value < 20 || value > 500 ? 'El peso objetivo debe estar entre 20 y 500 kg' : null)
    }
  });

  const condicionesMedicasOptions = [
    'Diabetes',
    'Hipertensión',
    'Problemas cardíacos',
    'Problemas renales',
    'Problemas hepáticos',
    'Artritis',
    'Osteoporosis',
    'Asma',
    'Enfermedad tiroidea',
    'Otra'
  ];

  const restriccionesDieteticasOptions = [
    'Vegetariano',
    'Vegano',
    'Sin gluten',
    'Sin lactosa',
    'Sin azúcar',
    'Bajo en sodio',
    'Bajo en carbohidratos',
    'Alto en proteínas',
    'Keto',
    'Paleo',
    'Otra'
  ];

  const alergiasOptions = [
    'Frutos secos',
    'Mariscos',
    'Huevos',
    'Leche',
    'Soya',
    'Trigo',
    'Pescado',
    'Otra'
  ];

  const medicacionActualOptions = [
    'Paracetamol',
    'Ibuprofeno',
    'Aspirina',
    'Vitamina D',
    'Omega 3',
    'Multivitamínicos',
    'Proteína en polvo',
    'Creatina',
    'Antihistamínicos',
    'Antibióticos',
    'Medicación para la presión',
    'Insulina',
    'Anticoagulantes',
    'Otra'
  ];

  const preferenciasAlimentariasOptions = [
    'Comida picante',
    'Comida dulce',
    'Comida salada',
    'Comida ácida',
    'Texturas suaves',
    'Texturas crujientes',
    'Comida caliente',
    'Comida fría',
    'Otra'
  ];

  const comidasOptions = [
    'Desayuno',
    'Media mañana',
    'Almuerzo',
    'Merienda',
    'Cena',
    'Snack'
  ];

  const addMealTime = () => {
    setMealTimes([...mealTimes, { comida: 'Desayuno', hora: '08:00' }]);
  };

  const removeMealTime = (index: number) => {
    setMealTimes(mealTimes.filter((_, i) => i !== index));
  };

  const updateMealTime = (index: number, field: keyof MealTime, value: string) => {
    const updated = mealTimes.map((meal, i) => 
      i === index ? { ...meal, [field]: value } : meal
    );
    setMealTimes(updated);
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      await onSubmit({
        ...values,
        horariosComidas: mealTimes
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
          Esta información es confidencial y será utilizada únicamente para personalizar tus planes de nutrición y entrenamiento.
        </Alert>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <NumberInput
            label="Altura (cm)"
            placeholder="Ej: 175"
            {...form.getInputProps('altura')}
            min={50}
            max={250}
            required
          />

          <NumberInput
            label="Peso Actual (kg)"
            placeholder="Ej: 70"
            {...form.getInputProps('pesoActual')}
            min={20}
            max={500}
            required
          />

          <NumberInput
            label="Peso Objetivo (kg)"
            placeholder="Ej: 65"
            {...form.getInputProps('objetivoPeso')}
            min={20}
            max={500}
            required
          />
        </SimpleGrid>

        <MultiSelect
          label="Condiciones Médicas"
          placeholder="Selecciona las condiciones que aplican"
          data={condicionesMedicasOptions}
          {...form.getInputProps('condicionesMedicas')}
          searchable
          clearable
        />

        <MultiSelect
          label="Restricciones Dietéticas"
          placeholder="Selecciona las restricciones que aplican"
          data={restriccionesDieteticasOptions}
          {...form.getInputProps('restriccionesDieteticas')}
          searchable
          clearable
        />

        <MultiSelect
          label="Alergias e Intolerancias"
          placeholder="Selecciona las alergias que aplican"
          data={alergiasOptions}
          {...form.getInputProps('alergiasIntolerancias')}
          searchable
          clearable
        />

        <MultiSelect
          label="Medicación Actual"
          placeholder="Selecciona las medicaciones que tomas"
          data={medicacionActualOptions}
          {...form.getInputProps('medicacionActual')}
          searchable
          clearable
        />

        <MultiSelect
          label="Preferencias Alimentarias"
          placeholder="Selecciona tus preferencias"
          data={preferenciasAlimentariasOptions}
          {...form.getInputProps('preferenciasAlimentarias')}
          searchable
          clearable
        />

        <Box>
          <Group justify="space-between" mb="md">
            <Text size="sm" fw={500}>Horarios de Comidas</Text>
            <Button
              size="xs"
              variant="light"
              leftSection={<IconPlus size={14} />}
              onClick={addMealTime}
            >
              Agregar Comida
            </Button>
          </Group>

          <Stack gap="sm">
            {mealTimes.map((meal, index) => (
              <Group key={index} gap="sm">
                <Select
                  placeholder="Comida"
                  data={comidasOptions}
                  value={meal.comida}
                  onChange={(value) => updateMealTime(index, 'comida', value || '')}
                  style={{ flex: 1 }}
                />
                <TextInput
                  placeholder="HH:MM"
                  value={meal.hora}
                  onChange={(e) => updateMealTime(index, 'hora', e.target.value)}
                  style={{ width: 100 }}
                />
                <Button
                  size="sm"
                  variant="light"
                  color="red"
                  onClick={() => removeMealTime(index)}
                  disabled={mealTimes.length <= 1}
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

export default HealthDataForm;
