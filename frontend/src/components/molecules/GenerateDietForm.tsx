import React, { useState, useEffect } from 'react';
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
  IconSalad,
  IconCalendar,
  IconInfoCircle,
  IconCheck,
  IconAlertCircle,
  IconSparkles
} from '@tabler/icons-react';
import { DatePickerInput } from '@mantine/dates';
import { motion } from 'framer-motion';
import { dietTemplateService, InfoSuscripcionDietas, TipoArquetipo } from '../../services/dietTemplateService';
import { TIPOS_DIETA } from '../../constants/dietTypes';

interface GenerateDietFormProps {
  onSuccess: (dietaId: string) => void;
  onError: (error: string) => void;
  userSubscription?: InfoSuscripcionDietas;
}

interface FormData {
  nombre: string;
  descripcion: string;
  tipoArquetipo: string;
  tipo: string[];
  duracion: number;
  comidasDiarias: number;
  fechaInicio: Date | null;
}

const GenerateDietForm: React.FC<GenerateDietFormProps> = ({
  onSuccess,
  onError,
  userSubscription
}) => {
  const [form, setForm] = useState<FormData>({
    nombre: '',
    descripcion: '',
    tipoArquetipo: '',
    tipo: [],
    duracion: 28,
    comidasDiarias: 5,
    fechaInicio: new Date(Date.now() + 86400000) // Mañana
  });

  const [arquetipos, setArquetipos] = useState<TipoArquetipo[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarArquetipos = async () => {
      try {
        const response = await dietTemplateService.obtenerTiposArquetipo();
        setArquetipos(response.data);
      } catch (err) {
        console.error('Error al cargar arquetipos:', err);
        setError('Error al cargar las plantillas disponibles');
      }
    };

    cargarArquetipos();
  }, []);

  const arquetiposOptions = arquetipos.map(arq => ({
    value: arq.tipo,
    label: arq.nombre,
    description: arq.descripcion
  }));

  const tiposDietaOptions = TIPOS_DIETA.map(tipo => tipo);

  const comidasOptions = [
    { value: '2', label: '2 comidas' },
    { value: '3', label: '3 comidas' },
    { value: '4', label: '4 comidas' },
    { value: '5', label: '5 comidas' },
    { value: '6', label: '6 comidas' }
  ];

  const handleInputChange = (field: keyof FormData, value: string | number | Date | string[] | null) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const canProceedToStep2 = () => {
    return form.nombre.trim() !== '' && form.tipoArquetipo !== '';
  };

  const canProceedToStep3 = () => {
    return form.tipo.length > 0 && 
           form.duracion > 0 && 
           form.comidasDiarias >= 2 &&
           form.comidasDiarias <= 6 &&
           form.fechaInicio !== null;
  };

  const canSubmit = () => {
    return canProceedToStep2() && canProceedToStep3();
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

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await dietTemplateService.generarDietaDesdePlantillaCliente({
        nombre: form.nombre,
        descripcion: form.descripcion,
        tipoArquetipo: form.tipoArquetipo,
        tipo: form.tipo,
        duracion: form.duracion,
        comidasDiarias: form.comidasDiarias,
        fechaInicio: form.fechaInicio!.toISOString()
      });

      if (response.data && typeof response.data === 'object' && '_id' in response.data) {
        onSuccess((response.data as { _id: string })._id);
      } else {
        onError('Error: No se pudo obtener el ID de la dieta generada');
      }
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } }; message?: string }).response?.data?.message || (err as { message?: string }).message || 'Error al generar la dieta';
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
                <IconSalad size={20} />
                Información básica
              </Group>
            </Title>
            
            <TextInput
              label="Nombre de la dieta"
              placeholder="Ej: Mi dieta mediterránea personalizada"
              value={form.nombre}
              onChange={(e) => handleInputChange('nombre', e.currentTarget.value)}
              required
              size="md"
            />

            <Textarea
              label="Descripción (opcional)"
              placeholder="Describe tus objetivos y preferencias..."
              value={form.descripcion}
              onChange={(e) => handleInputChange('descripcion', e.currentTarget.value)}
              minRows={2}
              size="md"
            />

            <Select
              label="Plantilla base"
              placeholder="Selecciona un tipo de dieta"
              data={arquetiposOptions}
              value={form.tipoArquetipo}
              onChange={(value) => handleInputChange('tipoArquetipo', value || '')}
              required
              size="md"
              searchable
              description="Selecciona la plantilla que mejor se adapte a tus necesidades"
            />

            {form.tipoArquetipo && arquetipos.find(a => a.tipo === form.tipoArquetipo) && (
              <Alert
                icon={<IconInfoCircle size={16} />}
                color="blue"
                variant="light"
                radius="md"
              >
                <Text size="sm" fw={500} mb={4}>
                  {arquetipos.find(a => a.tipo === form.tipoArquetipo)?.nombre}
                </Text>
                <Text size="sm">
                  {arquetipos.find(a => a.tipo === form.tipoArquetipo)?.descripcion}
                </Text>
              </Alert>
            )}
          </Stack>
        );

      case 2:
        return (
          <Stack gap="md">
            <Title order={4} c="nutroos-green.6">
              <Group gap="xs">
                <IconCalendar size={20} />
                Configuración de la dieta
              </Group>
            </Title>

            <Text size="sm" c="dimmed" mb="xs">
              Selecciona al menos un tipo de dieta
            </Text>

            <CheckboxGroup
              value={form.tipo}
              onChange={(values) => handleInputChange('tipo', values)}
              required
            >
              <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="md">
                {tiposDietaOptions.map((tipo) => (
                  <Checkbox
                    key={tipo}
                    value={tipo}
                    label={tipo}
                    size="md"
                    color="nutroos-green"
                  />
                ))}
              </SimpleGrid>
            </CheckboxGroup>

            {form.tipo.length > 0 && (
              <Alert
                icon={<IconCheck size={16} />}
                color="green"
                variant="light"
                radius="md"
              >
                <Text size="sm">
                  Tipos seleccionados: {form.tipo.join(', ')}
                </Text>
              </Alert>
            )}
          </Stack>
        );

      case 3:
        return (
          <Stack gap="md">
            <Title order={4} c="nutroos-green.6">
              <Group gap="xs">
                <IconCalendar size={20} />
                Planificación
              </Group>
            </Title>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <NumberInput
                label="Duración (días)"
                value={form.duracion}
                onChange={(value) => handleInputChange('duracion', value || 28)}
                min={7}
                max={365}
                step={7}
                required
                size="md"
                description="Entre 7 y 365 días"
              />

              <Select
                label="Comidas diarias"
                data={comidasOptions}
                value={form.comidasDiarias.toString()}
                onChange={(value) => handleInputChange('comidasDiarias', parseInt(value || '5'))}
                required
                size="md"
                description="Entre 2 y 6 comidas al día"
              />
            </SimpleGrid>

            <DatePickerInput
              label="Fecha de inicio"
              placeholder="Selecciona una fecha"
              value={form.fechaInicio}
              onChange={(date) => handleInputChange('fechaInicio', date || null)}
              required
              minDate={new Date(Date.now() + 86400000)}
              size="md"
              description="La dieta comenzará a partir de esta fecha"
            />
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
        return form.tipo.length > 0;
      case 3:
        return canProceedToStep3();
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
                Generar Dieta Personalizada
              </Group>
            </Title>
            <Text size="sm" c="dimmed" mt="xs">
              Crea una dieta adaptada a tus necesidades usando nuestras plantillas inteligentes
            </Text>
          </div>
          
          {userSubscription && (
            <Badge
              color={userSubscription.dietasCreadas < userSubscription.limiteDietas ? 'green' : 'red'}
              variant="light"
              size="lg"
            >
              {userSubscription.dietasCreadas}/{userSubscription.limiteDietas} dietas
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
              rightSection={<IconSalad size={16} />}
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
              {isSubmitting ? 'Generando...' : 'Generar Dieta'}
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
            Tu dieta se generará automáticamente basándose en la plantilla seleccionada. 
            Una vez creada, podrás verla y consultarla en la sección de dietas.
          </Text>
        </Alert>
      </Stack>
    </Paper>
  );
};

export default GenerateDietForm;

