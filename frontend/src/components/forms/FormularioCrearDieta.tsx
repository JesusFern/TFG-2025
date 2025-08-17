import React, { useState, useEffect, useCallback } from 'react';
import { 
  TextInput, 
  Textarea, 
  NumberInput, 
  Select, 
  Button, 
  Group, 
  SimpleGrid, 
  Checkbox, 
  CheckboxGroup,
  Text,
  Box,
  Card,
  Stepper,
  Title,
  rem,
  useMantineTheme,
  ActionIcon,
  Alert
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { 
  IconCalendar, 
  IconCheck, 
  IconUser, 
  IconSalad, 
  IconClock, 
  IconChevronRight,
  IconChevronLeft,
  IconCalendarStats,
  IconAlertCircle
} from '@tabler/icons-react';
import { useMediaQuery } from '@mantine/hooks';
import { crearDieta } from '../../services/dietService';
import { CrearDietaDTO, DietaResponse } from '../../types';

interface FormularioCrearDietaProps {
  onSuccess: (dietaData: DietaResponse) => void;
  onError: (error: Error) => void;
  clienteId?: string;
  clienteNombre?: string;
}

const FormularioCrearDieta: React.FC<FormularioCrearDietaProps> = ({ 
  onSuccess, 
  onError, 
  clienteId = "687526841859b1606e92f3f9",
  clienteNombre = "Juan Pérez" 
}) => {
  const theme = useMantineTheme();
  const styles = {
    boxContainer: {
      backgroundColor: theme.colors.gray[0],
      borderRadius: theme.radius.md,
    },
    clientCard: {
      backgroundColor: theme.colors.gray[0],
    }
  };
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  
  const tiposDieta = [
    'Mediterránea',
    'Vegetariana',
    'Vegana',
    'Keto',
    'Sin gluten',
    'Baja en carbohidratos',
    'Alta en proteínas',
    'Otras'
  ];

  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<CrearDietaDTO>({
    nombre: '',
    descripcion: '',
    tipo: [],
    duracion: 28,
    comidasDiarias: 3,
    fechaInicio: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Mañana
    asignadaA: clienteId || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);

  const isValidMongoId = (id?: string) => id && /^[0-9a-fA-F]{24}$/.test(id);

  useEffect(() => {
    if (clienteId) {
      if (isValidMongoId(clienteId)) {
        setFormData(prev => ({
          ...prev,
          asignadaA: clienteId
        }));
      } else {
        console.error(`ID de cliente inválido: ${clienteId}`);
      }
    }
  }, [clienteId]);

  const handleInputChange = (field: keyof CrearDietaDTO, value: string | number | string[] | Date) => {
    if (field === 'fechaInicio' && value instanceof Date) {
      setFormData(prev => ({
        ...prev,
        [field]: value.toISOString().split('T')[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    setStepError(null);
  };

  const handleTipoChange = (value: string[]) => {
    setFormData(prev => ({
      ...prev,
      tipo: value
    }));
    setStepError(null);
  };

  const validateCurrentStep = useCallback((): {isValid: boolean, error: string | null} => {
    if (activeStep === 0) {
      if (!formData.nombre.trim()) {
        return { isValid: false, error: 'El nombre de la dieta es obligatorio' };
      }
    } else if (activeStep === 1) {
      if (formData.tipo.length === 0) {
        return { isValid: false, error: 'Debes seleccionar al menos un tipo de dieta' };
      }
    } else if (activeStep === 2) {
      if (!formData.duracion || formData.duracion < 1) {
        return { isValid: false, error: 'La duración debe ser un número entero mayor que 0' };
      }
      
      if (!formData.comidasDiarias || formData.comidasDiarias <= 1 || formData.comidasDiarias >= 10) {
        return { isValid: false, error: 'El número de comidas debe ser entre 2 y 9' };
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startDate = new Date(formData.fechaInicio);
      if (startDate <= today) {
        return { isValid: false, error: 'La fecha de inicio debe ser posterior al día actual' };
      }
    }
    return { isValid: true, error: null };
  }, [activeStep, formData]);
  
  const isCurrentStepValid = useCallback(() => {
    return validateCurrentStep().isValid;
  }, [validateCurrentStep]);

  const handleNextClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Manejando clic en Siguiente, previniendo envío del formulario");
    
    const validation = validateCurrentStep();
    if (validation.isValid) {
      setStepError(null);
      setActiveStep((current) => Math.min(current + 1, 2));
    } else {
      setStepError(validation.error);
    }
  };

  const handlePrevClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Manejando clic en Anterior, previniendo envío del formulario");
    
    setStepError(null);
    setActiveStep((current) => Math.max(current - 1, 0));
  };

  const handleCancelClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Manejando clic en Cancelar, previniendo envío del formulario");
    
    window.history.back();
  };

  const validateBeforeSubmit = (): string | null => {
    if (!formData.asignadaA || !isValidMongoId(formData.asignadaA)) {
      return `ID de cliente inválido: "${formData.asignadaA}". Debe ser un ObjectId válido`;
    }
    
    if (!formData.nombre.trim()) {
      return 'El nombre de la dieta es obligatorio';
    }
    
    if (formData.tipo.length === 0) {
      return 'Debes seleccionar al menos un tipo de dieta';
    }
    
    if (!formData.duracion || formData.duracion < 1) {
      return 'La duración debe ser un número entero mayor que 0';
    }
    
    if (!formData.comidasDiarias || formData.comidasDiarias <= 1 || formData.comidasDiarias >= 10) {
      return 'El número de comidas debe ser entre 2 y 9';
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(formData.fechaInicio);
    if (startDate <= today) {
      return 'La fecha de inicio debe ser posterior al día actual';
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Enviando formulario completo (handleSubmit)");
    
    const errorMessage = validateBeforeSubmit();
    if (errorMessage) {
      setStepError(errorMessage);
      onError(new Error(errorMessage));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const fechaArr = formData.fechaInicio.split('-'); // [yyyy, mm, dd]
      const fechaFormateada = `${fechaArr[2]}-${fechaArr[1]}-${fechaArr[0]}`;
      
      console.log("Enviando datos al backend:", {
        ...formData,
        fechaInicio: fechaFormateada
      });
      
      const response = await crearDieta({
        ...formData,
        fechaInicio: fechaFormateada
      });
      
      console.log("Respuesta exitosa del backend:", response);
      onSuccess(response.dieta);
      
      setFormData({
        nombre: '',
        descripcion: '',
        tipo: [],
        duracion: 28,
        comidasDiarias: 3,
        fechaInicio: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        asignadaA: clienteId || ''
      });
      setActiveStep(0);
    } catch (error) {
      console.error("Error al enviar:", error);
      onError(error instanceof Error ? error : new Error('Error desconocido'));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const fechaInicioDate = formData.fechaInicio ? new Date(formData.fechaInicio) : new Date(Date.now() + 86400000);

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <>
            <Title order={4} mb="md" c={theme.colors.blue[6]}>Información básica de la dieta</Title>
            
            <TextInput
              label="Nombre de la dieta"
              placeholder="Ej: Dieta mediterránea equilibrada"
              required
              value={formData.nombre}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
              mb="md"
              leftSection={<IconSalad size={16} />}
              size="md"
            />
            
            <Textarea
              label="Descripción"
              placeholder="Describe brevemente esta dieta y sus objetivos principales"
              minRows={3}
              value={formData.descripcion || ''}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              mb="md"
              size="md"
            />
          </>
        );
      case 1:
        return (
          <>
            <Title order={4} mb="md" c={theme.colors.blue[6]}>Tipo de dieta</Title>
            
            <Box mb="xl" p="md" style={styles.boxContainer}>
              <CheckboxGroup
                value={formData.tipo}
                onChange={handleTipoChange}
                required
                mb="md"
                label="Selecciona al menos un tipo de dieta"
              >
                <SimpleGrid cols={{base: 1, xs: 2}} spacing="lg">
                  {tiposDieta.map((tipo) => (
                    <Checkbox
                      key={tipo}
                      value={tipo}
                      label={tipo}
                      size="md"
                    />
                  ))}
                </SimpleGrid>
              </CheckboxGroup>
            </Box>
          </>
        );
      case 2:
        return (
          <>
            <Title order={4} mb="md" c={theme.colors.blue[6]}>Planificación de la dieta</Title>
            
            <SimpleGrid cols={{base: 1, sm: 2}} spacing="md" mb="md">
              <NumberInput
                label="Duración (días)"
                description="Duración total del plan (entre 1 y 365 días)"
                min={1}
                max={365}
                step={7}
                required
                value={formData.duracion}
                onChange={(val) => handleInputChange('duracion', val || 28)}
                leftSection={<IconCalendarStats size={16} />}
                size="md"
              />
              
              <Select
                label="Comidas diarias"
                description="Número de comidas al día (entre 2 y 9)"
                data={[
                  { value: '2', label: '2 comidas' },
                  { value: '3', label: '3 comidas' },
                  { value: '4', label: '4 comidas' },
                  { value: '5', label: '5 comidas' },
                  { value: '6', label: '6 comidas' }
                ]}
                value={formData.comidasDiarias.toString()}
                onChange={(val) => handleInputChange('comidasDiarias', parseInt(val || '3'))}
                required
                size="md"
              />
              
              <DatePickerInput
                label="Fecha de inicio"
                placeholder="Selecciona una fecha"
                description="Debe ser posterior a hoy"
                leftSection={<IconCalendar size={16} />}
                value={fechaInicioDate}
                onChange={(date) => date && handleInputChange('fechaInicio', date)}
                required
                clearable={false}
                minDate={new Date(Date.now() + 86400000)}
                size="md"
              />
              
              <Box>
                <Text size="sm" fw={500} mb={5}>Cliente asignado</Text>
                <Card
                  withBorder
                  p="sm"
                  radius="md"
                  style={styles.clientCard}
                >
                  <Group gap="xs">
                    <ActionIcon variant="light" color="blue" radius="xl" size="md">
                      <IconUser size="1.2rem" />
                    </ActionIcon>
                    <Text fw={500}>{clienteNombre}</Text>
                  </Group>
                </Card>
                <input type="hidden" value={clienteId || ''} />
              </Box>
            </SimpleGrid>
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
            variant="default" 
            onClick={handlePrevClick}
            leftSection={<IconChevronLeft size={rem(18)} />}
            type="button"
          >
            Anterior
          </Button>
        ) : (
          <Button 
            variant="default" 
            onClick={handleCancelClick}
            type="button"
          >
            Cancelar
          </Button>
        )}
        
        {activeStep === 2 ? (
          <Button 
            type="submit"
            loading={isSubmitting} 
            leftSection={isSubmitting ? undefined : <IconCheck size={rem(18)} />}
            color="green"
          >
            {isSubmitting ? 'Creando...' : 'Crear Dieta'}
          </Button>
        ) : (
          <Button 
            onClick={handleNextClick}
            rightSection={<IconChevronRight size={rem(18)} />}
            disabled={!isCurrentStepValid()}
            type="button"
          >
            Siguiente
          </Button>
        )}
      </Group>
    );
  };

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <div>
        {stepError && (
          <Alert 
            icon={<IconAlertCircle size={16} />} 
            title="Error de validación" 
            color="red" 
            mb="md"
            withCloseButton
            onClose={() => setStepError(null)}
          >
            {stepError}
          </Alert>
        )}
        
        <Stepper
          active={activeStep}
          onStepClick={setActiveStep}
          orientation={isMobile ? "vertical" : "horizontal"}
          allowNextStepsSelect={false}
          iconSize={32}
          mb="xl"
        >
          <Stepper.Step
            icon={<IconSalad size="1.5rem" />}
            label="Información básica"
            description="Nombre y descripción"
          />
          <Stepper.Step
            icon={<IconClock size="1.5rem" />}
            label="Tipo de dieta"
            description="Características"
          />
          <Stepper.Step
            icon={<IconCalendarStats size="1.5rem" />}
            label="Planificación"
            description="Duración y comidas"
          />
        </Stepper>
        
        {activeStep < 2 ? (
          <>
            {renderStepContent()}
            {renderNavButtons()}
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            {renderStepContent()}
            {renderNavButtons()}
          </form>
        )}
      </div>
    </Card>
  );
};

export default FormularioCrearDieta;