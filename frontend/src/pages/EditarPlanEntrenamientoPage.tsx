import React, { useState, useEffect, useMemo } from 'react';
import { 
  Container, 
  Title, 
  Paper, 
  Tabs, 
  Button, 
  Group, 
  Text, 
  Alert, 
  useMantineColorScheme,
  Box,
  Loader,
  Divider,
  Pagination,
  Modal,
  Badge,
  Select,
  ActionIcon,
  Stack
} from '@mantine/core';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  IconAlertCircle, 
  IconCalendarEvent,
  IconCheck,
  IconBarbell,
  IconPlus,
  IconEdit,
  IconTrash,
  IconChevronRight,
  IconHome
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import trainingService from '../services/trainingService';
import { PlanEntrenamiento, SesionPlan, Ejercicio } from '../types/training';
import GlobalNotificationOverlay from '../components/atoms/GlobalNotificationOverlay';
import { Breadcrumbs, Anchor } from '@mantine/core';
import { Link } from 'react-router-dom';

interface SesionInfo {
  weekDayIndex: number;
  sesionIndex: number;
  weekDayName: string;
  fecha: Date;
  fechaFormateada: string;
  nombreCompleto: string;
  data: SesionPlan | null;
}


const EditarPlanEntrenamientoPage: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [plan, setPlan] = useState<PlanEntrenamiento | null>(null);
  const [sesiones, setSesiones] = useState<SesionPlan[]>([]);
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>("0");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [currentWeek, setCurrentWeek] = useState(1);
  const [fechaInicio, setFechaInicio] = useState<Date | null>(null);
  
  const [sesionHasChanges, setSesionHasChanges] = useState<boolean>(false);
  const [targetSesionIndex, setTargetSesionIndex] = useState<number | null>(null);
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);



  const sesionesRange = useMemo(() => {
    if (!plan || !fechaInicio) return { sesiones: [], totalWeeks: 0 };
    
    // Filtrar sesiones que coincidan con los días de la semana del plan
    const sesionesFiltradas = sesiones.filter(sesion => {
      const sesionFecha = new Date(sesion.fecha);
      const diaSemana = sesionFecha.getDay();
      return plan.diasSemana.includes(diaSemana);
    });

    // Ordenar sesiones por fecha
    sesionesFiltradas.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
    
    // Calcular el número total de semanas basado en la duración del plan
    const totalWeeks = Math.ceil(plan.duracionDias / 7);
    
    // Calcular el rango de fechas para la semana actual
    const startOfWeek = new Date(fechaInicio);
    const daysToSubtract = startOfWeek.getDay() === 0 ? 6 : startOfWeek.getDay() - 1; // Lunes = 1, Domingo = 0
    startOfWeek.setDate(startOfWeek.getDate() - daysToSubtract);
    
    const weekStartDate = new Date(startOfWeek);
    weekStartDate.setDate(weekStartDate.getDate() + (currentWeek - 1) * 7);
    
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 6);
    
    // Filtrar sesiones que estén en la semana actual
    const sesionesDeLaSemana = sesionesFiltradas.filter(sesion => {
      const sesionFecha = new Date(sesion.fecha);
      return sesionFecha >= weekStartDate && sesionFecha <= weekEndDate;
    });
    
    // Crear array de días de la semana (Lunes a Domingo)
    const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const sesionesInfo: SesionInfo[] = [];
    
    for (let i = 0; i < 7; i++) {
      const fechaDelDia = new Date(weekStartDate);
      fechaDelDia.setDate(fechaDelDia.getDate() + i);
      
      // Buscar sesión para este día
      const sesionDelDia = sesionesDeLaSemana.find(sesion => {
        const sesionFecha = new Date(sesion.fecha);
        return sesionFecha.toDateString() === fechaDelDia.toDateString();
      });
      
      sesionesInfo.push({
        weekDayIndex: i,
        sesionIndex: i, // Usar índice del día de la semana
        weekDayName: diasSemana[i],
        fecha: fechaDelDia,
        fechaFormateada: format(fechaDelDia, 'dd/MM', { locale: es }),
        nombreCompleto: `${diasSemana[i]} ${format(fechaDelDia, 'dd/MM', { locale: es })}`,
        data: sesionDelDia || null
      });
    }
    
    return { sesiones: sesionesInfo, totalWeeks };
  }, [plan, currentWeek, sesiones, fechaInicio]);

  useEffect(() => {
    const cargarPlan = async () => {
      if (!planId) return;
      
      try {
        setLoading(true);
        const [planData, sesionesData, ejerciciosData] = await Promise.all([
          trainingService.obtenerPlanPorId(planId),
          trainingService.obtenerSesiones({ plan: planId }),
          trainingService.obtenerEjercicios()
        ]);
        
        setPlan(planData);
        setSesiones(sesionesData);
        setEjercicios(ejerciciosData);
        
        // Usar la fecha de inicio del plan
        if (planData.fechaInicio) {
          const fechaInicioDate = new Date(planData.fechaInicio);
          setFechaInicio(fechaInicioDate);
        }
        
        // Procesar parámetros de URL (sesión seleccionada)
        const sesionParam = new URLSearchParams(location.search).get('sesion');
        if (sesionParam) {
          const sesionIndex = parseInt(sesionParam) - 1;
          if (sesionIndex >= 0 && sesionIndex < sesionesData.length) {
            const targetWeek = Math.ceil((sesionIndex + 1) / 7);
            setCurrentWeek(targetWeek);
            setActiveTab(sesionIndex.toString());
          }
        }
      } catch (err) {
        console.error("Error al cargar el plan:", err);
        setError("Error al cargar el plan. Por favor intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };
    
    cargarPlan();
  }, [planId, location.search]);

  useEffect(() => {
    if (sesionesRange.sesiones.length > 0 && (activeTab === null || !sesionesRange.sesiones.some(sesion => sesion.weekDayIndex.toString() === activeTab))) {
      // Seleccionar la primera sesión que tenga datos
      const primeraSesionConDatos = sesionesRange.sesiones.find(sesion => sesion.data !== null);
      if (primeraSesionConDatos) {
        setActiveTab(primeraSesionConDatos.weekDayIndex.toString());
      } else {
        setActiveTab(sesionesRange.sesiones[0].weekDayIndex.toString());
      }
    }
  }, [sesionesRange.sesiones, activeTab]);

  
  const handleTabChange = (newTabValue: string | null) => {
    if (newTabValue === activeTab) return;
    
    if (sesionHasChanges) {
      setTargetSesionIndex(newTabValue !== null ? parseInt(newTabValue) : null);
      setShowSaveModal(true);
    } else {
      setActiveTab(newTabValue);
    }
  };

  const handleWeekChange = (newWeek: number) => {
    if (sesionHasChanges) {
      setShowSaveModal(true);
      return;
    }
    
    setCurrentWeek(newWeek);
    
    // Resetear la pestaña activa cuando cambie de semana
    setActiveTab(null);
  };

  const currentSesionInfo = useMemo(() => {
    if (!activeTab || !sesionesRange.sesiones.length) return null;
    
    const currentSesionIndex = parseInt(activeTab);
    return sesionesRange.sesiones.find(sesion => sesion.weekDayIndex === currentSesionIndex) || null;
  }, [activeTab, sesionesRange.sesiones]);

  const fechaInicioFormateada = useMemo(() => {
    if (!plan?.fechaInicio) return "";
    return format(new Date(plan.fechaInicio), "d 'de' MMMM 'de' yyyy", { locale: es });
  }, [plan?.fechaInicio]);

  const breadcrumbItems = [
    { title: 'Inicio', href: '/', icon: <IconHome size={14} /> },
    { title: 'Entrenamiento', href: '/training/planes' },
    { title: plan?.nombre || 'Plan', href: '#' },
  ].map((item, index) => (
    <Anchor component={Link} to={item.href} key={index} size="sm" c="nutroos-green">
      {item.icon && (
        <Group gap={4}>
          {item.icon}
          <span>{item.title}</span>
        </Group>
      )}
      {!item.icon && item.title}
    </Anchor>
  ));

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Loader color="nutroos-green" size="lg" />
        </Box>
      </Container>
    );
  }

  if (!plan) {
    return (
      <Container size="xl" py="xl">
        <Alert 
          icon={<IconAlertCircle size={16} />} 
          title="Error" 
          color="red"
          withCloseButton
        >
          No se encontró el plan solicitado o no tienes permisos para verlo.
        </Alert>
        <Button 
          mt="lg" 
          color="nutroos-green"
          onClick={() => navigate('/training/planes')}
        >
          Volver a planes
        </Button>
      </Container>
    );
  }


  return (
    <Container size="xl" py="xl">
      <Paper 
        p="md" 
        mb="lg" 
        style={{ 
          backgroundColor: 'var(--app-paper-bg)', 
          borderBottom: '1px solid var(--app-border-color)' 
        }}
      >
        <Breadcrumbs separator={<IconChevronRight size={14} />}>
          {breadcrumbItems}
        </Breadcrumbs>
      </Paper>

      <Paper 
        p="lg" 
        mb="md" 
        withBorder 
        radius="md"
        style={{ 
          backgroundColor: 'var(--app-paper-bg)',
          borderColor: 'var(--app-border-color)'
        }}
      >
        <Group justify="space-between" mb="xs" wrap="wrap">
          <Box>
            <Group gap="md" align="center">
              <Title order={2} c="nutroos-green.6">
                {plan.nombre}
              </Title>
              <Badge color="green" variant="filled" size="sm">
                Activo
              </Badge>
            </Group>
            <Text size="sm" c="dimmed">
              {plan.descripcion || "Sin descripción"}
            </Text>
          </Box>
          <Group gap="md">
            <Button
              color="nutroos-green"
              leftSection={<IconPlus size={18} />}
              onClick={() => {
                // TODO: Implementar crear nueva sesión
                console.log('Crear nueva sesión');
              }}
            >
              Nueva sesión
            </Button>
          </Group>
        </Group>
        
        <Group mt="lg" mb="md" gap="xs">
          <IconCalendarEvent size={18} color={isDark ? 'var(--mantine-color-gray-4)' : 'var(--mantine-color-gray-6)'} />
          <Text size="sm" c="dimmed">
            {plan.duracionDias} días | {plan.sesionesPorSemana} sesiones/semana | Inicio: {fechaInicioFormateada}
          </Text>
        </Group>
        
        <Divider my="sm" />
        
        {(error || successMessage) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {error && (
              <Alert 
                icon={<IconAlertCircle size={16} />} 
                title="Error" 
                color="red" 
                mb="md"
                withCloseButton
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            )}
            
            {successMessage && (
              <Alert 
                icon={<IconCheck size={16} />}
                title="¡Operación exitosa!" 
                color="nutroos-green" 
                mb="md"
                withCloseButton
                onClose={() => setSuccessMessage(null)}
              >
                {successMessage}
              </Alert>
            )}
          </motion.div>
        )}
      </Paper>
      
      <Paper 
        withBorder 
        radius="md"
        style={{ 
          backgroundColor: 'var(--app-paper-bg)',
          borderColor: 'var(--app-border-color)'
        }}
      >
        {sesionesRange.totalWeeks > 1 && (
          <Box p="md" style={{ borderBottom: '1px solid var(--app-border-color)' }}>
            <Group justify="space-between">
              <Text size="sm" fw={500}>
                Semana {currentWeek} de {sesionesRange.totalWeeks}
              </Text>
              <Group>
                <Select
                  value={currentWeek.toString()}
                  onChange={(value) => handleWeekChange(Number(value))}
                  data={Array.from({ length: sesionesRange.totalWeeks }, (_, i) => ({
                    value: (i + 1).toString(),
                    label: `Semana ${i + 1}`
                  }))}
                  size="sm"
                  style={{ width: 120 }}
                />
                <Pagination
                  value={currentWeek}
                  onChange={handleWeekChange}
                  total={sesionesRange.totalWeeks}
                  color="nutroos-green"
                  withEdges
                  size="sm"
                />
              </Group>
            </Group>
          </Box>
        )}
        
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          color="nutroos-green"
          variant="pills"
          p="md"
          radius="md"
          style={{ backgroundColor: isDark ? 'var(--app-paper-bg)' : 'var(--mantine-color-gray-0)' }}
        >
          <Tabs.List 
            style={{ 
              flexWrap: 'wrap',
              backgroundColor: 'transparent',
              border: 'none'
            }}
          >
            {sesionesRange.sesiones.map((sesionInfo) => (
              <Tabs.Tab 
                key={sesionInfo.weekDayIndex} 
                value={sesionInfo.weekDayIndex.toString()}
                rightSection={sesionHasChanges && activeTab === sesionInfo.weekDayIndex.toString() ? 
                  <Box ml={5} style={{ position: 'relative', top: -2 }}>
                    <Badge color="orange" size="xs" variant="filled" p={4} />
                  </Box> : null
                }
              >
                {sesionInfo.weekDayName} {sesionInfo.fecha.getDate()}
              </Tabs.Tab>
            ))}
          </Tabs.List>
          
          {activeTab !== null && (
            <Tabs.Panel value={activeTab} pt="lg">
              {currentSesionInfo?.data ? (
                <Box>
                  <Group justify="space-between" mb="md">
                    <Title order={4} c="nutroos-green.6">
                      {currentSesionInfo.nombreCompleto}
                    </Title>
                    <Group gap="xs">
                      <ActionIcon 
                        color="nutroos-green" 
                        variant="light"
                        onClick={() => {
                          // TODO: Implementar editar sesión
                          console.log('Editar sesión');
                        }}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon 
                        color="red" 
                        variant="light"
                        onClick={() => {
                          // TODO: Implementar eliminar sesión
                          console.log('Eliminar sesión');
                        }}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Group>

                  <Paper p="md" withBorder radius="md" mb="md">
                    <Group justify="space-between" mb="md">
                      <Text fw={500}>Ejercicios de la sesión</Text>
                      <Button 
                        size="sm" 
                        color="nutroos-green"
                        leftSection={<IconPlus size={16} />}
                        onClick={() => {
                          // TODO: Implementar añadir ejercicio
                          console.log('Añadir ejercicio');
                        }}
                      >
                        Añadir ejercicio
                      </Button>
                    </Group>

                    {currentSesionInfo.data.ejercicios && currentSesionInfo.data.ejercicios.length > 0 ? (
                      <Stack gap="md">
                        {currentSesionInfo.data.ejercicios.map((ejercicio, ejercicioIndex) => {
                          const ejercicioData = ejercicios.find(e => e._id === ejercicio.ejercicio);
                          return (
                            <Paper key={ejercicioIndex} p="md" withBorder radius="md" style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
                              <Group justify="space-between" mb="xs">
                                <Text fw={500}>
                                  {ejercicioIndex + 1}. {ejercicioData?.nombre || 'Ejercicio no encontrado'}
                                </Text>
                                <Group gap="xs">
                                  <ActionIcon size="sm" color="nutroos-green" variant="light">
                                    <IconEdit size={14} />
                                  </ActionIcon>
                                  <ActionIcon size="sm" color="red" variant="light">
                                    <IconTrash size={14} />
                                  </ActionIcon>
                                </Group>
                              </Group>
                              <Text size="sm" c="dimmed" mb="xs">
                                {ejercicioData?.descripcion || 'Sin descripción'}
                              </Text>
                              <Group gap="md">
                                <Text size="sm">
                                  <strong>Series:</strong> {ejercicio.series}
                                </Text>
                                <Text size="sm">
                                  <strong>Repeticiones:</strong> {ejercicio.repeticiones}
                                </Text>
                                <Text size="sm">
                                  <strong>Descanso:</strong> {ejercicio.tiempoDescanso}s
                                </Text>
                                {ejercicio.peso && (
                                  <Text size="sm">
                                    <strong>Peso:</strong> {ejercicio.peso}kg
                                  </Text>
                                )}
                              </Group>
                            </Paper>
                          );
                        })}
                      </Stack>
                    ) : (
                      <Box p="md" style={{ backgroundColor: 'var(--mantine-color-gray-0)', borderRadius: '8px' }}>
                        <Text size="sm" c="dimmed" ta="center" mb="md">
                          No hay ejercicios asignados a esta sesión.
                        </Text>
                        <Group justify="center">
                          <Button 
                            size="sm" 
                            color="nutroos-green"
                            leftSection={<IconPlus size={16} />}
                            onClick={() => {
                              // TODO: Implementar añadir ejercicio
                              console.log('Añadir ejercicio');
                            }}
                          >
                            Añadir primer ejercicio
                          </Button>
                        </Group>
                      </Box>
                    )}
                  </Paper>
                  
                  {currentSesionInfo.data.notas && (
                    <Paper p="md" withBorder radius="md" style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
                      <Text fw={500} size="sm" mb="xs">Notas de la sesión:</Text>
                      <Text size="sm">{currentSesionInfo.data.notas}</Text>
                    </Paper>
                  )}
                </Box>
              ) : (
                <Paper p="md" withBorder radius="md" style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
                  <Text size="sm" c="dimmed" mb="md">
                    Esta sesión aún no ha sido configurada.
                  </Text>
                  <Button 
                    size="sm" 
                    color="nutroos-green"
                    leftSection={<IconBarbell size={16} />}
                    onClick={() => {
                      // TODO: Implementar configurar sesión
                      console.log('Configurar sesión');
                    }}
                  >
                    Configurar sesión
                  </Button>
                </Paper>
              )}
            </Tabs.Panel>
          )}
        </Tabs>
        
        {sesionesRange.totalWeeks > 1 && (
          <Box p="md" style={{ borderTop: '1px solid var(--app-border-color)' }}>
            <Group justify="center">
              <Pagination
                value={currentWeek}
                onChange={handleWeekChange}
                total={sesionesRange.totalWeeks}
                color="nutroos-green"
                withEdges
              />
            </Group>
          </Box>
        )}
      </Paper>
      
      <Modal
        opened={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        title="Cambios sin guardar"
        centered
      >
        <Text size="sm" mb="md">
          Tienes cambios sin guardar en la sesión actual. ¿Qué deseas hacer?
        </Text>
        <Group justify="flex-end" mt="xl">
          <Button
            variant="outline"
            onClick={() => {
              setShowSaveModal(false);
              if (targetSesionIndex !== null) {
                setActiveTab(targetSesionIndex.toString());
                setTargetSesionIndex(null);
                setSesionHasChanges(false);
              }
            }}
          >
            Descartar cambios
          </Button>
          <Button
            color="nutroos-green"
            onClick={() => setShowSaveModal(false)}
          >
            Cancelar
          </Button>
        </Group>
      </Modal>

      <GlobalNotificationOverlay
        message={error || successMessage}
        type={error ? 'error' : successMessage ? 'success' : undefined}
        onClose={() => {
          setError(null);
          setSuccessMessage(null);
        }}
      />
    </Container>
  );
};

export default EditarPlanEntrenamientoPage;