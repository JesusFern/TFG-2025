import React, { useMemo, useState, useEffect } from 'react';
import { 
  Button, 
  Group, 
  NumberInput, 
  TextInput, 
  Textarea, 
  Stepper, 
  Alert, 
  Text,
  Box,
  Paper,
  Card,
  Title,
  ActionIcon,
  Radio,
  RadioGroup,
  SimpleGrid,
  useMantineColorScheme,
  Checkbox,
  CheckboxGroup,
  Stack
} from '@mantine/core';
import { 
  IconAlertCircle, 
  IconCalendarStats, 
  IconClipboardText, 
  IconTarget,
  IconChevronRight,
  IconChevronLeft,
  IconUser,
  IconCalendar,
  IconCheck
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { rem } from '@mantine/core';
import trainingService from '../../../services/trainingService';
import { getUserById } from '../../../services/userService';
import DatePickerInput from '../../atoms/DatePickerInput';
import type { CrearPlanDTO } from '../../../types/training';
import { OBJETIVOS_ENTRENAMIENTO, DIAS_SEMANA_OPTIONS } from '../../../constants/training';

interface FormularioCrearPlanEntrenamientoProps {
  onSuccess: (planData: { _id: string }) => void;
  onError: (error: Error) => void;
  clientId?: string;
  clienteNombre?: string;
  onClienteNombreLoaded?: (nombre: string) => void;
}

const FormularioCrearPlanEntrenamiento: React.FC<FormularioCrearPlanEntrenamientoProps> = ({ 
  onSuccess, 
  onError, 
  clientId,
  clienteNombre: initialClienteNombre,
  onClienteNombreLoaded
}) => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const [clienteNombre, setClienteNombre] = useState(initialClienteNombre || '');
  
  const [form, setForm] = useState<Omit<CrearPlanDTO, 'fechaInicio'> & { clientes: string[]; publico: boolean; fechaInicio: Date | null; diasSemana: number[] }>({
    nombre: '',
    descripcion: '',
    objetivo: '',
    duracionDias: 30,
    sesionesPorSemana: 3,
    fechaInicio: new Date(),
    diasSemana: [],
    clientes: clientId ? [clientId] : [],
    publico: false,
    draftMode: true,
  });
  
  const [activeStep, setActiveStep] = useState(0);
  const [stepError, setStepError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Usar constantes importadas

  useEffect(() => {
    if (clientId && !clienteNombre) {
      const fetchClienteData = async () => {
        try {
          const userData = await getUserById(clientId);
          setClienteNombre(userData.fullName);
          onClienteNombreLoaded?.(userData.fullName);
        } catch (error) {
          console.error('Error al cargar datos del cliente:', error);
        }
      };
      fetchClienteData();
    }
  }, [clientId, clienteNombre, onClienteNombreLoaded]);

  const handleChange = (field: keyof (Omit<CrearPlanDTO, 'fechaInicio'> & { clientes: string[]; publico: boolean; fechaInicio: Date | null; diasSemana: number[] }), value: unknown) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setStepError(null);
  };

  const canGoNext = useMemo(() => {
    switch (activeStep) {
      case 0:
        return form.nombre.trim() !== '';
      case 1:
        return form.objetivo !== '';
      case 2:
        return form.duracionDias > 0 && form.sesionesPorSemana > 0 && form.fechaInicio !== null && form.clientes.length > 0;
      case 3:
        return form.diasSemana.length === form.sesionesPorSemana;
      default:
        return false;
    }
  }, [activeStep, form]);

  const handleNext = () => {
    if (canGoNext) {
      setActiveStep(prev => prev + 1);
      setStepError(null);
    }
  };

  const handlePrev = () => {
    setActiveStep(prev => prev - 1);
    setStepError(null);
  };

  const handleCancel = () => {
    window.history.back();
  };

  const handleSubmit = async () => {
    if (!canGoNext) {
      setStepError('Por favor completa todos los campos requeridos');
      return;
    }

    setIsSubmitting(true);
    setStepError(null);

    try {
      const planData: CrearPlanDTO = {
        nombre: form.nombre,
        descripcion: form.descripcion,
        objetivo: form.objetivo,
        duracionDias: form.duracionDias,
        sesionesPorSemana: form.sesionesPorSemana,
        fechaInicio: form.fechaInicio!.toISOString(),
        diasSemana: form.diasSemana,
        clientes: form.clientes,
        publico: form.publico,
        draftMode: form.draftMode
      };

      const response = await trainingService.crearPlan(planData);
      onSuccess({ _id: response._id || '' });
    } catch (error) {
      console.error('Error al crear el plan:', error);
      onError(error instanceof Error ? error : new Error('Error al crear el plan'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <>
            <Title order={4} mb="md" c="nutroos-green.6">Información básica</Title>
            
            <Paper p="md" radius="md" withBorder style={{ backgroundColor: 'var(--app-paper-bg)' }}>
              <Stack gap="md">
                <TextInput
                  label="Nombre del plan"
                  placeholder="Ej: Plan de fuerza para principiantes"
                  value={form.nombre}
                  onChange={(e) => handleChange('nombre', e.currentTarget.value)}
                  required
                  size="md"
                />
                
                <Textarea
                  label="Descripción"
                  placeholder="Describe los objetivos y características del plan..."
                  value={form.descripcion}
                  onChange={(e) => handleChange('descripcion', e.currentTarget.value)}
                  minRows={3}
                  size="md"
                />
              </Stack>
            </Paper>
          </>
        );

      case 1:
        return (
          <>
            <Title order={4} mb="md" c="nutroos-green.6">Objetivo del entrenamiento</Title>
            
            <Paper p="md" radius="md" withBorder style={{ backgroundColor: 'var(--app-paper-bg)' }}>
              <RadioGroup
                value={form.objetivo}
                onChange={(value) => handleChange('objetivo', value)}
                required
                mb="md"
                label="Selecciona el objetivo principal del plan"
              >
                <SimpleGrid cols={{base: 1, xs: 2}} spacing="lg">
                  {OBJETIVOS_ENTRENAMIENTO.map((objetivo) => (
                    <Radio
                      key={objetivo}
                      value={objetivo}
                      label={objetivo}
                      size="md"
                      color="nutroos-green"
                    />
                  ))}
                </SimpleGrid>
              </RadioGroup>
            </Paper>
          </>
        );

      case 2:
        return (
          <>
            <Title order={4} mb="md" c="nutroos-green.6">Configuración del plan</Title>
            
            <Paper p="md" radius="md" withBorder style={{ backgroundColor: 'var(--app-paper-bg)' }}>
              <Stack gap="md">
                <Group grow>
                  <NumberInput
                    label="Duración (días)"
                    value={form.duracionDias}
                    onChange={(value) => handleChange('duracionDias', value || 0)}
                    min={1}
                    max={365}
                    required
                    size="md"
                  />
                  <NumberInput
                    label="Sesiones por semana"
                    value={form.sesionesPorSemana}
                    onChange={(value) => handleChange('sesionesPorSemana', value || 0)}
                    min={1}
                    max={7}
                    required
                    size="md"
                  />
                </Group>

                <DatePickerInput
                  label="Fecha de inicio"
                  value={form.fechaInicio}
                  onChange={(date) => handleChange('fechaInicio', date)}
                  required
                />

                {clientId ? (
                  <Box>
                    <Text size="sm" fw={500} mb={5}>Cliente asignado</Text>
                    <Card
                      withBorder
                      p="sm"
                      radius="md"
                      style={{ backgroundColor: 'var(--app-paper-bg)', borderColor: 'var(--app-border-color)' }}
                    >
                      <Group gap="xs">
                        <ActionIcon variant="light" color="nutroos-green" radius="xl" size="md">
                          <IconUser size="1.2rem" />
                        </ActionIcon>
                        <div style={{ flex: 1 }}>
                          {clienteNombre ? (
                            <Text fw={600} size="md">{clienteNombre}</Text>
                          ) : (
                            <Text fw={400} size="sm" fs="italic" c="dimmed">Cargando información del cliente...</Text>
                          )}
                        </div>
                      </Group>
                    </Card>
                    <Text size="xs" mt={5} c="dimmed">Este plan se creará para las necesidades específicas de este cliente</Text>
                    <input type="hidden" value={clientId} />
                  </Box>
                ) : (
                  <Box>
                    <Text size="sm" fw={500} mb={5}>Clientes asignados</Text>
                    <Text size="xs" c="dimmed" mb="xs">
                      Selecciona los clientes para este plan (opcional)
                    </Text>
                    <Text size="xs" c="dimmed">
                      Nota: Los clientes se pueden asignar después de crear el plan
                    </Text>
                  </Box>
                )}
              </Stack>
            </Paper>
          </>
        );

      case 3:
        return (
          <>
            <Title order={4} mb="md" c="nutroos-green.6">Días de la semana</Title>
            
            <Paper p="md" radius="md" withBorder style={{ backgroundColor: 'var(--app-paper-bg)' }}>
              <Stack gap="md">
                <Text size="sm" c="dimmed" mb="md">
                  Selecciona {form.sesionesPorSemana} día{form.sesionesPorSemana > 1 ? 's' : ''} de la semana para las sesiones de entrenamiento
                </Text>

                <CheckboxGroup
                  value={form.diasSemana.map(String)}
                  onChange={(values) => handleChange('diasSemana', values.map(Number))}
                  required
                >
                  <SimpleGrid cols={{base: 1, xs: 2}} spacing="md">
                    {DIAS_SEMANA_OPTIONS.map((dia) => (
                      <Checkbox
                        key={dia.value}
                        value={String(dia.value)}
                        label={dia.label}
                        size="md"
                        color="nutroos-green"
                        disabled={form.diasSemana.length >= form.sesionesPorSemana && !form.diasSemana.includes(dia.value)}
                      />
                    ))}
                  </SimpleGrid>
                </CheckboxGroup>

                {form.diasSemana.length > 0 && (
                  <Box mt="md" p="sm" style={{ backgroundColor: 'var(--mantine-color-gray-0)', borderRadius: '8px' }}>
                    <Text size="sm" fw={500} mb="xs">Días seleccionados:</Text>
                    <Text size="sm" c="dimmed">
                      {form.diasSemana
                        .sort((a, b) => a - b)
                        .map(dia => DIAS_SEMANA_OPTIONS.find(d => d.value === dia)?.label)
                        .join(', ')}
                    </Text>
                  </Box>
                )}
              </Stack>
            </Paper>
          </>
        );

      default:
        return null;
    }
  };

  const renderNavButtons = () => {
    return (
      <Group justify="space-between" mt="xl">
        {activeStep > 0 ? (
          <Button 
            variant="outline"
            onClick={handlePrev}
            leftSection={<IconChevronLeft size={rem(18)} />}
            type="button"
            color={isDark ? "gray.4" : "dark"}
          >
            Anterior
          </Button>
        ) : (
          <Button 
            variant="outline"
            onClick={handleCancel}
            type="button"
            color={isDark ? "gray.4" : "dark"}
          >
            Cancelar
          </Button>
        )}
        
        {activeStep === 3 ? (
          <Button 
            type="submit"
            loading={isSubmitting} 
            leftSection={isSubmitting ? undefined : <IconCheck size={rem(18)} />}
            color="nutroos-green"
          >
            {isSubmitting ? 'Creando...' : 'Crear Plan'}
          </Button>
        ) : (
          <Button 
            onClick={handleNext}
            rightSection={<IconChevronRight size={rem(18)} />}
            disabled={!canGoNext}
            type="button"
            color="nutroos-green"
          >
            Siguiente
          </Button>
        )}
      </Group>
    );
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      <Card withBorder radius="md" p="lg" style={{ backgroundColor: 'var(--app-paper-bg)' }}>
        <Stepper
          active={activeStep}
          onStepClick={setActiveStep}
          size="sm"
          color="nutroos-green"
          mb="xl"
        >
        <Stepper.Step
          label="Información básica"
          description="Nombre y descripción"
          icon={<IconClipboardText size={18} />}
        />
        <Stepper.Step
          label="Objetivo"
          description="Objetivo del entrenamiento"
          icon={<IconTarget size={18} />}
        />
        <Stepper.Step
          label="Configuración"
          description="Duración y cliente"
          icon={<IconCalendarStats size={18} />}
        />
        <Stepper.Step
          label="Días de la semana"
          description="Seleccionar días"
          icon={<IconCalendar size={18} />}
        />
      </Stepper>

      {stepError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            variant="light"
            mb="md"
            withCloseButton
            onClose={() => setStepError(null)}
          >
            {stepError}
          </Alert>
        </motion.div>
      )}

      <Box mb="xl">
        {renderStepContent()}
      </Box>

        {renderNavButtons()}
      </Card>
    </form>
  );
};

export default FormularioCrearPlanEntrenamiento;