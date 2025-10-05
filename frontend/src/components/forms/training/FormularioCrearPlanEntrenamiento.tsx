import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  Stack,
  Loader
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
  IconCheck,
  IconInfoCircle
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { rem } from '@mantine/core';
import trainingService from '../../../services/trainingService';
import { getUserById } from '../../../services/userService';
import DatePickerInput from '../../atoms/DatePickerInput';
import type { CrearPlanDTO, PlanEntrenamiento } from '../../../types/training';
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
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('planId');
  const tipo = searchParams.get('tipo');
  const [planOriginal, setPlanOriginal] = useState<PlanEntrenamiento | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const planCargadoRef = useRef(false);
  
  // Inicializar formulario
  const getInitialForm = () => {
    const baseForm = {
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
    };

    // Si es una copia, usar datos del plan original
    if (tipo === 'copia' && planOriginal) {
      return {
        ...baseForm,
        nombre: `${planOriginal.nombre} (Copia)`,
        descripcion: planOriginal.descripcion || '',
        objetivo: planOriginal.objetivo,
        duracionDias: planOriginal.duracionDias,
        sesionesPorSemana: planOriginal.sesionesPorSemana,
        diasSemana: planOriginal.diasSemana,
        publico: planOriginal.publico,
      };
    }

    return baseForm;
  };

  const [form, setForm] = useState<Omit<CrearPlanDTO, 'fechaInicio'> & { clientes: string[]; publico: boolean; fechaInicio: Date | null; diasSemana: number[] }>(getInitialForm());
  
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

  // Cargar plan original si es una copia
  useEffect(() => {
    if (tipo === 'copia' && planId && !planCargadoRef.current) {
      const cargarPlanOriginal = async () => {
        try {
          setLoadingPlan(true);
          planCargadoRef.current = true;
          const plan = await trainingService.obtenerPlanPorId(planId);
          setPlanOriginal(plan);
          
          // Actualizar el formulario con los datos del plan original
          setForm(prev => ({
            ...prev,
            nombre: `${plan.nombre} (Copia)`,
            descripcion: plan.descripcion || '',
            objetivo: plan.objetivo,
            duracionDias: plan.duracionDias,
            sesionesPorSemana: plan.sesionesPorSemana,
            diasSemana: plan.diasSemana,
            publico: plan.publico,
          }));
        } catch {
          onError(new Error('Error al cargar el plan original'));
        } finally {
          setLoadingPlan(false);
        }
      };
      cargarPlanOriginal();
    }
  }, [tipo, planId, onError]);

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
        draftMode: form.draftMode,
        // No crear sesiones automáticamente si estamos copiando un plan
        crearSesionesAutomaticamente: tipo !== 'copia'
      };

      const response = await trainingService.crearPlan(planData);
      
      // Si es una copia, copiar las sesiones del plan original
      if (tipo === 'copia' && planOriginal && response._id) {
        try {
          // Obtener las sesiones del plan original
          const sesionesOriginales = await trainingService.obtenerSesiones({ plan: planOriginal._id! });
          
          // Distribuir las sesiones en los días configurados del nuevo plan
          const fechaInicioNueva = new Date(form.fechaInicio!);
          const diasSemanaOrdenados = [...form.diasSemana].sort((a, b) => a - b);
          
          // Copiar cada sesión
          for (let i = 0; i < sesionesOriginales.length; i++) {
            const sesion = sesionesOriginales[i];
            
            // Calcular en qué semana y día debe ir esta sesión
            const semanaActual = Math.floor(i / form.sesionesPorSemana);
            const indiceDiaEnSemana = i % form.sesionesPorSemana;
            
            // Obtener el día de la semana correspondiente del nuevo plan
            const diaAsignado = diasSemanaOrdenados[indiceDiaEnSemana % diasSemanaOrdenados.length];
            
            // Calcular la fecha exacta
            const nuevaFecha = new Date(fechaInicioNueva);
            
            // Avanzar a la semana correspondiente
            nuevaFecha.setDate(nuevaFecha.getDate() + (semanaActual * 7));
            
            // Ajustar al día de la semana correcto
            const diaSemanaActual = nuevaFecha.getDay();
            let diasHastaObjetivo = (diaAsignado - diaSemanaActual + 7) % 7;
            
            // Si el día objetivo es hoy y no es la primera sesión, ir a la próxima semana
            if (diasHastaObjetivo === 0 && i > 0) {
              diasHastaObjetivo = 7;
            }
            
            nuevaFecha.setDate(nuevaFecha.getDate() + diasHastaObjetivo);
            
            // Mapear ejercicios
            const ejerciciosMapeados = sesion.ejercicios.map((ej) => {
              const ejercicioId = typeof ej.ejercicio === 'object' ? (ej.ejercicio as { _id: string })._id : ej.ejercicio;
              
              return {
                ejercicio: ejercicioId,
                series: ej.series,
                repeticiones: ej.repeticiones,
                peso: ej.peso,
                tiempoDescanso: ej.tiempoDescanso,
                nivelIntensidad: ej.nivelIntensidad,
                ejerciciosAlternativos: ej.ejerciciosAlternativos,
                opcionesProgresion: ej.opcionesProgresion,
                orden: ej.orden
              };
            });
            
            const nuevaSesion = {
              clienteId: form.clientes[0] || '', // Usar el primer cliente asignado
              planId: response._id,
              fecha: nuevaFecha.toISOString(),
              tipoEntrenamiento: sesion.tipoEntrenamiento,
              duracion: sesion.duracion,
              ejercicios: ejerciciosMapeados
            };
            
            await trainingService.crearSesion(nuevaSesion);
          }
        } catch (copyError) {
          console.error('Error al copiar sesiones:', copyError);
          // No fallar la creación del plan si hay error copiando sesiones
        }
      }
      
      onSuccess({ _id: response._id || '' });
    } catch (error) {
      console.error('Error al crear el plan:', error);
      // Mostrar el mensaje específico del backend si está disponible
      const errorMessage = error instanceof Error ? error.message : 'Error al crear el plan';
      onError(new Error(errorMessage));
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
            
            {/* Mostrar información si es una copia */}
            {tipo === 'copia' && planOriginal && (
              <Alert
                icon={<IconInfoCircle size={16} />}
                title="Copiando plan existente"
                color="orange"
                variant="light"
                mb="md"
                radius="lg"
              >
                <Text size="sm">
                  Estás copiando el plan: <Text span fw={600}>{planOriginal.nombre}</Text>
                </Text>
              </Alert>
            )}
            
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
            onClick={handleSubmit}
            loading={isSubmitting} 
            leftSection={isSubmitting ? undefined : <IconCheck size={rem(18)} />}
            color="nutroos-green"
            type="button"
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

  if (loadingPlan) {
    return (
      <Card withBorder radius="md" p="lg" style={{ backgroundColor: 'var(--app-paper-bg)' }}>
        <Stack align="center" gap="md" py="xl">
          <Loader size="lg" color="nutroos-green" />
          <Text ta="center" c="dimmed">Cargando plan original...</Text>
        </Stack>
      </Card>
    );
  }

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