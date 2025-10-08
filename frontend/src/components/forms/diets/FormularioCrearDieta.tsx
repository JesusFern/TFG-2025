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
  ActionIcon,
  Alert,
  Paper,
  useMantineColorScheme
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
import { crearDieta } from '../../../services/dietService';
import { CrearDietaDTO, DietaResponse } from '../../../types';
import { useParams } from 'react-router-dom';
import { getUserById } from '../../../services/userService';
import { TIPOS_DIETA, TipoDieta } from '../../../constants/dietTypes';
import { dietTemplateService } from '../../../services/dietTemplateService';
import { TipoCreacion } from './TipoCreacionDieta';

interface FormularioCrearDietaProps {
  onSuccess: (dietaData: DietaResponse) => void;
  onError: (error: Error) => void;
  clienteId?: string;
  clienteNombre?: string;
  onClienteNombreLoaded?: (nombre: string) => void;
  tipoCreacion?: TipoCreacion | null;
  datosCreacion?: {
    tipoArquetipo?: string;
    plantillaInfo?: {
      tipo: string;
      nombre: string;
      descripcion: string;
      caloriasObjetivo: number;
    };
    dietaOrigenId?: string;
    dietaInfo?: {
      _id: string;
      nombre: string;
      descripcion?: string;
      tipo: string[];
    };
  };
}

const FormularioCrearDieta: React.FC<FormularioCrearDietaProps> = ({ 
  onSuccess, 
  onError, 
  clienteId,
  clienteNombre: initialClienteNombre,
  onClienteNombreLoaded,
  tipoCreacion,
  datosCreacion
}) => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const isMobile = useMediaQuery('(max-width: 48em)');
  const { id: routeClienteId } = useParams<{ id?: string }>();
  const [clienteNombre, setClienteNombre] = useState(initialClienteNombre || '');
  const actualClienteId = clienteId || routeClienteId;
  
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<CrearDietaDTO>({
    nombre: '',
    descripcion: '',
    tipo: [],
    duracion: 28,
    comidasDiarias: 5,
    fechaInicio: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    asignadaA: actualClienteId || '',
    horasComidas: ['08:00', '11:00', '14:00', '17:00', '20:00'],
    nombreComidas: ['Desayuno', 'Media mañana', 'Almuerzo', 'Merienda', 'Cena']
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);
  
  const tiposDieta = TIPOS_DIETA;

  const generarHorariosComidas = (numComidas: number): string[] => {
    switch (numComidas) {
      case 2:
        return ['08:30', '20:00'];
      case 3:
        return ['08:00', '13:30', '20:00'];
      case 4:
        return ['08:00', '12:00', '16:00', '20:00'];
      case 5:
        return ['08:00', '11:00', '14:00', '17:00', '20:00'];
      case 6:
        return ['07:30', '10:30', '13:30', '16:30', '19:00', '21:30'];
      default:
        return Array(numComidas).fill('').map((_, index) => {
          const hour = Math.floor(7 + (14 * index) / (numComidas - 1));
          const minute = (index % 2 === 0) ? '00' : '30';
          return `${hour.toString().padStart(2, '0')}:${minute}`;
        });
    }
  };

  const generarNombresComidas = (numComidas: number): string[] => {
    switch (numComidas) {
      case 2:
        return ['Desayuno', 'Cena'];
      case 3:
        return ['Desayuno', 'Almuerzo', 'Cena'];
      case 4:
        return ['Desayuno', 'Media mañana', 'Almuerzo', 'Cena'];
      case 5:
        return ['Desayuno', 'Media mañana', 'Almuerzo', 'Merienda', 'Cena'];
      case 6:
        return ['Desayuno temprano', 'Desayuno', 'Almuerzo', 'Merienda', 'Cena temprana', 'Cena'];
      default: {
        const comidas = ['Desayuno', 'Media mañana', 'Almuerzo', 'Merienda', 'Cena'];
        const result = [];
        
        for (let i = 0; i < numComidas; i++) {
          if (i < comidas.length) {
            result.push(comidas[i]);
          } else {
            result.push(`Comida ${i + 1}`);
          }
        }
        
        return result;
      }
    }
  };

  const isValidMongoId = (id?: string) => id && /^[0-9a-fA-F]{24}$/.test(id);

  // Efecto para cargar los datos del cliente y actualizar el ID del cliente en el formulario
  useEffect(() => {
    if (actualClienteId) {
      if (isValidMongoId(actualClienteId)) {
        setFormData(prev => ({
          ...prev,
          asignadaA: actualClienteId
        }));
        
        // Si no tenemos el nombre del cliente, cargamos la información
        if (!clienteNombre) {
          const fetchClienteData = async () => {
            try {
              const userData = await getUserById(actualClienteId);
              setClienteNombre(userData.fullName);
              // Notificar al componente padre sobre el nombre cargado
              if (onClienteNombreLoaded) {
                onClienteNombreLoaded(userData.fullName);
              }
            } catch (error) {
              console.error('Error al obtener información del cliente:', error);
              onError(error instanceof Error ? error : new Error('Error al cargar los datos del cliente'));
            }
          };
          
          fetchClienteData();
        }
      } else {
        console.error(`ID de cliente inválido: ${actualClienteId}`);
      }
    }
  }, [actualClienteId, clienteNombre, onError, onClienteNombreLoaded]);

  const handleInputChange = (field: keyof CrearDietaDTO, value: string | number | string[] | Date) => {
    if (field === 'fechaInicio' && value instanceof Date) {
      setFormData(prev => ({
        ...prev,
        [field]: value.toISOString().split('T')[0]
      }));
    } else if (field === 'comidasDiarias' && typeof value === 'number') {
      setFormData(prev => ({
        ...prev,
        [field]: value,
        horasComidas: generarHorariosComidas(value),
        nombreComidas: generarNombresComidas(value)
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
      tipo: value as TipoDieta[]
    }));
    setStepError(null);
  };

  const validateCurrentStep = useCallback((): {isValid: boolean, error: string | null} => {
    if (activeStep === 0) {
      if (!formData.nombre.trim()) {
        return { isValid: false, error: 'El nombre de la dieta es obligatorio' };
      }
      if (formData.nombre.length > 100) {
        return { isValid: false, error: 'El nombre de la dieta no puede exceder los 100 caracteres' };
      }
      if (formData.descripcion && formData.descripcion.length > 500) {
        return { isValid: false, error: 'La descripción no puede exceder los 500 caracteres' };
      }
    } else if (activeStep === 1) {
      if (formData.tipo.length === 0) {
        return { isValid: false, error: 'Debes seleccionar al menos un tipo de dieta' };
      }
    } else if (activeStep === 2) {
      if (!formData.duracion || formData.duracion < 1) {
        return { isValid: false, error: 'La duración debe ser un número entero mayor que 0' };
      }

      if (!formData.comidasDiarias || formData.comidasDiarias <= 1 || formData.comidasDiarias > 6) {
        return { isValid: false, error: 'El número de comidas debe ser entre 2 y 6' };
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startDate = new Date(formData.fechaInicio);
      if (startDate <= today) {
        return { isValid: false, error: 'La fecha de inicio debe ser posterior al día actual' };
      }
    } else if (activeStep === 3) {
      // Validar horarios para todos los tipos de creación
      if (!formData.horasComidas || !Array.isArray(formData.horasComidas) || formData.horasComidas.length !== formData.comidasDiarias) {
        return { isValid: false, error: `Debe definir ${formData.comidasDiarias} horarios de comida` };
      }
      
      if (!formData.nombreComidas || !Array.isArray(formData.nombreComidas) || formData.nombreComidas.length !== formData.comidasDiarias) {
        return { isValid: false, error: `Debe definir ${formData.comidasDiarias} nombres de comida` };
      }
      
      const horaRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      for (let i = 0; i < formData.horasComidas.length; i++) {
        if (!horaRegex.test(formData.horasComidas[i])) {
          return { isValid: false, error: `La hora de la comida ${i+1} debe tener un formato válido (HH:MM)` };
        }
      }
      
      for (let i = 0; i < formData.nombreComidas.length; i++) {
        if (!formData.nombreComidas[i] || !formData.nombreComidas[i].trim()) {
          return { isValid: false, error: `El nombre de la comida ${i+1} no puede estar vacío` };
        }
        if (formData.nombreComidas[i].length > 50) {
          return { isValid: false, error: `El nombre de la comida ${i+1} no puede exceder los 50 caracteres` };
        }
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
    console.log("Manejando clic en Siguiente");
    
    const validation = validateCurrentStep();
    if (validation.isValid) {
      setStepError(null);
      setActiveStep((current) => Math.min(current + 1, 4));
    } else {
      setStepError(validation.error);
    }
  };

  const handlePrevClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Manejando clic en Anterior");
    
    setStepError(null);
    setActiveStep((current) => Math.max(current - 1, 0));
  };

  const handleCancelClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Manejando clic en Cancelar");
    
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
    
    if (!formData.comidasDiarias || formData.comidasDiarias <= 1 || formData.comidasDiarias > 6) {
      return 'El número de comidas debe ser entre 2 y 6';
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(formData.fechaInicio);
    if (startDate <= today) {
      return 'La fecha de inicio debe ser posterior al día actual';
    }
    
    // Validar horarios para todos los tipos de creación
    if (!formData.horasComidas || !Array.isArray(formData.horasComidas) || formData.horasComidas.length !== formData.comidasDiarias) {
      return `Debe definir ${formData.comidasDiarias} horarios de comida`;
    }
    
    if (!formData.nombreComidas || !Array.isArray(formData.nombreComidas) || formData.nombreComidas.length !== formData.comidasDiarias) {
      return `Debe definir ${formData.comidasDiarias} nombres de comida`;
    }
    
    const horaRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    for (let i = 0; i < formData.horasComidas.length; i++) {
      if (!horaRegex.test(formData.horasComidas[i])) {
        return `La hora de la comida ${i+1} debe tener un formato válido (HH:MM)`;
      }
    }
    
    for (let i = 0; i < formData.nombreComidas.length; i++) {
      if (!formData.nombreComidas[i] || !formData.nombreComidas[i].trim()) {
        return `El nombre de la comida ${i+1} no puede estar vacío`;
      }
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errorMessage = validateBeforeSubmit();
    if (errorMessage) {
      setStepError(errorMessage);
      onError(new Error(errorMessage));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let response;
      
      // Preparar datos base comunes - usar diferentes formatos según el tipo de creación
      const datosBase = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        tipo: formData.tipo,
        duracion: formData.duracion,
        comidasDiarias: formData.comidasDiarias,
        asignadaA: formData.asignadaA || ''
      };

      switch (tipoCreacion) {
        case 'desde-cero': {
          // Convertir fecha del formato YYYY-MM-DD (del input) al formato DD-MM-YYYY (que espera el backend)
          const fechaArr = formData.fechaInicio.split('-');
          const fechaFormateada = `${fechaArr[2]}-${fechaArr[1]}-${fechaArr[0]}`;
          
          response = await crearDieta({
            ...datosBase,
            fechaInicio: fechaFormateada,
            horasComidas: formData.horasComidas || [],
            nombreComidas: formData.nombreComidas || []
          });
          break;
        }
          
        case 'desde-plantilla': {
          // Para plantillas, usar formato ISO que JavaScript puede parsear
          const fechaISO = new Date(formData.fechaInicio).toISOString();
          
          response = await dietTemplateService.crearDietaDesdeTemplate({
            ...datosBase,
            fechaInicio: fechaISO,
            tipoArquetipo: datosCreacion?.tipoArquetipo || '',
            horasComidas: formData.horasComidas || [],
            nombreComidas: formData.nombreComidas || []
          });
          break;
        }
          
        case 'desde-existente': {
          // Para dietas existentes, usar formato ISO que JavaScript puede parsear
          const fechaISO = new Date(formData.fechaInicio).toISOString();
          
          response = await dietTemplateService.crearDietaDesdeExistente({
            ...datosBase,
            fechaInicio: fechaISO,
            dietaOrigenId: datosCreacion?.dietaOrigenId || '',
            horasComidas: formData.horasComidas || [],
            nombreComidas: formData.nombreComidas || []
          });
          break;
        }
          
        default: {
          // Fallback al método original - usar formato DD-MM-YYYY
          const fechaArr = formData.fechaInicio.split('-');
          const fechaFormateada = `${fechaArr[2]}-${fechaArr[1]}-${fechaArr[0]}`;
          
          response = await crearDieta({
            ...datosBase,
            fechaInicio: fechaFormateada,
            horasComidas: formData.horasComidas || [],
            nombreComidas: formData.nombreComidas || []
          });
        }
      }
      
      // Manejar respuesta según el tipo de creación
      const dietaData = 'dieta' in response ? response.dieta : response.data as DietaResponse;
      onSuccess(dietaData);
      
      setFormData({
        nombre: '',
        descripcion: '',
        tipo: [],
        duracion: 28,
        comidasDiarias: 5,
        fechaInicio: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        asignadaA: clienteId || '',
        horasComidas: ['08:00', '11:00', '14:00', '17:00', '20:00'],
        nombreComidas: ['Desayuno', 'Media mañana', 'Almuerzo', 'Merienda', 'Cena']
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
            <Title order={4} mb="md" c="nutroos-green.6">Información básica de la dieta</Title>
            
            <TextInput
              label="Nombre de la dieta"
              placeholder="Ej: Dieta mediterránea equilibrada"
              required
              value={formData.nombre}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
              mb="md"
              leftSection={<IconSalad size={16} />}
              size="md"
              maxLength={100}
              description={`${formData.nombre.length}/100 caracteres`}
            />
            
            <Textarea
              label="Descripción"
              placeholder="Describe brevemente esta dieta y sus objetivos principales"
              minRows={3}
              value={formData.descripcion || ''}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              mb="md"
              size="md"
              maxLength={500}
              description={`${(formData.descripcion || '').length}/500 caracteres`}
            />
          </>
        );
      case 1:
        return (
          <>
            <Title order={4} mb="md" c="nutroos-green.6">Tipo de dieta</Title>
            
            <Paper p="md" radius="md" withBorder style={{ backgroundColor: 'var(--app-paper-bg)' }}>
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
                      color="nutroos-green"
                    />
                  ))}
                </SimpleGrid>
              </CheckboxGroup>
            </Paper>
          </>
        );
      case 2:
        return (
          <>
            <Title order={4} mb="md" c="nutroos-green.6">Planificación de la dieta</Title>
            
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
                description="Número de comidas al día (entre 2 y 6)"
                data={[
                  { value: '2', label: '2 comidas' },
                  { value: '3', label: '3 comidas' },
                  { value: '4', label: '4 comidas' },
                  { value: '5', label: '5 comidas' },
                  { value: '6', label: '6 comidas' }
                ]}
                value={formData.comidasDiarias.toString()}
                onChange={(val) => handleInputChange('comidasDiarias', parseInt(val || '5'))}
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
                <Text size="xs" mt={5} c="dimmed">Esta dieta se creará para las necesidades específicas de este cliente</Text>
                <input type="hidden" value={actualClienteId || ''} />
              </Box>
            </SimpleGrid>
          </>
        );
      case 3:
        return (
          <>
            <Title order={4} mb="md" c="nutroos-green.6">Horarios de comidas</Title>
            <Text size="sm" mb="md" c="dimmed">
              Define los horarios y nombres de las comidas diarias. Estos se aplicarán a todos los días de la dieta.
            </Text>
            
            <Paper p="md" radius="md" withBorder style={{ backgroundColor: 'var(--app-paper-bg)', borderColor: 'var(--app-border-color)' }} mb="md">
              <Text fw={500} mb="md">Configuración de las {formData.comidasDiarias} comidas diarias</Text>
              
              {formData.horasComidas?.map((hora, index) => (
                <Group key={index} mb="md" grow>
                  <TextInput
                    label={`Nombre de la comida ${index + 1}`}
                    value={formData.nombreComidas?.[index] || ''}
                    onChange={(e) => {
                      const newNombres = [...(formData.nombreComidas || [])];
                      newNombres[index] = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        nombreComidas: newNombres
                      }));
                    }}
                    placeholder="Ej: Desayuno"
                    required
                    maxLength={50}
                    description={`${(formData.nombreComidas?.[index] || '').length}/50 caracteres`}
                  />
                  <TextInput
                    label={`Hora estimada`}
                    value={hora}
                    onChange={(e) => {
                      const newHoras = [...(formData.horasComidas || [])];
                      newHoras[index] = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        horasComidas: newHoras
                      }));
                    }}
                    placeholder="Ej: 08:00"
                    required
                  />
                </Group>
              ))}
            </Paper>
          </>
        );
      case 4:
        return (
          <>
            <Title order={4} mb="md" c="nutroos-green.6">Resumen de la dieta</Title>
            <Text size="sm" mb="md" c="dimmed">
              Revisa los datos antes de crear la dieta.
            </Text>
            
            <Paper p="md" radius="md" withBorder style={{ backgroundColor: 'var(--app-paper-bg)', borderColor: 'var(--app-border-color)' }} mb="md">
              <SimpleGrid cols={2} spacing="md">
                <Box>
                  <Text fw={500} mb={5}>Nombre</Text>
                  <Text 
                    c="dimmed"
                    style={{ 
                      wordWrap: 'break-word',
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                      maxWidth: '100%'
                    }}
                  >
                    {formData.nombre}
                  </Text>
                </Box>
                <Box>
                  <Text fw={500} mb={5}>Duración</Text>
                  <Text c="dimmed">{formData.duracion} días</Text>
                </Box>
                <Box>
                  <Text fw={500} mb={5}>Comidas diarias</Text>
                  <Text c="dimmed">{formData.comidasDiarias}</Text>
                </Box>
                <Box>
                  <Text fw={500} mb={5}>Fecha de inicio</Text>
                  <Text c="dimmed">{new Date(formData.fechaInicio).toLocaleDateString('es-ES')}</Text>
                </Box>
                <Box>
                  <Text fw={500} mb={5}>Tipos de dieta</Text>
                  <Text 
                    c="dimmed"
                    style={{ 
                      wordWrap: 'break-word',
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                      maxWidth: '100%'
                    }}
                  >
                    {formData.tipo.join(', ')}
                  </Text>
                </Box>
                <Box>
                  <Text fw={500} mb={5}>Método de creación</Text>
                  <Text 
                    c="dimmed"
                    style={{ 
                      wordWrap: 'break-word',
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                      maxWidth: '100%'
                    }}
                  >
                    {tipoCreacion === 'desde-cero' && 'Desde cero'}
                    {tipoCreacion === 'desde-plantilla' && `Plantilla: ${datosCreacion?.plantillaInfo?.nombre || ''}`}
                    {tipoCreacion === 'desde-existente' && `Copia de: ${datosCreacion?.dietaInfo?.nombre || ''}`}
                  </Text>
                </Box>
              </SimpleGrid>
              
              {formData.descripcion && (
                <Box mt="md">
                  <Text fw={500} mb={5}>Descripción</Text>
                  <Text 
                    c="dimmed"
                    style={{ 
                      wordWrap: 'break-word',
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                      maxWidth: '100%'
                    }}
                  >
                    {formData.descripcion}
                  </Text>
                </Box>
              )}
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
            onClick={handlePrevClick}
            leftSection={<IconChevronLeft size={rem(18)} />}
            type="button"
            color={isDark ? "gray.4" : "dark"}
          >
            Anterior
          </Button>
        ) : (
          <Button 
            variant="outline"
            onClick={handleCancelClick}
            type="button"
            color={isDark ? "gray.4" : "dark"}
          >
            Cancelar
          </Button>
        )}
        
        {activeStep === 4 ? (
          <Button 
            type="submit"
            loading={isSubmitting} 
            leftSection={isSubmitting ? undefined : <IconCheck size={rem(18)} />}
            color="nutroos-green"
          >
            {isSubmitting ? (
              tipoCreacion === 'desde-cero' ? 'Creando...' :
              tipoCreacion === 'desde-plantilla' ? 'Generando desde plantilla...' :
              tipoCreacion === 'desde-existente' ? 'Copiando dieta...' :
              'Creando...'
            ) : (
              tipoCreacion === 'desde-cero' ? 'Crear Dieta' :
              tipoCreacion === 'desde-plantilla' ? 'Generar desde Plantilla' :
              tipoCreacion === 'desde-existente' ? 'Copiar Dieta' :
              'Crear Dieta'
            )}
          </Button>
        ) : (
          <Button 
            onClick={handleNextClick}
            rightSection={<IconChevronRight size={rem(18)} />}
            disabled={!isCurrentStepValid()}
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
    <Card 
      shadow="sm" 
      p="lg" 
      radius="md" 
      withBorder 
      style={{ 
        backgroundColor: 'var(--app-paper-bg)',
        borderColor: 'var(--app-border-color)'
      }}
    >
      <div>
        {actualClienteId && (
          <Box mb="lg">
            <Group justify="center" mb="xs">
              <ActionIcon variant="light" color="nutroos-green" radius="xl" size="lg">
                <IconUser size="1.5rem" />
              </ActionIcon>
              <Title order={3} fw={600} c="nutroos-green.7">
                {clienteNombre 
                  ? `Creando dieta para ${clienteNombre}` 
                  : 'Cargando datos del cliente...'}
              </Title>
            </Group>
            {!clienteNombre && (
              <Text ta="center" c="dimmed" size="sm">
                Obteniendo información del cliente con ID: {actualClienteId}
              </Text>
            )}
          </Box>
        )}

        {stepError && (
          <Alert 
            icon={<IconAlertCircle size={16} />} 
            title="Error de validación" 
            color="red" 
            mb="md"
            withCloseButton
            onClose={() => setStepError(null)}
            variant="filled"
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
          color="nutroos-green"
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
            description="Duración y fecha"
          />
          <Stepper.Step
            icon={<IconClock size="1.5rem" />}
            label="Horarios"
            description="Comidas diarias"
          />
          <Stepper.Step
            icon={<IconCheck size="1.5rem" />}
            label="Resumen"
            description="Revisar datos"
          />
        </Stepper>
        
        {activeStep < 4 ? (
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