import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Container, 
  Alert, 
  useMantineColorScheme,
  Box,
  Loader,
  Pagination,
  Select,
  Button,
  Stack,
  Text,
  Tooltip,
  Paper,
  Group
} from '@mantine/core';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  IconChevronRight, 
  IconAlertCircle, 
  IconChevronLeft,
  IconEye,
  IconShoppingCart
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { obtenerDieta } from '../services/dietService';
import { Dieta, DayInfo } from '../types';
import { useAuth } from '../hooks/useAuth';
import { 
  DIAS_SEMANA, 
  parseFecha, 
  formatearFecha, 
  crearDatoDia, 
  dietaStyles as styles,
  obtenerDiaSemanaAjustado
} from '../helpers/diets/DietaHelper';
import DietaHeader from '../components/organisms/DietaHeader';

// Las utilidades se han movido a DietaHelper.ts

const VerDietaPage: React.FC = () => {
  const { dietaId } = useParams<{ dietaId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { colorScheme } = useMantineColorScheme();
  const { user } = useAuth();
  const isDark = colorScheme === 'dark';
  
  // Detectar si es móvil basado en el ancho de pantalla
  const checkIsMobile = useCallback(() => {
    return typeof window !== 'undefined' && window.innerWidth < 768; // 768px es el breakpoint md estándar
  }, []);
  
  const [dieta, setDieta] = useState<Dieta | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentWeek, setCurrentWeek] = useState(1);
  const [startDayOfWeek, setStartDayOfWeek] = useState<number>(0); // 0 = Lunes, 6 = Domingo
  const [fechaInicio, setFechaInicio] = useState<Date | null>(null);
  const [isMobileState, setIsMobileState] = useState(false);
  const [currentDayIndex, setCurrentDayIndex] = useState(0); // Para navegación de días en móvil

  // Función para navegar al detalle de un día
  const handleVerDetalleDia = (dayInfo: DayInfo) => {
    navigate(`/dieta/${dietaId}/dia/${dayInfo.dietDayIndex + 1}`);
  };

  // Efecto para detectar cambios de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      const isMobile = checkIsMobile();
      console.log('Resize detected - isMobile:', isMobile, 'width:', window.innerWidth);
      setIsMobileState(isMobile);
    };

    // Establecer el estado inicial
    const initialIsMobile = checkIsMobile();
    console.log('Initial load - isMobile:', initialIsMobile, 'width:', window.innerWidth);
    setIsMobileState(initialIsMobile);

    // Agregar listener para resize
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [checkIsMobile]);

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
      if (!dietaId) {
        setError('ID de dieta no proporcionado');
        setLoading(false);
        return;
      }
      
      // Validar formato de ObjectId de MongoDB (24 caracteres hexadecimales)
      const objectIdRegex = /^[0-9a-fA-F]{24}$/;
      if (!objectIdRegex.test(dietaId)) {
        setError('El ID de dieta proporcionado no es válido');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
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

  const handleDayChange = (newDayIndex: number) => {
    setCurrentDayIndex(newDayIndex);
  };

  // Función para navegar a la página de lista de compra
  const handleVerListaCompra = () => {
    navigate(`/lista-compra/${dietaId}/semana/${currentWeek}`);
  };

  // Función para manejar la navegación del botón de volver
  const handleBackNavigation = () => {
    if (user?.role === 'user') {
      // Si es cliente, volver a mis dietas
      navigate('/mis-dietas');
    } else {
      // Si es worker, volver a dietas del cliente
      try {
        let clientId = null;
        
        if (dieta?.asignadaA && Array.isArray(dieta.asignadaA) && dieta.asignadaA.length > 0) {
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
    }
  };

  // Función para renderizar la vista móvil (un día a la vez)
  const renderMobileView = () => {
    if (!dieta || !fechaInicio) return null;

    const totalDays = dieta.dias.length;
    const currentDay = dieta.dias[currentDayIndex];
    const currentDate = new Date(fechaInicio);
    currentDate.setDate(currentDate.getDate() + currentDayIndex);
    
    const dayName = DIAS_SEMANA[currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1];
    const formattedDate = format(currentDate, "d 'de' MMMM", { locale: es });

    return (
      <Container size="sm" py="md" px="sm">
        {/* Navegación de días */}
        <Paper p="md" mb="md" withBorder>
          <Group justify="space-between" align="center">
            <Button 
              size="sm" 
              variant="subtle" 
              color="gray" 
              leftSection={<IconChevronLeft size={16} />} 
              disabled={currentDayIndex <= 0}
              onClick={() => handleDayChange(currentDayIndex - 1)}
            >
              Anterior
            </Button>
            
            <Stack gap="xs" align="center">
              <Text fw={700} size="lg" c={isDark ? "gray.1" : "gray.8"}>
                {dayName}
              </Text>
              <Text size="sm" c="dimmed">
                {formattedDate}
              </Text>
              <Text size="xs" c="dimmed">
                Día {currentDayIndex + 1} de {totalDays}
              </Text>
            </Stack>
            
            <Button 
              size="sm" 
              variant="subtle" 
              color="gray" 
              rightSection={<IconChevronRight size={16} />} 
              disabled={currentDayIndex >= totalDays - 1}
              onClick={() => handleDayChange(currentDayIndex + 1)}
            >
              Siguiente
            </Button>
          </Group>
        </Paper>

        {/* Lista de comidas del día - SIMPLIFICADA */}
        <Stack gap="md">
          {Array.from({ length: dieta.comidasDiarias }).map((_, comidaIndex) => {
            const comida = currentDay.comidas[comidaIndex];
            const mealNames = ['Desayuno', 'Media mañana', 'Almuerzo', 'Merienda', 'Cena'];
            const mealTimes = ['08:00', '11:00', '14:00', '17:00', '20:00'];
            
            return (
              <Paper key={comidaIndex} p="md" withBorder>
                <Stack gap="sm">
                  <Group justify="space-between" align="center">
                    <Text fw={600} size="md" c={isDark ? "gray.1" : "gray.8"}>
                      {mealNames[comidaIndex] || `Comida ${comidaIndex + 1}`}
                    </Text>
                    <Text size="sm" c="dimmed">
                      {mealTimes[comidaIndex]}
                    </Text>
                  </Group>
                  
                  {/* Mostrar solo nombres de platos, sin acceso a recetas */}
                  {comida && comida.platos && comida.platos.length > 0 ? (
                    <Stack gap="xs">
                      {comida.platos.map((plato, platoIndex) => (
                        <Text key={platoIndex} size="sm" c={isDark ? "gray.3" : "gray.6"}>
                          • {plato.nombre || `Plato ${platoIndex + 1}`}
                        </Text>
                      ))}
                    </Stack>
                  ) : (
                    <Text size="sm" c="dimmed" fs="italic">
                      Sin platos asignados
                    </Text>
                  )}
                </Stack>
              </Paper>
            );
          })}
        </Stack>

        {/* Botón para ver detalle del día */}
        <Paper p="md" mt="md" withBorder>
          <Group justify="center">
            <Button
              leftSection={<IconEye size={16} />}
              onClick={() => handleVerDetalleDia({
                weekDayIndex: currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1,
                dietDayIndex: currentDayIndex,
                weekDayName: dayName,
                fecha: currentDate,
                fechaFormateada: formattedDate,
                nombreCompleto: `${dayName} ${formattedDate}`,
                data: currentDay
              })}
              color="nutroos-green"
              variant="light"
            >
              Ver comidas y recetas
            </Button>
          </Group>
        </Paper>
      </Container>
    );
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

  // Debug: Log del estado actual
  console.log('Render - isMobileState:', isMobileState, 'dieta exists:', !!dieta);

  // Si es móvil, renderizar la vista móvil
  if (isMobileState && dieta) {
    console.log('Rendering mobile view');
    return (
      <>
        <DietaHeader
          dieta={dieta}
          isDark={isDark}
          fechaInicioFormateada={fechaInicioFormateada}
          userRole={user?.role}
          onBackNavigation={handleBackNavigation}
          isMobile={true}
        />
        
        {/* Vista móvil */}
        {renderMobileView()}
      </>
    );
  }

  console.log('Rendering desktop view');
  return (
    <>
      <DietaHeader
        dieta={dieta}
        isDark={isDark}
        fechaInicioFormateada={fechaInicioFormateada}
        userRole={user?.role}
        onBackNavigation={handleBackNavigation}
        isMobile={false}
      />

      <Container size="xl" py="md" px="sm" style={{ maxWidth: '1800px' }}>
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
        
        <Paper 
          withBorder 
          radius="md"
          style={{ 
            ...styles.paperBg,
            ...styles.paperBorder
          }}
        >
        {/* Selector de semana */}
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
                color="gray" 
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
                color="gray" 
                rightSection={<IconChevronRight size={16} />} 
                disabled={currentWeek >= daysRange.totalWeeks}
                onClick={() => handleWeekChange(currentWeek + 1)}
              >
                Siguiente
              </Button>
            </Group>
            
            <Group gap="md">
              <Text size="md" fw={600} c={isDark ? "gray.3" : "gray.6"}>
                {currentWeek} de {daysRange.totalWeeks} semanas
              </Text>
              <Button
                size="sm"
                leftSection={<IconShoppingCart size={16} />}
                color="nutroos-green"
                variant="light"
                onClick={handleVerListaCompra}
              >
                Ver Lista de Compra
              </Button>
            </Group>
          </Group>
        </Box>
        
        <Box 
          px={{ base: 'xs', md: 'lg' }} 
          py="md" 
          mx="auto" 
          style={{ 
            overflowX: isMobileState ? 'auto' : 'visible',
            borderRadius: '12px',
            background: isDark 
              ? 'linear-gradient(135deg, rgba(148, 163, 184, 0.02) 0%, rgba(148, 163, 184, 0.01) 100%)'
              : 'linear-gradient(135deg, rgba(148, 163, 184, 0.01) 0%, rgba(148, 163, 184, 0.005) 100%)',
            padding: isMobileState ? '12px' : '20px',
            border: '1px solid rgba(148, 163, 184, 0.12)',
            maxWidth: isMobileState ? '100%' : '1700px'
          }}
        >
          <table style={styles.tableStyles(isMobileState)}>
            <thead>
              <tr>
                {daysRange.days.map((dayInfo: DayInfo) => (
                  <th
                    key={`header-${dayInfo.dietDayIndex}`}
                    style={styles.tableHeader(isDark, isMobileState)}
                  >
                    <Text fw={700} c={isDark ? "gray.2" : "gray.7"} size={isMobileState ? "xs" : "sm"} ta="center">
                      {dayInfo.weekDayName}
                    </Text>
                    <Text size={isMobileState ? "xs" : "sm"} c="dimmed" ta="center">
                      {dayInfo.fechaFormateada}
                    </Text>
                    <Box mt="xs">
                      <Button
                        size="xs"
                        leftSection={<IconEye size={10} />}
                        onClick={() => handleVerDetalleDia(dayInfo)}
                        color="nutroos-green"
                        variant="light"
                        fullWidth
                        style={{ fontSize: '10px' }}
                      >
                        Ver comidas y recetas
                      </Button>
                    </Box>
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
                          style={styles.emptyCell(isMobileState)}
                        />
                      );

                      return (
                        <td 
                          key={`day-${dayInfo.dietDayIndex}-comida-${comidaIndex}`}
                          style={{ 
                            padding: isMobileState ? '8px 6px' : '14px 12px',
                            minWidth: isMobileState ? '120px' : '220px',
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
                              size={isMobileState ? "xs" : "sm"} 
                              c={isDark ? "gray.2" : "gray.7"} 
                              mb="4px"
                              p={isMobileState ? "4px 6px" : "6px 8px"}
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
                          
                          {/* Mostrar solo nombres de platos, sin acceso a recetas */}
                          {comida.platos && comida.platos.length > 0 ? (
                            <Stack gap="xs">
                              {comida.platos.map((plato, platoIndex) => (
                                <Text 
                                  key={platoIndex}
                                  size={isMobileState ? "xs" : "sm"} 
                                  c={isDark ? "gray.3" : "gray.6"}
                                  style={{ 
                                    padding: isMobileState ? "2px 4px" : "4px 6px",
                                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                                    borderRadius: '4px',
                                    border: '1px solid rgba(148, 163, 184, 0.1)'
                                  }}
                                >
                                  • {plato.nombre || `Plato ${platoIndex + 1}`}
                                </Text>
                              ))}
                            </Stack>
                          ) : (
                            <Text 
                              size={isMobileState ? "xs" : "sm"} 
                              c="dimmed" 
                              fs="italic"
                              ta="center"
                              p="8px"
                            >
                              Sin platos
                            </Text>
                          )}
                          
                        </td>
                      );
                    })}
                  </tr>
                ))
              }
            </tbody>
          </table>
        </Box>
        
        <Box py="sm" style={{ borderTop: '1px solid var(--app-border-color)' }}>
          <Group justify="center" gap="xs">
            <Pagination
              value={currentWeek}
              onChange={handleWeekChange}
              total={daysRange.totalWeeks}
              color="gray"
              withEdges
              size="sm"
              radius="xs"
            />
          </Group>
        </Box>
      </Paper>
      </Container>
    </>
  );
};

export default VerDietaPage;
