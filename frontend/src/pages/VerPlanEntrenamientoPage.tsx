import React, { useEffect, useState, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Title, 
  Paper, 
  Group, 
  Text, 
  Alert, 
  useMantineColorScheme,
  Box,
  Loader,
  Divider,
  Pagination,
  Badge,
  Select,
  Button,
  Stack,
  Breadcrumbs,
  Anchor
} from '@mantine/core';
import { 
  IconChevronRight, 
  IconAlertCircle, 
  IconCalendarEvent,
  IconArrowLeft,
  IconChevronLeft,
  IconHome,
  IconBarbell,
  IconClock,
  IconTarget
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import trainingService from '../services/trainingService';
import type { PlanEntrenamiento, SesionPlan, Ejercicio } from '../types/training';

// Interfaces para manejo de sesiones
interface SesionInfo {
  weekDayIndex: number;
  weekDayName: string;
  fecha: Date;
  fechaFormateada: string;
  data: SesionPlan | null;
}

const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const VerPlanEntrenamientoPage: React.FC = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [plan, setPlan] = useState<PlanEntrenamiento | null>(null);
  const [sesiones, setSesiones] = useState<SesionPlan[]>([]);
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [currentWeek, setCurrentWeek] = useState(1);
  const [fechaInicio, setFechaInicio] = useState<Date | null>(null);

  // Calcular sesiones por semana (similar a EditarPlanEntrenamientoPage)
  const sesionesRange = useMemo(() => {
    if (!plan || !fechaInicio) return { sesiones: [] as SesionInfo[], totalWeeks: 0 };
    
    const totalWeeks = Math.ceil(plan.duracionDias / 7);
    const weekStartIndex = (currentWeek - 1) * 7;
    const sesionesSemana: SesionInfo[] = [];
    
    for (let i = 0; i < 7; i++) {
      const dayIndex = weekStartIndex + i;
      
      if (dayIndex < plan.duracionDias) {
        const fecha = new Date(fechaInicio);
        fecha.setDate(fecha.getDate() + dayIndex);
        
        const diaSemana = fecha.getDay();
        const weekDayName = DIAS_SEMANA[diaSemana];
        const fechaFormateada = format(fecha, 'dd/MM');
        
        // Buscar si hay una sesión para este día en las sesiones cargadas
        const sesionExistente = sesiones.find(sesion => {
          const sesionFecha = new Date(sesion.fecha);
          return sesionFecha.toDateString() === fecha.toDateString();
        });
        
        sesionesSemana.push({
          weekDayIndex: i,
          weekDayName,
          fecha,
          fechaFormateada,
          data: sesionExistente || null
        });
      }
    }
    
    return { sesiones: sesionesSemana, totalWeeks };
  }, [plan, currentWeek, sesiones, fechaInicio]);

  useEffect(() => {
    const load = async () => {
      if (!planId) return;
      setLoading(true);
      try {
        // Cargar plan, sesiones y ejercicios en paralelo
        const [planData, sesionesData, ejerciciosData] = await Promise.all([
          trainingService.obtenerPlanPorId(planId),
          trainingService.obtenerSesiones({ plan: planId }),
          trainingService.obtenerEjercicios()
        ]);
        
        setPlan(planData);
        
        // Verificar si el plan está en modo borrador y redirigir
        if (planData.draftMode) {
          navigate(`/editar-plan-entrenamiento/${planId}`);
          return;
        }
        
        // Normalizar los ejercicios en las sesiones
        const sesionesNormalizadas = sesionesData.map(sesion => ({
          ...sesion,
          ejercicios: sesion.ejercicios.map(ejercicio => ({
            ...ejercicio,
            ejercicio: typeof ejercicio.ejercicio === 'object' && ejercicio.ejercicio !== null 
              ? (ejercicio.ejercicio as { _id: string })._id 
              : ejercicio.ejercicio
          }))
        }));
        
        setSesiones(sesionesNormalizadas);
        setEjercicios(ejerciciosData);
        
        // Configurar fecha de inicio
        if (planData.fechaInicio) {
          const fechaInicioDate = new Date(planData.fechaInicio);
          setFechaInicio(fechaInicioDate);
        }
        
      } catch (e) {
        setError((e as Error).message || 'Error al cargar el plan');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [planId, navigate]);

  // Función para cambiar semana
  const handleWeekChange = (newWeek: number) => {
    setCurrentWeek(newWeek);
  };

  // Función para obtener ejercicio por ID
  const getEjercicioById = (ejercicioId: string): Ejercicio | null => {
    return ejercicios.find(ej => ej._id === ejercicioId) || null;
  };

  // Formatear fecha de inicio
  const fechaInicioFormateada = useMemo(() => {
    if (!plan?.fechaInicio) return "";
    return format(new Date(plan.fechaInicio), "d 'de' MMMM 'de' yyyy");
  }, [plan?.fechaInicio]);

  const breadcrumbItems = [
    { title: 'Inicio', href: '/', icon: <IconHome size={14} /> },
    { title: 'Entrenamiento', href: '/training/planes' },
    { title: 'Ver plan', href: '#' },
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
          onClick={() => navigate(-1)}
        >
          Volver
        </Button>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl" px="md">
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
        <Paper 
          p="md" 
          mb="lg" 
          style={{ 
            backgroundColor: 'var(--app-paper-bg)', 
            borderBottom: '1px solid var(--app-border-color)' 
          }}
        >
          <Breadcrumbs separator={<IconChevronRight size={14} />}>{breadcrumbItems}</Breadcrumbs>
        </Paper>

        <Group justify="space-between" mb="xs" wrap="wrap">
          <Box>
            <Group gap="md" align="center">
              <Title order={2} c="nutroos-green.6">
                {plan.nombre}
              </Title>
              <Badge color="green" variant="filled" size="sm">
                Publicado
              </Badge>
            </Group>
            <Text size="sm" c="dimmed">
              {plan.descripcion || "Sin descripción"}
            </Text>
          </Box>
          <Group gap="md">
            <Button
              variant="outline"
              color="nutroos-green"
              leftSection={<IconArrowLeft size={18} />}
              onClick={() => {
                try {
                  let clientId = null;
                  
                  if (plan && plan.clientes && Array.isArray(plan.clientes) && plan.clientes.length > 0) {
                    const clientData = plan.clientes[0];
                    
                    if (typeof clientData === 'string') {
                      clientId = clientData;
                    } 
                    else if (typeof clientData === 'object' && clientData !== null) {
                      type ClientObject = { _id?: string; id?: string; };
                      const clientObj = clientData as unknown as ClientObject;
                      
                      if (clientObj._id) {
                        clientId = clientObj._id;
                      } else if (clientObj.id) {
                        clientId = clientObj.id;
                      } else {
                        // Último recurso: convertir a string
                        clientId = String(clientData);
                      }
                    }
                    // Cualquier otro caso, intenta la conversión a string
                    else if (clientData) {
                      clientId = String(clientData);
                    }
                  }
                  
                  console.log("Cliente original:", plan && plan.clientes && plan.clientes[0]);
                  console.log("Cliente ID extraído:", clientId);
                  
                  if (clientId) {
                    navigate(`/worker/dashboard-clients/${clientId}/training`);
                  } else {
                    console.warn("No se pudo extraer un ID de cliente válido, navegando hacia atrás");
                    navigate(-1);
                  }
                } catch (err) {
                  console.error("Error al navegar:", err);
                  navigate(-1);
                }
              }}
            >
              Volver a planes del cliente
            </Button>
          </Group>
        </Group>
        
        <Group mt="lg" mb="md" gap="xs">
          <IconCalendarEvent size={18} color={isDark ? 'var(--mantine-color-gray-4)' : 'var(--mantine-color-gray-6)'} />
          <Text size="sm" c="dimmed">
            {plan.duracionDias} días | {plan.sesionesPorSemana} sesiones/semana | Objetivo: {plan.objetivo} | Inicio: {fechaInicioFormateada}
          </Text>
        </Group>
        
        <Divider my="md" />
        
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Alert 
              icon={<IconAlertCircle size={18} />} 
              title="Error" 
              color="red" 
              mb="md"
              withCloseButton
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
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
        {/* Selector de semana */}
        <Box 
          py="md" 
          px="lg" 
          style={{ 
            borderBottom: '2px solid var(--mantine-color-nutroos-green-4)',
            backgroundColor: isDark ? 'var(--mantine-color-nutroos-green-9)' : 'var(--mantine-color-nutroos-green-1)'
          }}
        >
          <Group justify="space-between" align="center">
            <Group gap="md">
              <Button 
                size="sm" 
                variant="subtle" 
                color="nutroos-green" 
                leftSection={<IconChevronLeft size={16} />} 
                disabled={currentWeek <= 1}
                onClick={() => handleWeekChange(currentWeek - 1)}
              >
                Anterior
              </Button>
              <Select
                value={currentWeek.toString()}
                onChange={(value) => handleWeekChange(Number(value))}
                data={Array.from({ length: sesionesRange.totalWeeks }, (_, i) => ({
                  value: (i + 1).toString(),
                  label: `Semana ${i + 1}`
                }))}
                size="sm"
                style={{ width: 140 }}
              />
              <Button 
                size="sm" 
                variant="subtle" 
                color="nutroos-green" 
                rightSection={<IconChevronRight size={16} />} 
                disabled={currentWeek >= sesionesRange.totalWeeks}
                onClick={() => handleWeekChange(currentWeek + 1)}
              >
                Siguiente
              </Button>
            </Group>
            
            <Text size="md" fw={600} c="nutroos-green.7">
              {currentWeek} de {sesionesRange.totalWeeks} semanas
            </Text>
          </Group>
        </Box>
        
        {/* Tabla de sesiones */}
        <Box px="xl" py="md" mx="auto" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {sesionesRange.sesiones.map((sesionInfo) => (
                  <th
                    key={`header-${sesionInfo.weekDayIndex}`}
                    style={{ 
                      padding: '12px 8px',
                      borderBottom: '2px solid var(--mantine-color-nutroos-green-4)',
                      backgroundColor: isDark ? 'var(--mantine-color-nutroos-green-9)' : 'var(--mantine-color-nutroos-green-1)',
                      textAlign: 'center' as const
                    }}
                  >
                    <Text fw={700} c="nutroos-green" size="sm" ta="center">
                      {sesionInfo.weekDayName}
                    </Text>
                    <Text size="xs" c="dimmed" ta="center">
                      {sesionInfo.fechaFormateada}
                    </Text>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {sesionesRange.sesiones.map((sesionInfo, index) => (
                  <td 
                    key={`sesion-${sesionInfo.weekDayIndex}`}
                    style={{ 
                      padding: '16px 12px',
                      borderRight: '1px solid var(--app-border-color)',
                      verticalAlign: 'top' as const,
                      backgroundColor: index % 2 === 0 
                        ? (isDark ? 'var(--mantine-color-dark-6)' : 'var(--mantine-color-gray-0)')
                        : (isDark ? 'var(--mantine-color-dark-5)' : 'white')
                    }}
                  >
                    {sesionInfo.data ? (
                      <Stack gap="sm">
                        {/* Información de la sesión */}
                        <Box>
                          <Group gap="xs" mb="xs">
                            <IconBarbell size={16} color="var(--mantine-color-nutroos-green-6)" />
                            <Text fw={600} size="sm" c="nutroos-green">
                              {sesionInfo.data.tipoEntrenamiento}
                            </Text>
                          </Group>
                          
                          {sesionInfo.data.hora && (
                            <Group gap="xs" mb="xs">
                              <IconClock size={14} color="var(--mantine-color-gray-6)" />
                              <Text size="xs" c="dimmed">
                                {sesionInfo.data.hora}
                              </Text>
                            </Group>
                          )}
                          
                          {sesionInfo.data.duracion && (
                            <Group gap="xs" mb="xs">
                              <IconTarget size={14} color="var(--mantine-color-gray-6)" />
                              <Text size="xs" c="dimmed">
                                {sesionInfo.data.duracion} min
                              </Text>
                            </Group>
                          )}
                        </Box>

                        {/* Ejercicios */}
                        {sesionInfo.data.ejercicios && sesionInfo.data.ejercicios.length > 0 ? (
                          <Stack gap="xs">
                            <Text size="xs" fw={500} c="dimmed">Ejercicios:</Text>
                            {sesionInfo.data.ejercicios.map((ejercicioSesion, ejIndex) => {
                              const ejercicio = getEjercicioById(ejercicioSesion.ejercicio);
                              return (
                                <Box key={ejIndex} p="xs" style={{ backgroundColor: isDark ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-gray-1)', borderRadius: '4px' }}>
                                  <Text size="xs" fw={500} mb="2px">
                                    {ejIndex + 1}. {ejercicio?.nombre || 'Ejercicio no encontrado'}
                                  </Text>
                                  <Text size="xs" c="dimmed">
                                    {ejercicioSesion.series} series × {ejercicioSesion.repeticiones} reps
                                    {ejercicioSesion.peso && ` @ ${ejercicioSesion.peso}kg`}
                                  </Text>
                                  {ejercicioSesion.tiempoDescanso && (
                                    <Group gap="xs" mt="2px">
                                      <IconClock size={12} color="var(--mantine-color-gray-6)" />
                                      <Text size="xs" c="dimmed">
                                        Descanso: {ejercicioSesion.tiempoDescanso}s
                                      </Text>
                                    </Group>
                                  )}
                                </Box>
                              );
                            })}
                          </Stack>
                        ) : (
                          <Text size="xs" c="dimmed" ta="center" py="md">
                            Sin ejercicios asignados
                          </Text>
                        )}
                      </Stack>
                    ) : (
                      <Box py="md" ta="center">
                        <Text size="xs" c="dimmed">
                          {plan.diasSemana.includes(sesionInfo.fecha.getDay()) 
                            ? 'Sin sesión programada' 
                            : 'Día de descanso'}
                        </Text>
                      </Box>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </Box>
        
        <Box py="sm" style={{ borderTop: '1px solid var(--app-border-color)' }}>
          <Group justify="center" gap="xs">
            <Pagination
              value={currentWeek}
              onChange={handleWeekChange}
              total={sesionesRange.totalWeeks}
              color="nutroos-green"
              withEdges
              size="sm"
              radius="xs"
            />
          </Group>
        </Box>
      </Paper>
    </Container>
  );
};

export default VerPlanEntrenamientoPage;


