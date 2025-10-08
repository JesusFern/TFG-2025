import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  Title, 
  Avatar, 
  Box, 
  Group,
  Stack,
  Text,
  Button,
  NumberInput,
  Select,
  Alert,
  Stepper,
  Card,
  Badge,
  SimpleGrid,
  Divider
} from '@mantine/core';
import { 
  IconTarget,
  IconArrowLeft,
  IconCalendar,
  IconClock,
  IconUsers,
  IconCheck,
  IconInfoCircle
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import GlobalNotificationOverlay from '../components/atoms/GlobalNotificationOverlay';
import { getUserById } from '../services/userService';
import { renderClientInfo } from '../components/common/BreadcrumbUtils';
import DatePickerInput from '../components/atoms/DatePickerInput';
import trainingService from '../services/trainingService';

const ConfigurarPlantillaPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get('clientId');
  const objetivo = searchParams.get('objetivo');
  const [clienteNombre, setClienteNombre] = useState<string>('');
  const [notice, setNotice] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  
  // Estados del formulario
  const [duracionSemanas, setDuracionSemanas] = useState<number>(4);
  const [sesionesPorSemana, setSesionesPorSemana] = useState<number>(3);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [fechaInicio, setFechaInicio] = useState<Date | null>(tomorrow);
  const [diasSemana, setDiasSemana] = useState<number[]>([]);
  const [nivelDificultad, setNivelDificultad] = useState<string>('Intermedio');
  const [activeStep, setActiveStep] = useState(0);


  useEffect(() => {
    if (!clientId || !objetivo) {
      setNotice({
        message: 'Faltan parámetros requeridos. Redirigiendo...',
        type: 'error'
      });
      setTimeout(() => {
        navigate(`/training/planes/tipo?clientId=${clientId || ''}`);
      }, 2000);
      return;
    }

    if (clientId) {
      (async () => {
        try {
          const userData = await getUserById(clientId);
          setClienteNombre(userData.fullName);
        } catch {
          setNotice({
            message: 'Error al cargar la información del cliente',
            type: 'error'
          });
        }
      })();
    }
  }, [clientId, objetivo, navigate]);

  const diasSemanaOptions = [
    { value: '1', label: 'Lunes' },
    { value: '2', label: 'Martes' },
    { value: '3', label: 'Miércoles' },
    { value: '4', label: 'Jueves' },
    { value: '5', label: 'Viernes' },
    { value: '6', label: 'Sábado' },
    { value: '0', label: 'Domingo' }
  ];

  const nivelesDificultad = [
    { value: 'Principiante', label: 'Principiante' },
    { value: 'Intermedio', label: 'Intermedio' },
    { value: 'Avanzado', label: 'Avanzado' }
  ];

  const handleDiaSemanaChange = (dia: string, checked: boolean) => {
    const diaNum = Number.parseInt(dia, 10);
    if (checked) {
      setDiasSemana(prev => [...prev, diaNum]);
    } else {
      setDiasSemana(prev => prev.filter(d => d !== diaNum));
    }
  };

  const handleSiguiente = () => {
    if (activeStep === 0) {
      if (!fechaInicio) {
        setNotice({
          message: 'Por favor selecciona una fecha de inicio',
          type: 'error'
        });
        return;
      }
      setActiveStep(1);
    } else if (activeStep === 1) {
      if (diasSemana.length === 0) {
        setNotice({
          message: 'Por favor selecciona al menos un día de la semana',
          type: 'error'
        });
        return;
      }
      if (diasSemana.length !== sesionesPorSemana) {
        setNotice({
          message: `Debes seleccionar exactamente ${sesionesPorSemana} días de la semana`,
          type: 'error'
        });
        return;
      }
      generarPlan();
    }
  };

  const handleAnterior = () => {
    setActiveStep(prev => Math.max(0, prev - 1));
  };

  const generarPlan = async () => {
    if (!objetivo || !clientId || !fechaInicio) {
      setNotice({
        message: 'Faltan datos requeridos para generar el plan',
        type: 'error'
      });
      return;
    }

    try {
      setNotice({
        message: 'Generando plan de entrenamiento...',
        type: 'info'
      });

      const planData = await trainingService.generarPlanDesdePlantilla({
        objetivo,
        duracionSemanas,
        sesionesPorSemana,
        diasSemana,
        nivelDificultad,
        clientId,
        fechaInicio,
        nombre: `Plan de ${objetivo} - ${duracionSemanas} semanas`,
        descripcion: `Plan de entrenamiento generado automáticamente para ${objetivo.toLowerCase()} con ${sesionesPorSemana} sesiones por semana durante ${duracionSemanas} semanas.`,
        clientes: [clientId],
        publico: false
      });

      setNotice({
        message: 'Plan generado exitosamente',
        type: 'success'
      });

      // Redirigir a la página de edición del plan
      navigate(`/training/planes/${planData._id}/editar`);

    } catch (error) {
      setNotice({
        message: 'Error al generar el plan: ' + (error as Error).message,
        type: 'error'
      });
    }
  };

  const handleVolver = () => {
    navigate(`/training/planes/plantillas/objetivos?clientId=${clientId}`);
  };

  return (
    <Container size="md" py="xl">

      <Paper 
        p="lg" 
        mb="xl" 
        withBorder 
        radius="md"
        style={{ 
          backgroundColor: 'var(--app-paper-bg)', 
          borderColor: 'var(--app-border-color)' 
        }}
      >
        <Group mb="md" align="flex-start">
          <Avatar 
            size="lg" 
            color="nutroos-green" 
            radius="xl"
          >
            <IconTarget size="1.5rem" />
          </Avatar>
          
          <Box style={{ flex: 1 }}>
            <Title order={2} mb={5} c="nutroos-green.6">Configurar Plantilla</Title>
            {renderClientInfo(clienteNombre, clientId)}
            <Group gap="xs" mt="xs">
              <Text size="sm" c="dimmed">
                Objetivo:
              </Text>
              <Badge color="blue" variant="light">{objetivo}</Badge>
            </Group>
          </Box>
        </Group>
      </Paper>
      
      {notice && (
        <GlobalNotificationOverlay
          message={notice.message}
          type={notice.type}
          onClose={() => setNotice(null)}
        />
      )}
      <Paper p="lg" withBorder radius="md">
      <Stepper active={activeStep} onStepClick={setActiveStep}>
        <Stepper.Step 
          label="Duración y Frecuencia" 
          description="Configura la duración del plan y sesiones por semana"
          icon={<IconCalendar size={18} />}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Stack gap="lg">
              <Alert
                icon={<IconInfoCircle size={16} />}
                title="Configuración del Plan"
                color="blue"
              >
                Define la duración del plan y la frecuencia de entrenamiento. 
                El sistema generará automáticamente las sesiones optimizadas para tu objetivo.
              </Alert>

              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
                <NumberInput
                  label="Duración del plan (semanas)"
                  description="Mínimo 1 semana"
                  value={duracionSemanas}
                  onChange={(value) => setDuracionSemanas(Number(value) || 4)}
                  min={1}
                  max={52}
                  leftSection={<IconCalendar size={16} />}
                />

                <NumberInput
                  label="Sesiones por semana"
                  description="Mínimo 2 sesiones"
                  value={sesionesPorSemana}
                  onChange={(value) => setSesionesPorSemana(Number(value) || 3)}
                  min={2}
                  max={7}
                  leftSection={<IconClock size={16} />}
                />
              </SimpleGrid>

              <DatePickerInput
                label="Fecha de inicio"
                value={fechaInicio}
                onChange={setFechaInicio}
                minDate={new Date()}
                leftSection={<IconCalendar size={16} />}
              />

              <Select
                label="Nivel de dificultad"
                description="Nivel de experiencia del cliente"
                data={nivelesDificultad}
                value={nivelDificultad}
                onChange={(value) => setNivelDificultad(value || 'Intermedio')}
                leftSection={<IconUsers size={16} />}
              />
            </Stack>
          </motion.div>
        </Stepper.Step>

        <Stepper.Step 
          label="Días de Entrenamiento" 
          description="Selecciona los días de la semana para entrenar"
          icon={<IconClock size={18} />}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Stack gap="lg">
              <Alert
                icon={<IconInfoCircle size={16} />}
                title="Selección de Días"
                color="blue"
              >
                Selecciona exactamente <strong>{sesionesPorSemana} días</strong> de la semana para entrenar.
                El sistema distribuirá automáticamente los ejercicios según tu objetivo.
              </Alert>

              <Card p="lg" withBorder>
                <Stack gap="md">
                  <Text fw={600}>Días de la semana disponibles:</Text>
                  <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="sm">
                    {diasSemanaOptions.map((dia) => (
                      <Button
                        key={dia.value}
                        variant={diasSemana.includes(Number.parseInt(dia.value, 10)) ? 'filled' : 'outline'}
                        color={diasSemana.includes(Number.parseInt(dia.value, 10)) ? 'nutroos-green' : 'gray'}
                        onClick={() => handleDiaSemanaChange(dia.value, !diasSemana.includes(Number.parseInt(dia.value, 10)))}
                        disabled={diasSemana.length >= sesionesPorSemana && !diasSemana.includes(Number.parseInt(dia.value, 10))}
                        fullWidth
                      >
                        {dia.label}
                      </Button>
                    ))}
                  </SimpleGrid>
                  
                  <Divider />
                  
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Días seleccionados: {diasSemana.length} de {sesionesPorSemana}
                    </Text>
                    {diasSemana.length === sesionesPorSemana && (
                      <Badge color="green" variant="light">
                        <IconCheck size={12} /> Completado
                      </Badge>
                    )}
                  </Group>
                </Stack>
              </Card>
            </Stack>
          </motion.div>
        </Stepper.Step>
      </Stepper>
      </Paper>

      <Group justify="space-between" mt="xl">
        <Button 
          variant="subtle" 
          leftSection={<IconArrowLeft size={16} />}
          onClick={activeStep === 0 ? handleVolver : handleAnterior}
        >
          {activeStep === 0 ? 'Volver' : 'Anterior'}
        </Button>

        <Button 
          color="nutroos-green"
          onClick={handleSiguiente}
          disabled={activeStep === 1 && diasSemana.length !== sesionesPorSemana}
        >
          {activeStep === 0 ? 'Siguiente' : 'Generar Plan'}
        </Button>
      </Group>
    </Container>
  );
};

export default ConfigurarPlantillaPage;
