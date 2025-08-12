import React, { useState, useEffect } from 'react';
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
  ActionIcon
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
  IconCalendarStats
} from '@tabler/icons-react';
import { crearDieta } from '../../services/dietService';
import { CrearDietaDTO, DietaResponse } from '../../types';
import { useMediaQuery } from '@mantine/hooks';

interface FormularioCrearDietaProps {
  onSuccess: (dietaData: DietaResponse) => void;
  onError: (error: Error) => void;
  clienteId?: string;
  clienteNombre?: string;
}

const FormularioCrearDieta: React.FC<FormularioCrearDietaProps> = ({ 
  onSuccess, 
  onError, 
  clienteId = "123456",
  clienteNombre = "Juan Pérez" 
}) => {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  
  // Tipos de dieta organizados por categorías
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
    fechaInicio: new Date().toISOString().split('T')[0],
    asignadaA: clienteId || ''
  });

  useEffect(() => {
    if (clienteId) {
      setFormData(prev => ({
        ...prev,
        asignadaA: clienteId
      }));
    }
  }, [clienteId]);

  const [isSubmitting, setIsSubmitting] = useState(false);

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
  };

  const handleTipoChange = (value: string[]) => {
    setFormData(prev => ({
      ...prev,
      tipo: value
    }));
  };

  const nextStep = () => setActiveStep((current) => Math.min(current + 1, 2));
  const prevStep = () => setActiveStep((current) => Math.max(current - 1, 0));

  const validateCurrentStep = () => {
    if (activeStep === 0) {
      return formData.nombre.trim() !== '';
    } else if (activeStep === 1) {
      return formData.tipo.length > 0;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.nombre) {
      onError(new Error('El nombre de la dieta es obligatorio'));
      return;
    }
    
    if (formData.tipo.length === 0) {
      onError(new Error('Debes seleccionar al menos un tipo de dieta'));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const fechaArr = formData.fechaInicio.split('-'); // [yyyy, mm, dd]
      const fechaFormateada = `${fechaArr[2]}-${fechaArr[1]}-${fechaArr[0]}`;
      
      const response = await crearDieta({
        ...formData,
        fechaInicio: fechaFormateada
      });
      
      onSuccess(response.dieta);
      
      setFormData({
        nombre: '',
        descripcion: '',
        tipo: [],
        duracion: 28,
        comidasDiarias: 3,
        fechaInicio: new Date().toISOString().split('T')[0],
        asignadaA: clienteId || ''
      });
      setActiveStep(0);
    } catch (error) {
      onError(error instanceof Error ? error : new Error('Error desconocido'));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const fechaInicioDate = formData.fechaInicio ? new Date(formData.fechaInicio) : new Date();

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <form onSubmit={handleSubmit}>
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
          >
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
          </Stepper.Step>
          
          <Stepper.Step
            icon={<IconClock size="1.5rem" />}
            label="Tipo de dieta"
            description="Características"
          >
            <Title order={4} mb="md" c={theme.colors.blue[6]}>Tipo de dieta</Title>
            
            <Box 
              mb="xl" 
              p="md" 
                style={{
                  backgroundColor: theme.colors.gray[0],
                  borderRadius: theme.radius.md,
                }}
            >
              <CheckboxGroup
                value={formData.tipo}
                onChange={handleTipoChange}
                required
                mb="md"
              >
                <SimpleGrid cols={{base: 1, xs: 2}} spacing="lg">
                  {tiposDieta.map((tipo) => (
                    <Checkbox
                      key={tipo}
                      value={tipo}
                      label={tipo}
                      size="md"
                      styles={(theme) => ({
                        label: {
                          fontSize: theme.fontSizes.md,
                        }
                      })}
                    />
                  ))}
                </SimpleGrid>
              </CheckboxGroup>
            </Box>
          </Stepper.Step>
          
          <Stepper.Step
            icon={<IconCalendarStats size="1.5rem" />}
            label="Planificación"
            description="Duración y comidas"
          >
            <Title order={4} mb="md" c={theme.colors.blue[6]}>Planificación de la dieta</Title>
            
            <SimpleGrid cols={{base: 1, sm: 2}} spacing="md" mb="md">
              <NumberInput
                label="Duración (días)"
                description="Duración total del plan"
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
                description="Número de comidas al día"
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
                leftSection={<IconCalendar size={16} />}
                value={fechaInicioDate}
                onChange={(date) => date && handleInputChange('fechaInicio', date)}
                required
                clearable={false}
                minDate={new Date()}
                size="md"
              />
              
              <Box>
                <Text size="sm" fw={500} mb={5}>Cliente asignado</Text>
                <Card
                  withBorder
                  p="sm"
                  radius="md"
                  style={{
                    backgroundColor: theme.colors.gray[0],
                    borderRadius: theme.radius.md,
                  }}
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
          </Stepper.Step>
        </Stepper>
        
        <Group justify="space-between" mt="xl">
          {activeStep > 0 ? (
            <Button 
              variant="default" 
              onClick={prevStep}
              leftSection={<IconChevronLeft size={rem(18)} />}
            >
              Anterior
            </Button>
          ) : (
            <Button variant="default" onClick={() => window.history.back()}>
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
              onClick={nextStep}
              rightSection={<IconChevronRight size={rem(18)} />}
              disabled={!validateCurrentStep()}
            >
              Siguiente
            </Button>
          )}
        </Group>
      </form>
    </Card>
  );
};

export default FormularioCrearDieta;