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
  Button
} from '@mantine/core';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  IconChevronRight, 
  IconAlertCircle, 
  IconCalendarEvent,
  IconArrowLeft,
  IconChevronLeft
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
        <Group justify="space-between" mb="xs" wrap="wrap">
          <Box>
            <Group gap="md" align="center">
              <Title order={2} c="nutroos-green.6">
                {dieta.nombre}
              </Title>
              <Badge color="green" variant="filled" size="sm">
                Publicada
              </Badge>
            </Group>
            <Text size="sm" c="dimmed">
              {dieta.descripcion || "Sin descripción"}
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
                        // Último recurso: convertir a string
                        clientId = String(clientData);
                      }
                    }
                    // 3. Cualquier otro caso, intenta la conversión a string
                    else if (clientData) {
                      clientId = String(clientData);
                    }
                  }
                  
                  console.log("Cliente original:", dieta.asignadaA && dieta.asignadaA[0]);
                  console.log("Cliente ID extraído:", clientId);
                  
                  if (clientId) {
                    navigate(`/worker/dashboard-clients/${clientId}/diets`);
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
              Volver a dietas del cliente
            </Button>
          </Group>
        </Group>
        
        <Group mt="lg" mb="md" gap="xs">
          <IconCalendarEvent size={18} color={isDark ? 'var(--mantine-color-gray-4)' : 'var(--mantine-color-gray-6)'} />
          <Text size="sm" c="dimmed">
            {dieta.duracion} días | {dieta.comidasDiarias} comidas diarias | Inicio: {fechaInicioFormateada}
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
                color="nutroos-green" 
                rightSection={<IconChevronRight size={16} />} 
                disabled={currentWeek >= daysRange.totalWeeks}
                onClick={() => handleWeekChange(currentWeek + 1)}
              >
                Siguiente
              </Button>
            </Group>
            
            <Text size="md" fw={600} c="nutroos-green.7">
              {currentWeek} de {daysRange.totalWeeks} semanas
            </Text>
          </Group>
        </Box>
        
        <Box px="xl" py="md" mx="auto" style={{ overflowX: 'auto' }}>
          <table style={styles.tableStyles}>
            <thead>
              <tr>
                {daysRange.days.map((dayInfo: DayInfo) => (
                  <th
                    key={`header-${dayInfo.dietDayIndex}`}
                    style={styles.tableHeader(isDark)}
                  >
                    <Text fw={700} c="nutroos-green" size="sm" ta="center">
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
                          <Text 
                            fw={600} 
                            size="sm" 
                            c="nutroos-green" 
                            mb="4px"
                            p="4px 6px"
                            style={styles.mealTitle(isDark)}
                          >
                            {comida.nombreComida || `Comida ${comidaIndex + 1}`} 
                            {comida.horaEstimada && <Text component="span" size="sm" fw={400}> ({comida.horaEstimada})</Text>}
                          </Text>
                          
                          {comida.platos.length > 0 && comida.platos.some(plato => plato.nombre !== null || plato.receta !== null) ? (
                            <Box ml="sm" style={{ display: 'table', width: '100%' }}>
                              {comida.platos
                                .filter(plato => plato.nombre !== null || plato.receta !== null)
                                .map((plato, platoIndex) => (
                                <div 
                                  key={platoIndex}
                                  style={{ 
                                    marginBottom: '3px',
                                    lineHeight: 1.3,
                                    display: 'table-row'
                                  }}
                                >
                                  <span style={{ 
                                    display: 'table-cell', 
                                    paddingRight: '8px', 
                                    verticalAlign: 'top',
                                    color: 'var(--mantine-color-nutroos-green-5)',
                                    fontSize: '18px',
                                    lineHeight: '1'
                                  }}>•</span>
                                  <Text 
                                    component="span"
                                    size="xs" 
                                    lineClamp={1} 
                                    title={plato.nombre || 'Plato sin nombre'} 
                                    style={{ display: 'table-cell' }}
                                  >
                                    {plato.nombre || 'Plato sin nombre'}
                                  </Text>
                                </div>
                              ))}
                            </Box>
                          ) : null}
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
                    {(dayInfo.data.caloriasTotales && dayInfo.data.caloriasTotales > 0) ? (
                      <Text fw={700} size="xs" ta="right">
                        Total: {dayInfo.data.caloriasTotales} kcal
                      </Text>
                    ) : null}
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
              total={daysRange.totalWeeks}
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

export default VerDietaPage;
