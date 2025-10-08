import React, { useState } from 'react';
import {
  Paper,
  Title,
  Text,
  Button,
  Group,
  Select,
  NumberInput,
  TextInput,
  Textarea,
  Checkbox,
  CheckboxGroup,
  SimpleGrid,
  Stack,
  Alert,
  Progress,
  Badge,
  Box
} from '@mantine/core';
import {
  IconTarget,
  IconCalendar,
  IconBarbell,
  IconInfoCircle,
  IconCheck,
  IconAlertCircle,
  IconSparkles
} from '@tabler/icons-react';
import DatePickerInput from '../atoms/DatePickerInput';
import { motion } from 'framer-motion';
import { trainingService } from '../../services/trainingService';
import { OBJETIVOS_ENTRENAMIENTO, DIAS_SEMANA_OPTIONS } from '../../constants/training';

interface GenerateTrainingPlanFormProps {
  onSuccess: (planId: string) => void;
  onError: (error: string) => void;
  userSubscription?: {
    tipoPlan: string;
    limitePlanes: number;
    planesCreados: number;
  };
}

interface FormData {
  nombre: string;
  descripcion: string;
  objetivo: string;
  duracionDias: number;
  sesionesPorSemana: number;
  fechaInicio: Date | null;
  diasSemana: number[];
  nivelDificultad: string;
}

const GenerateTrainingPlanForm: React.FC<GenerateTrainingPlanFormProps> = ({
  onSuccess,
  onError,
  userSubscription
}) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const [form, setForm] = useState<FormData>({
    nombre: '',
    descripcion: '',
    objetivo: '',
    duracionDias: 30,
    sesionesPorSemana: 3,
    fechaInicio: tomorrow,
    diasSemana: [],
    nivelDificultad: 'Intermedio'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const nivelDificultadOptions = [
    { value: 'Principiante', label: 'Principiante' },
    { value: 'Intermedio', label: 'Intermedio' },
    { value: 'Avanzado', label: 'Avanzado' }
  ];

  const objetivosOptions = OBJETIVOS_ENTRENAMIENTO.map(objetivo => ({
    value: objetivo,
    label: objetivo
  }));

  const handleInputChange = (field: keyof FormData, value: string | number | Date | number[] | null) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const MAX_NOMBRE_LENGTH = 100;
  const MAX_DESCRIPCION_LENGTH = 1000;

  const canProceedToStep2 = () => {
    return form.nombre.trim() !== '' && 
           form.nombre.length <= MAX_NOMBRE_LENGTH &&
           form.descripcion.length <= MAX_DESCRIPCION_LENGTH &&
           form.objetivo !== '';
  };

  const canProceedToStep3 = () => {
    return form.duracionDias >= 7 && 
           form.sesionesPorSemana >= 2 && 
           form.fechaInicio !== null &&
           form.nivelDificultad !== '';
  };

  const canSubmit = () => {
    return form.diasSemana.length === form.sesionesPorSemana;
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit()) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    // Validar longitudes antes de enviar
    if (form.nombre.length > MAX_NOMBRE_LENGTH) {
      setError(`El nombre del plan no puede exceder los ${MAX_NOMBRE_LENGTH} caracteres`);
      return;
    }
    if (form.descripcion.length > MAX_DESCRIPCION_LENGTH) {
      setError(`La descripción no puede exceder los ${MAX_DESCRIPCION_LENGTH} caracteres`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await trainingService.generarPlantillaAutomatica({
        nombre: form.nombre,
        descripcion: form.descripcion,
        objetivo: form.objetivo,
        duracionDias: form.duracionDias,
        sesionesPorSemana: form.sesionesPorSemana,
        fechaInicio: form.fechaInicio!.toISOString(),
        diasSemana: form.diasSemana,
        nivelDificultad: form.nivelDificultad
      });

      if (response.plan._id) {
        onSuccess(response.plan._id.toString());
      } else {
        onError('Error: No se pudo obtener el ID del plan generado');
      }
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } }; message?: string }).response?.data?.message || (err as { message?: string }).message || 'Error al generar el plan';
      onError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <Stack gap="md">
            <Title order={4} c="nutroos-green.6">
              <Group gap="xs">
                <IconTarget size={20} />
                Información básica
              </Group>
            </Title>
            
            <Stack gap="xs">
              <TextInput
                label="Nombre del plan"
                placeholder="Ej: Mi plan de fuerza personalizado"
                description="El nombre debe tener entre 1 y 100 caracteres"
                value={form.nombre}
                onChange={(e) => handleInputChange('nombre', e.currentTarget.value)}
                required
                size="md"
                error={
                  form.nombre.length === 0 ? undefined :
                  form.nombre.trim().length === 0 ? 'El nombre no puede estar vacío' :
                  form.nombre.length > MAX_NOMBRE_LENGTH ? `El nombre no puede exceder los ${MAX_NOMBRE_LENGTH} caracteres` : 
                  undefined
                }
              />
              <Group justify="flex-end">
                <Text 
                  size="xs" 
                  c={form.nombre.length > MAX_NOMBRE_LENGTH ? 'red' : form.nombre.length > MAX_NOMBRE_LENGTH * 0.9 ? 'orange' : 'dimmed'}
                >
                  {form.nombre.length} / {MAX_NOMBRE_LENGTH} caracteres
                </Text>
              </Group>
            </Stack>

            <Stack gap="xs">
              <Textarea
                label="Descripción (opcional)"
                placeholder="Describe tus objetivos específicos..."
                value={form.descripcion}
                onChange={(e) => handleInputChange('descripcion', e.currentTarget.value)}
                minRows={3}
                maxRows={6}
                size="md"
                error={form.descripcion.length > MAX_DESCRIPCION_LENGTH ? `La descripción no puede exceder los ${MAX_DESCRIPCION_LENGTH} caracteres` : undefined}
              />
              <Group justify="flex-end">
                <Text 
                  size="xs" 
                  c={form.descripcion.length > MAX_DESCRIPCION_LENGTH ? 'red' : form.descripcion.length > MAX_DESCRIPCION_LENGTH * 0.9 ? 'orange' : 'dimmed'}
                >
                  {form.descripcion.length} / {MAX_DESCRIPCION_LENGTH} caracteres
                </Text>
              </Group>
            </Stack>

            <Select
              comboboxProps={{
                zIndex: 1000
              }}
              label="Objetivo principal"
              placeholder="Selecciona tu objetivo"
              data={objetivosOptions}
              value={form.objetivo}
              onChange={(value) => handleInputChange('objetivo', value || '')}
              required
              size="md"
              searchable
            />
          </Stack>
        );

      case 2:
        return (
          <Stack gap="md">
            <Title order={4} c="nutroos-green.6">
              <Group gap="xs">
                <IconCalendar size={20} />
                Configuración del plan
              </Group>
            </Title>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <NumberInput
                label="Duración (días)"
                description="Mínimo 1 semana (7 días)"
                value={form.duracionDias}
                onChange={(value) => handleInputChange('duracionDias', value || 30)}
                min={7}
                max={365}
                required
                size="md"
              />

              <NumberInput
                label="Sesiones por semana"
                description="Mínimo 2 sesiones"
                value={form.sesionesPorSemana}
                onChange={(value) => handleInputChange('sesionesPorSemana', value || 3)}
                min={2}
                max={7}
                required
                size="md"
              />
            </SimpleGrid>

            <DatePickerInput
              label="Fecha de inicio"
              value={form.fechaInicio}
              onChange={(date) => handleInputChange('fechaInicio', date || null)}
              required
              minDate={new Date()}
            />

            <Select
              comboboxProps={{
                zIndex: 1000
              }}
              label="Nivel de dificultad"
              placeholder="Selecciona tu nivel"
              data={nivelDificultadOptions}
              value={form.nivelDificultad}
              onChange={(value) => handleInputChange('nivelDificultad', value || 'Intermedio')}
              required
              size="md"
            />
          </Stack>
        );

      case 3:
        return (
          <Stack gap="md">
            <Title order={4} c="nutroos-green.6">
              <Group gap="xs">
                <IconBarbell size={20} />
                Días de entrenamiento
              </Group>
            </Title>

            <Text size="sm" c="dimmed">
              Selecciona {form.sesionesPorSemana} día{form.sesionesPorSemana > 1 ? 's' : ''} de la semana para tus entrenamientos
            </Text>

            <CheckboxGroup
              value={form.diasSemana.map(String)}
              onChange={(values) => handleInputChange('diasSemana', values.map(Number))}
              required
            >
              <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="md">
                {DIAS_SEMANA_OPTIONS.map((dia) => (
                  <Checkbox
                    key={dia.value}
                    value={String(dia.value)}
                    label={dia.label}
                    size="md"
                    color="nutroos-green"
                    disabled={
                      form.diasSemana.length >= form.sesionesPorSemana && 
                      !form.diasSemana.includes(dia.value)
                    }
                  />
                ))}
              </SimpleGrid>
            </CheckboxGroup>

            {form.diasSemana.length > 0 && (
              <Alert
                icon={<IconCheck size={16} />}
                color="green"
                variant="light"
                radius="md"
              >
                <Text size="sm">
                  Días seleccionados: {form.diasSemana
                    .sort((a, b) => a - b)
                    .map(dia => DIAS_SEMANA_OPTIONS.find(d => d.value === dia)?.label)
                    .join(', ')}
                </Text>
              </Alert>
            )}
          </Stack>
        );

      default:
        return null;
    }
  };

  const getStepValidation = () => {
    switch (step) {
      case 1:
        return canProceedToStep2();
      case 2:
        return canProceedToStep3();
      case 3:
        return canSubmit();
      default:
        return false;
    }
  };

  return (
    <Paper p="lg" radius="md" withBorder>
      <Stack gap="lg">
        {/* Header con información de suscripción */}
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={3} c="nutroos-green.6">
              <Group gap="xs">
                <IconSparkles size={24} />
                Generar Plan Personalizado
              </Group>
            </Title>
            <Text size="sm" c="dimmed" mt="xs">
              Crea un plan de entrenamiento adaptado a tus necesidades usando nuestras plantillas inteligentes
            </Text>
          </div>
          
          {userSubscription && (
            <Badge
              color={userSubscription.planesCreados < userSubscription.limitePlanes ? 'green' : 'red'}
              variant="light"
              size="lg"
            >
              {userSubscription.planesCreados}/{userSubscription.limitePlanes} planes
            </Badge>
          )}
        </Group>

        {/* Progress bar */}
        <Progress
          value={(step / 3) * 100}
          size="sm"
          radius="md"
          color="nutroos-green"
          animated
        />

        {/* Error alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="red"
              variant="light"
              radius="md"
              withCloseButton
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          </motion.div>
        )}

        {/* Step content */}
        <Box>
          {renderStepContent()}
        </Box>

        {/* Navigation buttons */}
        <Group justify="space-between">
          {step > 1 ? (
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={isSubmitting}
              color="gray"
            >
              Anterior
            </Button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <Button
              onClick={handleNext}
              disabled={!getStepValidation() || isSubmitting}
              color="nutroos-green"
              rightSection={<IconTarget size={16} />}
            >
              Siguiente
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              loading={isSubmitting}
              disabled={!canSubmit()}
              color="nutroos-green"
              rightSection={isSubmitting ? undefined : <IconSparkles size={16} />}
            >
              {isSubmitting ? 'Generando...' : 'Generar Plan'}
            </Button>
          )}
        </Group>

        {/* Info sobre el proceso */}
        <Alert
          icon={<IconInfoCircle size={16} />}
          color="blue"
          variant="light"
          radius="md"
        >
          <Text size="sm">
            Tu plan se generará automáticamente con ejercicios personalizados según tu objetivo y nivel. 
            Una vez creado, podrás verlo y editarlo en la sección de planes.
          </Text>
        </Alert>
      </Stack>
    </Paper>
  );
};

export default GenerateTrainingPlanForm;
