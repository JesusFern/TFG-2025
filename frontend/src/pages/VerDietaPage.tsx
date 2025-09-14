import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  ThemeIcon,
  Tooltip
} from '@mantine/core';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  IconChevronRight, 
  IconAlertCircle, 
  IconCalendarEvent,
  IconArrowLeft,
  IconChevronLeft,
  IconClock,
  IconTarget,
  IconLeaf,
  IconInfoCircle
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { obtenerDieta } from '../services/dietService';
import { Dieta, DayInfo } from '../types';
import { 
  DIAS_SEMANA, 
  parseFecha, 
  formatearFecha, 
  crearDatoDia, 
  dietaStyles as styles,
  obtenerDiaSemanaAjustado
} from '../helpers/diets/DietaHelper';

// Las utilidades se han movido a DietaHelper.ts

const VerDietaPage: React.FC = () => {
  const { dietaId } = useParams<{ dietaId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [dieta, setDieta] = useState<Dieta | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentWeek, setCurrentWeek] = useState(1);
  const [startDayOfWeek, setStartDayOfWeek] = useState<number>(0); // 0 = Lunes, 6 = Domingo
  const [fechaInicio, setFechaInicio] = useState<Date | null>(null);

  // Procesar parámetros de URL (día seleccionado)
  const procesarParametrosURL = useCallback((data: Dieta) => {
    const dayParam = new URLSearchParams(location.search).get('day');
    if (dayParam) {
      const dayIndex = parseInt(dayParam) - 1;
      if (dayIndex >= 0 && dayIndex < data.dias.length) {
        const diaSemanaAjustado = data.fechaInicio ? 
          obtenerDiaSemanaAjustado(data.fechaInicio) : 0;
          
        const targetWeek = Math.ceil((dayIndex + 1 + diaSemanaAjustado) / 7);
        setCurrentWeek(targetWeek);
      }
    }
  }, [location.search]);

  // Calcular el rango de días para la semana actual
  const daysRange = useMemo(() => {
    if (!dieta || !fechaInicio) return { days: [] as DayInfo[], totalWeeks: 0 };
    
    const totalWeeks = Math.ceil((dieta.dias.length + startDayOfWeek) / 7);
    const weekStartIndex = (currentWeek - 1) * 7 - startDayOfWeek;
    const days: DayInfo[] = [];
    
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
        
        if (data.draftMode) {
          console.log('Dieta en modo borrador. Redirigiendo a edición...');
          navigate(`/editar-dieta/${dietaId}`);
          return;
        }
        
        if (data.fechaInicio) {
          const fechaInicioDate = parseFecha(data.fechaInicio);
          setFechaInicio(fechaInicioDate);
          
          const diaSemanaAjustado = obtenerDiaSemanaAjustado(data.fechaInicio);
          
          console.log(`Fecha de inicio: ${format(fechaInicioDate, 'dd/MM/yyyy')} - Día de la semana: ${DIAS_SEMANA[diaSemanaAjustado]}`);
          setStartDayOfWeek(diaSemanaAjustado);
        }
        
        setDieta(data);
        
        // Procesar parámetros de URL
        procesarParametrosURL(data);
      } catch (err) {
        console.error("Error al cargar la dieta:", err);
        setError("Error al cargar la dieta. Por favor intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };
    
    cargarDieta();
  }, [dietaId, navigate, procesarParametrosURL]);

  const handleWeekChange = (newWeek: number) => {
    setCurrentWeek(newWeek);
  };

  // Formatear fecha de inicio de dieta
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
          ...styles.paperBg,
          ...styles.paperBorder
        }}
      >
        {/* Header principal con título y botón de navegación */}
        <Group justify="space-between" mb="lg" wrap="wrap">
          <Box>
            <Group gap="md" align="center" mb="sm">
              <Title order={2} c="green.6" fw={700}>
                {dieta.nombre}
              </Title>
              <Badge 
                color="green" 
                variant="light" 
                size="lg"
                leftSection={<IconLeaf size={14} />}
                style={styles.statusBadge(isDark)}
              >
                Publicada
              </Badge>
            </Group>
            <Text size="md" c="dimmed" mb="md" style={{ maxWidth: '600px' }}>
              {dieta.descripcion || "Esta dieta no tiene descripción disponible."}
            </Text>
            
            {/* Información básica con iconos */}
            <Group gap="lg" mb="md">
              <Group gap="xs">
                <ThemeIcon size="sm" color="green" variant="light">
                  <IconCalendarEvent size={16} />
                </ThemeIcon>
                <Text size="sm" fw={500} c="green.7">
                  {dieta.duracion} días
                </Text>
              </Group>
              <Group gap="xs">
                <ThemeIcon size="sm" color="green" variant="light">
                  <IconClock size={16} />
                </ThemeIcon>
                <Text size="sm" fw={500} c="green.7">
                  {dieta.comidasDiarias} comidas diarias
                </Text>
              </Group>
              <Group gap="xs">
                <ThemeIcon size="sm" color="green" variant="light">
                  <IconTarget size={16} />
                </ThemeIcon>
                <Text size="sm" fw={500} c="green.7">
                  Inicio: {fechaInicioFormateada}
                </Text>
              </Group>
            </Group>
          </Box>
          
          <Button
            variant="outline"
            color="green"
            leftSection={<IconArrowLeft size={18} />}
            size="md"
            onClick={() => {
              try {
                let clientId = null;
                
                if (dieta.asignadaA && Array.isArray(dieta.asignadaA) && dieta.asignadaA.length > 0) {
                  const clientData = dieta.asignadaA[0];
                  
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
                      clientId = String(clientData);
                    }
                  }
                  else if (clientData) {
                    clientId = String(clientData);
                  }
                }
                
                if (clientId) {
                  navigate(`/worker/dashboard-clients/${clientId}/diets`);
                } else {
                  navigate(-1);
                }
              } catch (err) {
                console.error("Error al navegar:", err);
                navigate(-1);
              }
            }}
          >
            Volver a dietas del cliente
          </Button>
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
          ...styles.paperBg,
          ...styles.paperBorder
        }}
      >
        {/* Selector de semana - Estilo tabla */}
        <Box 
          py="md" 
          px="lg" 
          style={{ 
            ...styles.greenBorder,
            ...styles.greenBg(isDark)
          }}
        >
          <Group justify="space-between" align="center">
            <Group gap="md">
              <Button 
                size="sm" 
                variant="subtle" 
                color="green" 
                leftSection={<IconChevronLeft size={16} />} 
                disabled={currentWeek <= 1}
                onClick={() => handleWeekChange(currentWeek - 1)}
              >
                Anterior
              </Button>
              <Select
                value={currentWeek.toString()}
                onChange={(value) => handleWeekChange(Number(value))}
                data={Array.from({ length: daysRange.totalWeeks }, (_, i) => ({
                  value: (i + 1).toString(),
                  label: `Semana ${i + 1}`
                }))}
                size="sm"
                style={{ width: 140 }}
              />
              <Button 
                size="sm" 
                variant="subtle" 
                color="green" 
                rightSection={<IconChevronRight size={16} />} 
                disabled={currentWeek >= daysRange.totalWeeks}
                onClick={() => handleWeekChange(currentWeek + 1)}
              >
                Siguiente
              </Button>
            </Group>
            
            <Text size="md" fw={600} c="green.7">
              {currentWeek} de {daysRange.totalWeeks} semanas
            </Text>
          </Group>
        </Box>
        
        <Box 
          px={{ base: 'md', md: 'xl' }} 
          py="md" 
          mx="auto" 
          style={{ 
            overflowX: 'auto',
            borderRadius: '12px',
            background: isDark 
              ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.02) 0%, rgba(34, 197, 94, 0.01) 100%)'
              : 'linear-gradient(135deg, rgba(34, 197, 94, 0.01) 0%, rgba(34, 197, 94, 0.005) 100%)',
            padding: '16px',
            border: '1px solid rgba(34, 197, 94, 0.12)'
          }}
        >
          <table style={styles.tableStyles}>
            <thead>
              <tr>
                {daysRange.days.map((dayInfo: DayInfo) => (
                  <th
                    key={`header-${dayInfo.dietDayIndex}`}
                    style={styles.tableHeader(isDark)}
                  >
                    <Text fw={700} c="green.7" size="sm" ta="center">
                      {dayInfo.weekDayName}
                    </Text>
                    <Text size="xs" c="dimmed" ta="center">
                      {dayInfo.fechaFormateada}
                    </Text>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dieta && dieta.comidasDiarias > 0 && 
                Array.from({ length: dieta.comidasDiarias }).map((_, comidaIndex) => (
                  <tr 
                    key={`comida-${comidaIndex}`}
                    style={styles.rowBg(isDark, comidaIndex % 2 === 0)}
                  >
                    {daysRange.days.map((dayInfo: DayInfo) => {
                      const comida = dayInfo.data.comidas[comidaIndex];
                      if (!comida) return (
                        <td 
                          key={`empty-${dayInfo.dietDayIndex}-${comidaIndex}`}
                          style={styles.emptyCell}
                        />
                      );

                      return (
                        <td 
                          key={`day-${dayInfo.dietDayIndex}-comida-${comidaIndex}`}
                          style={{ 
                            padding: '6px 4px', 
                            ...styles.cellBorders,
                            verticalAlign: 'top',
                            ...styles.rowBg(isDark, comidaIndex % 2 === 0)
                          }}
                        >
                          <Tooltip 
                            label={`${comida.nombreComida || `Comida ${comidaIndex + 1}`}${comida.horaEstimada ? ` - ${comida.horaEstimada}` : ''}`}
                            position="top"
                            withArrow
                          >
                            <Text 
                              fw={600} 
                              size="sm" 
                              c="green.7" 
                              mb="4px"
                              p="6px 8px"
                              style={styles.mealTitle(isDark)}
                            >
                              {comida.nombreComida || `Comida ${comidaIndex + 1}`} 
                              {comida.horaEstimada && (
                                <Text component="span" size="xs" fw={400} c="dimmed" ml="xs">
                                  ({comida.horaEstimada})
                                </Text>
                              )}
                            </Text>
                          </Tooltip>
                          
                          {comida.platos.length > 0 && comida.platos.some(plato => plato.nombre !== null || plato.receta !== null) ? (
                            <Stack gap="xs" mt="sm">
                              {comida.platos
                                .filter(plato => plato.nombre !== null || plato.receta !== null)
                                .map((plato, platoIndex) => (
                                <Group 
                                  key={platoIndex}
                                  gap="xs"
                                  align="center"
                                  p="xs"
                                  style={styles.plateCard(isDark)}
                                >
                                  <ThemeIcon 
                                    size="xs" 
                                    color="green" 
                                    variant="light"
                                    radius="xl"
                                  >
                                    <IconLeaf size={10} />
                                  </ThemeIcon>
                                  <Text 
                                    size="xs" 
                                    fw={500}
                                    lineClamp={1} 
                                    style={{ 
                                      flex: 1,
                                      color: isDark ? 'var(--mantine-color-gray-2)' : 'var(--mantine-color-gray-7)'
                                    }}
                                  >
                                    {plato.nombre || 'Plato sin nombre'}
                                  </Text>
                                  {plato.receta && (
                                    <ThemeIcon 
                                      size="xs" 
                                      color="green" 
                                      variant="light"
                                      radius="xl"
                                    >
                                      <IconInfoCircle size={8} />
                                    </ThemeIcon>
                                  )}
                                </Group>
                              ))}
                            </Stack>
                          ) : (
                            <Box 
                              p="sm" 
                              mt="sm"
                              style={{
                                backgroundColor: isDark ? 'rgba(75, 192, 120, 0.02)' : 'rgba(75, 192, 120, 0.01)',
                                borderRadius: '6px',
                                border: '1px dashed rgba(75, 192, 120, 0.2)',
                                textAlign: 'center'
                              }}
                            >
                              <Text 
                                size="xs" 
                                c="dimmed" 
                                fs="italic"
                              >
                                Sin platos asignados
                              </Text>
                            </Box>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              }
              <tr style={styles.calorieFooterRow(isDark)}>
                {daysRange.days.map((dayInfo: DayInfo) => (
                  <td 
                    key={`calories-${dayInfo.dietDayIndex}`}
                    style={styles.calorieCellStyle(isDark)}
                  >
                    <Stack gap="xs" align="flex-end">
                      {(dayInfo.data.caloriasTotales && dayInfo.data.caloriasTotales > 0) && (
                        <Text fw={700} size="xs">
                          Total: {dayInfo.data.caloriasTotales} kcal
                        </Text>
                      )}
                      {dayInfo.data.macronutrientes && (
                        <Text size="xs" c="dimmed" ta="right" style={{ maxWidth: '120px' }}>
                          {dayInfo.data.macronutrientes}
                        </Text>
                      )}
                    </Stack>
                  </td>
                ))}
              </tr>
              
              {/* Fila adicional para micronutrientes e hidratación */}
              {(daysRange.days.some(day => day.data.micronutrientes || day.data.requerimientosHidratacion)) && (
                <tr style={{ 
                  backgroundColor: isDark ? 'rgba(148, 163, 184, 0.02)' : 'rgba(148, 163, 184, 0.01)',
                  borderTop: '1px solid rgba(148, 163, 184, 0.1)'
                }}>
                  {daysRange.days.map((dayInfo: DayInfo) => (
                    <td 
                      key={`details-${dayInfo.dietDayIndex}`}
                      style={{
                        padding: '8px 12px',
                        borderLeft: '1px solid rgba(148, 163, 184, 0.15)',
                        borderRight: '1px solid rgba(148, 163, 184, 0.15)',
                        borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
                        verticalAlign: 'top'
                      }}
                    >
                      <Stack gap="xs">
                        {dayInfo.data.micronutrientes && (
                          <Box>
                            <Text size="xs" fw={600} c="green.6" mb="xs">
                              Micronutrientes:
                            </Text>
                            <Text size="xs" c="dimmed" style={{ lineHeight: 1.3 }}>
                              {dayInfo.data.micronutrientes}
                            </Text>
                          </Box>
                        )}
                        {dayInfo.data.requerimientosHidratacion && (
                          <Box>
                            <Text size="xs" fw={600} c="green.6" mb="xs">
                              Hidratación:
                            </Text>
                            <Text size="xs" c="dimmed" style={{ lineHeight: 1.3 }}>
                              {dayInfo.data.requerimientosHidratacion}
                            </Text>
                          </Box>
                        )}
                      </Stack>
                    </td>
                  ))}
                </tr>
              )}
            </tbody>
          </table>
        </Box>
        
        <Box py="sm" style={{ borderTop: '1px solid var(--app-border-color)' }}>
          <Group justify="center" gap="xs">
            <Pagination
              value={currentWeek}
              onChange={handleWeekChange}
              total={daysRange.totalWeeks}
              color="green"
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

export default VerDietaPage;
