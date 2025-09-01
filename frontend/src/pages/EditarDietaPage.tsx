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
  Select
} from '@mantine/core';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  IconAlertCircle, 
  IconCalendarEvent,
  IconCheck
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { format, parse, parseISO, getDay, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import DietaDayEditor from '../helpers/diets/DietaDayEditor';
import { obtenerDieta, publicarDieta } from '../services/dietService';
import { Dieta, DiaDieta, DayInfo } from '../types';

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

// Utilidades para fechas
const convertirDiaSemana = (diaSemana: number): number => {
  return diaSemana === 0 ? 6 : diaSemana - 1;
};

const parseFecha = (fecha: string | Date): Date => {
  if (typeof fecha !== 'string') return new Date(fecha);
  
  try {
    if (fecha.includes('T') || fecha.includes('Z')) {
      return parseISO(fecha);
    }
    
    if (fecha.includes('-')) {
      const parts = fecha.split('-');
      if (parts.length === 3) {
        return parse(fecha, 'dd-MM-yyyy', new Date());
      }
    }
    
    return new Date(fecha);
  } catch (error) {
    console.error('Error parseando fecha:', error);
    return new Date();
  }
};

// Función para formatear fecha
const formatearFecha = (fecha: string | Date, formatoString: string = "d 'de' MMMM 'de' yyyy"): string => {
  try {
    const fechaDate = parseFecha(fecha);
    return format(fechaDate, formatoString, { locale: es });
  } catch (error) {
    console.error("Error al formatear fecha:", error);
    return typeof fecha === 'string' ? fecha : fecha.toString();
  }
};

// Crear función para generar datos de día
const crearDatoDia = (
  index: number, 
  dietDayIndex: number, 
  fechaBase: Date, 
  dias: DiaDieta[]
): DayInfo => {
  const fechaDia = addDays(fechaBase, dietDayIndex);
  const fechaFormateada = formatearFecha(fechaDia, "d 'de' MMMM");
  
  return {
    weekDayIndex: index,
    dietDayIndex: dietDayIndex,
    weekDayName: DIAS_SEMANA[index],
    fecha: fechaDia,
    fechaFormateada: fechaFormateada,
    nombreCompleto: `${DIAS_SEMANA[index]} ${fechaFormateada}`,
    data: dias[dietDayIndex]
  };
};

const EditarDietaPage: React.FC = () => {
  const { dietaId } = useParams<{ dietaId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [dieta, setDieta] = useState<Dieta | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>("0");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [currentWeek, setCurrentWeek] = useState(1);
  const [startDayOfWeek, setStartDayOfWeek] = useState<number>(0);
  const [fechaInicio, setFechaInicio] = useState<Date | null>(null);
  
  const [dayHasChanges, setDayHasChanges] = useState<boolean>(false);
  const [targetDayIndex, setTargetDayIndex] = useState<number | null>(null);
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [publishLoading, setPublishLoading] = useState<boolean>(false);

  const handlePublicarDieta = async () => {
    if (!dieta || !dietaId) return;
    
    try {
      setPublishLoading(true);
      await publicarDieta(dietaId);
      
      navigate(`/ver-dieta/${dietaId}`);
    } catch (error) {
      console.error('Error al publicar la dieta:', error);
      setError(error instanceof Error ? error.message : 'Error al publicar la dieta');
    } finally {
      setPublishLoading(false);
    }
  };

  const daysRange = useMemo(() => {
    if (!dieta || !fechaInicio) return { days: [], totalWeeks: 0 };
    
    const totalWeeks = Math.ceil((dieta.dias.length + startDayOfWeek) / 7);
    const weekStartIndex = (currentWeek - 1) * 7 - startDayOfWeek;
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      const dietDayIndex = weekStartIndex + i;
      
      if (dietDayIndex >= 0 && dietDayIndex < dieta.dias.length) {
        days.push(crearDatoDia(i, dietDayIndex, fechaInicio, dieta.dias));
      }
    }
    
    return { days, totalWeeks };
  }, [dieta, currentWeek, startDayOfWeek, fechaInicio]);

  useEffect(() => {
    const cargarDieta = async () => {
      if (!dietaId) return;
      
      try {
        setLoading(true);
        const data = await obtenerDieta(dietaId);
        
        if (!data.draftMode) {
          console.log('Dieta publicada. Redirigiendo a vista de solo lectura...');
          navigate(`/ver-dieta/${dietaId}${location.search}`);
          return;
        }
        
        if (!data.dias || data.dias.length === 0) {
          const diasInicializados: DiaDieta[] = [];
          for (let i = 0; i < data.duracion; i++) {
            diasInicializados.push({
              caloriasTotales: 0,
              macronutrientes: '',
              micronutrientes: '',
              numeroComidas: data.comidasDiarias,
              comidas: Array(data.comidasDiarias).fill(null).map(() => ({
                horaEstimada: '',
                platos: []
              })),
              cumplimiento: false
            });
          }
          data.dias = diasInicializados;
        }
        
        if (data.fechaInicio) {
          const fechaInicioDate = parseFecha(data.fechaInicio);
          setFechaInicio(fechaInicioDate);
          
          const diaSemanaAjustado = convertirDiaSemana(getDay(fechaInicioDate));
          
          console.log(`Fecha de inicio: ${format(fechaInicioDate, 'dd/MM/yyyy')} - Día de la semana: ${DIAS_SEMANA[diaSemanaAjustado]}`);
          setStartDayOfWeek(diaSemanaAjustado);
        }
        
        setDieta(data);
        
        const dayParam = new URLSearchParams(location.search).get('day');
        if (dayParam) {
          const dayIndex = parseInt(dayParam) - 1;
          if (dayIndex >= 0 && dayIndex < data.dias.length) {
            const diaSemanaAjustado = data.fechaInicio ? 
              convertirDiaSemana(getDay(parseFecha(data.fechaInicio))) : 0;
              
            const targetWeek = Math.ceil((dayIndex + 1 + diaSemanaAjustado) / 7);
            setCurrentWeek(targetWeek);
            setActiveTab(dayIndex.toString());
          }
        }
      } catch (err) {
        console.error("Error al cargar la dieta:", err);
        setError("Error al cargar la dieta. Por favor intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };
    
    cargarDieta();
  }, [dietaId, location.search, navigate]);

  useEffect(() => {
    if (daysRange.days.length > 0 && (activeTab === null || !daysRange.days.some(day => day.dietDayIndex.toString() === activeTab))) {
      setActiveTab(daysRange.days[0].dietDayIndex.toString());
    }
  }, [daysRange.days, activeTab]);

  const handleUpdateDay = (dayIndex: number, updatedDay: DiaDieta, markAsChanged: boolean = true) => {
    if (!dieta) return;
    
    const updatedDias = [...dieta.dias];
    updatedDias[dayIndex] = updatedDay;
    
    setDieta({
      ...dieta,
      dias: updatedDias
    });
    
    if (markAsChanged) {
      console.log('Marcando día como con cambios:', { dayIndex, markAsChanged });
      setDayHasChanges(true);
    } else {
      console.log('NO marcando día como con cambios:', { dayIndex, markAsChanged });
    }
  };
  
  const handleTabChange = (newTabValue: string | null) => {
    if (newTabValue === activeTab) return;
    
    if (dayHasChanges) {
      setTargetDayIndex(newTabValue !== null ? parseInt(newTabValue) : null);
      setShowSaveModal(true);
    } else {
      setActiveTab(newTabValue);
    }
  };

  const handleWeekChange = (newWeek: number) => {
    if (dayHasChanges) {
      setShowSaveModal(true);
      return;
    }
    
    setCurrentWeek(newWeek);
    
    if (dieta && daysRange.days.length > 0) {
      const firstVisibleDay = daysRange.days[0]?.dietDayIndex;
      if (firstVisibleDay !== undefined) {
        setActiveTab(firstVisibleDay.toString());
      }
    }
  };

  const currentDayInfo = useMemo(() => {
    if (!activeTab || !daysRange.days.length) return null;
    
    const currentDayIndex = parseInt(activeTab);
    return daysRange.days.find(day => day.dietDayIndex === currentDayIndex) || null;
  }, [activeTab, daysRange.days]);

  const fechaInicioFormateada = useMemo(() => {
    if (!dieta?.fechaInicio) return "";
    return formatearFecha(dieta.fechaInicio, "d 'de' MMMM 'de' yyyy");
  }, [dieta?.fechaInicio]);

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Loader color="nutroos-green" size="lg" />
        </Box>
      </Container>
    );
  }

  if (!dieta) {
    return (
      <Container size="xl" py="xl">
        <Alert 
          icon={<IconAlertCircle size={16} />} 
          title="Error" 
          color="red"
          withCloseButton
        >
          No se encontró la dieta solicitada o no tienes permisos para verla.
        </Alert>
        <Button 
          mt="lg" 
          color="nutroos-green"
          onClick={() => navigate('/dietas')}
        >
          Volver a dietas
        </Button>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
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
                {dieta.nombre}
              </Title>
              {!dieta.draftMode && (
                <Badge color="green" variant="filled" size="sm">
                  Publicada
                </Badge>
              )}
            </Group>
            <Text size="sm" c="dimmed">
              {dieta.descripcion || "Sin descripción"}
            </Text>
          </Box>
          <Group gap="md">
            {dieta.draftMode && (
              <Button
                color="green"
                leftSection={<IconCheck size={18} />}
                onClick={handlePublicarDieta}
                loading={publishLoading}
              >
                Publicar dieta
              </Button>
            )}
          </Group>
        </Group>
        
        <Group mt="lg" mb="md" gap="xs">
          <IconCalendarEvent size={18} color={isDark ? 'var(--mantine-color-gray-4)' : 'var(--mantine-color-gray-6)'} />
          <Text size="sm" c="dimmed">
            {dieta.duracion} días | {dieta.comidasDiarias} comidas diarias | Inicio: {fechaInicioFormateada}
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
        
        {!dieta.draftMode && (
          <Alert 
            icon={<IconCheck size={16} />}
            title="Dieta publicada" 
            color="blue" 
            mb="md"
          >
            Esta dieta ha sido publicada y está en modo de solo lectura. Los usuarios asignados ya pueden acceder a ella.
          </Alert>
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
        {daysRange.totalWeeks > 1 && (
          <Box p="md" style={{ borderBottom: '1px solid var(--app-border-color)' }}>
            <Group justify="space-between">
              <Text size="sm" fw={500}>
                Semana {currentWeek} de {daysRange.totalWeeks}
              </Text>
              <Group>
                <Select
                  value={currentWeek.toString()}
                  onChange={(value) => handleWeekChange(Number(value))}
                  data={Array.from({ length: daysRange.totalWeeks }, (_, i) => ({
                    value: (i + 1).toString(),
                    label: `Semana ${i + 1}`
                  }))}
                  size="sm"
                  style={{ width: 120 }}
                />
                <Pagination
                  value={currentWeek}
                  onChange={handleWeekChange}
                  total={daysRange.totalWeeks}
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
            {daysRange.days.map((dayInfo) => (
              <Tabs.Tab 
                key={dayInfo.dietDayIndex} 
                value={dayInfo.dietDayIndex.toString()}
                rightSection={dayHasChanges && activeTab === dayInfo.dietDayIndex.toString() ? 
                  <Box ml={5} style={{ position: 'relative', top: -2 }}>
                    <Badge color="orange" size="xs" variant="filled" p={4} />
                  </Box> : null
                }
              >
                {dayInfo.weekDayName} {dayInfo.fecha.getDate()}
              </Tabs.Tab>
            ))}
          </Tabs.List>
          
          {activeTab !== null && (
            <Tabs.Panel value={activeTab} pt="lg">
              {dieta.draftMode ? (
                <DietaDayEditor 
                  day={dieta.dias[parseInt(activeTab)]}
                  dayNumber={parseInt(activeTab) + 1}
                  onUpdate={(updatedDay, markAsChanged = true) => {
                    console.log('onUpdate en DietaDayEditor llamado con markAsChanged:', markAsChanged);
                    handleUpdateDay(parseInt(activeTab), updatedDay, markAsChanged);
                  }}
                  comidasDiarias={dieta.comidasDiarias}
                  customTitle={currentDayInfo?.nombreCompleto || `Día ${parseInt(activeTab) + 1}`}
                  dietaId={dietaId}
                  hasChanges={dayHasChanges}
                  onSaveSuccess={() => {
                    setDayHasChanges(false);
                    setSuccessMessage("Día actualizado correctamente");
                    setTimeout(() => setSuccessMessage(null), 3000);
                    
                    if (targetDayIndex !== null) {
                      setActiveTab(targetDayIndex.toString());
                      setTargetDayIndex(null);
                      setShowSaveModal(false);
                    }
                  }}
                />
              ) : (
                <Box p="md">
                  <Alert 
                    icon={<IconAlertCircle size={16} />}
                    title="Dieta publicada" 
                    color="blue" 
                    mb="md"
                  >
                    Esta dieta ha sido publicada y no puede ser editada. Los usuarios asignados ya pueden verla.
                  </Alert>
                  
                  <Paper p="md" withBorder>
                    <Text fw={500} size="lg" mb="md">
                      {currentDayInfo?.nombreCompleto || `Día ${parseInt(activeTab) + 1}`}
                    </Text>
                    
                    {dieta.dias[parseInt(activeTab)].comidas.map((comida, comidaIndex) => (
                      <Box key={comidaIndex} mb="lg">
                        <Text fw={500} c="nutroos-green">
                          {comidaIndex + 1}. {comida.nombreComida || `Comida ${comidaIndex + 1}`} 
                          {comida.horaEstimada && ` (${comida.horaEstimada})`}
                        </Text>
                        
                        {comida.platos.length > 0 ? (
                          <Box ml="md" mt="xs">
                            {comida.platos.map((plato, platoIndex) => (
                              <Text key={platoIndex} mb="xs">
                                • {plato.nombre || 'Plato sin nombre'}
                                {plato.receta && <Text component="span" size="sm" c="dimmed"> (Con receta)</Text>}
                              </Text>
                            ))}
                          </Box>
                        ) : (
                          <Text size="sm" c="dimmed" ml="md" mt="xs">
                            No hay platos en esta comida.
                          </Text>
                        )}
                      </Box>
                    ))}
                    
                    {dieta.dias[parseInt(activeTab)].caloriasTotales && (
                      <Text size="sm" mt="md">
                        <strong>Calorías totales:</strong> {dieta.dias[parseInt(activeTab)].caloriasTotales} kcal
                      </Text>
                    )}
                    
                    {dieta.dias[parseInt(activeTab)].macronutrientes && (
                      <Text size="sm" mt="xs">
                        <strong>Macronutrientes:</strong> {dieta.dias[parseInt(activeTab)].macronutrientes}
                      </Text>
                    )}
                    
                    {dieta.dias[parseInt(activeTab)].micronutrientes && (
                      <Text size="sm" mt="xs">
                        <strong>Micronutrientes:</strong> {dieta.dias[parseInt(activeTab)].micronutrientes}
                      </Text>
                    )}
                  </Paper>
                </Box>
              )}
            </Tabs.Panel>
          )}
        </Tabs>
        
        {daysRange.totalWeeks > 1 && (
          <Box p="md" style={{ borderTop: '1px solid var(--app-border-color)' }}>
            <Group justify="center">
              <Pagination
                value={currentWeek}
                onChange={handleWeekChange}
                total={daysRange.totalWeeks}
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
          Tienes cambios sin guardar en el día actual. ¿Qué deseas hacer?
        </Text>
        <Group justify="flex-end" mt="xl">
          <Button
            variant="outline"
            onClick={() => {
              setShowSaveModal(false);
              if (targetDayIndex !== null) {
                setActiveTab(targetDayIndex.toString());
                setTargetDayIndex(null);
                setDayHasChanges(false);
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
    </Container>
  );
};

export default EditarDietaPage;