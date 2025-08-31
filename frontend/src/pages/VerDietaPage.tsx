import React, { useState, useEffect, useMemo } from 'react';
import { 
  Container, 
  Title, 
  Paper, 
  Group, 
  Text, 
  Alert, 
  Breadcrumbs,
  Anchor,
  useMantineColorScheme,
  Box,
  Loader,
  Divider,
  Pagination,
  Badge,
  Select,
  Button
} from '@mantine/core';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  IconHome, 
  IconChevronRight, 
  IconAlertCircle, 
  IconCalendarEvent,
  IconArrowLeft,
  IconChevronLeft
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { format, parse, parseISO, getDay, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { obtenerDieta } from '../services/dietService';
import { Dieta } from '../types';

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

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

  const daysRange = useMemo(() => {
    if (!dieta || !fechaInicio) return { days: [], totalWeeks: 0 };
    
    const totalWeeks = Math.ceil((dieta.dias.length + startDayOfWeek) / 7);
    
    const weekStartIndex = (currentWeek - 1) * 7 - startDayOfWeek;
    
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      const dietDayIndex = weekStartIndex + i;
      
      if (dietDayIndex >= 0 && dietDayIndex < dieta.dias.length) {
        const fechaDia = addDays(fechaInicio, dietDayIndex);
        const fechaFormateada = format(fechaDia, "d 'de' MMMM", { locale: es });
        
        days.push({
          weekDayIndex: i,
          dietDayIndex: dietDayIndex,
          weekDayName: DIAS_SEMANA[i],
          fecha: fechaDia,
          fechaFormateada: fechaFormateada,
          nombreCompleto: `${DIAS_SEMANA[i]} ${fechaFormateada}`,
          data: dieta.dias[dietDayIndex]
        });
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
          
          const diaSemana = getDay(fechaInicioDate); // 0 = domingo, 1 = lunes, ...
          const diaSemanaAjustado = convertirDiaSemana(diaSemana);
          
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

  const handleWeekChange = (newWeek: number) => {
    setCurrentWeek(newWeek);
  };

  const breadcrumbItems = [
    { title: 'Inicio', href: '/', icon: <IconHome size={14} /> },
    { title: 'Dietas', href: '/dietas' },
    { title: dieta?.nombre || 'Dieta', href: `/dietas/${dietaId}` },
    { title: 'Ver dieta', href: '#' },
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

  const fechaInicioFormateada = useMemo(() => {
    if (!dieta?.fechaInicio) return "";
    
    try {
      const fecha = parseFecha(dieta.fechaInicio);
      return format(fecha, "d 'de' MMMM 'de' yyyy", { locale: es });
    } catch {
      return String(dieta.fechaInicio);
    }
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
    <Container size="xl" py="xl" px="md">
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
              onClick={() => navigate('/dietas')}
            >
              Volver a dietas
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
          backgroundColor: 'var(--app-paper-bg)',
          borderColor: 'var(--app-border-color)'
        }}
      >
        {/* Selector de semana - Estilo tabla */}
        <Box 
          py="md" 
          px="lg" 
          style={{ 
            borderBottom: '2px solid var(--mantine-color-nutroos-green-6)',
            backgroundColor: isDark ? 'rgba(35, 139, 80, 0.1)' : 'rgba(35, 139, 80, 0.05)'
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
          <table style={{ 
            width: '100%', 
            borderCollapse: 'separate', 
            borderSpacing: '4px 2px',
            tableLayout: 'fixed',
            maxWidth: '1400px',
            margin: '0 auto'
          }}>
            <thead>
              <tr>
                {daysRange.days.map((dayInfo) => (
                  <th
                    key={`header-${dayInfo.dietDayIndex}`}
                    style={{ 
                      width: `${100 / daysRange.days.length}%`,
                      padding: '8px 4px',
                      backgroundColor: isDark ? 'rgba(35, 139, 80, 0.15)' : 'rgba(35, 139, 80, 0.08)',
                      borderBottom: '3px solid var(--mantine-color-nutroos-green-6)',
                      borderLeft: '1px solid var(--app-border-color)',
                      borderRight: '1px solid var(--app-border-color)',
                      borderTop: '1px solid var(--app-border-color)',
                      borderRadius: '6px 6px 0 0',
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                    }}
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
                    style={{ 
                      backgroundColor: comidaIndex % 2 === 0 ? 
                        (isDark ? 'rgba(35, 35, 35, 0.3)' : 'rgba(250, 250, 250, 0.6)') : 
                        (isDark ? 'transparent' : 'white')
                    }}
                  >
                    {daysRange.days.map((dayInfo) => {
                      const comida = dayInfo.data.comidas[comidaIndex];
                      if (!comida) return (
                        <td 
                          key={`empty-${dayInfo.dietDayIndex}-${comidaIndex}`}
                          style={{ 
                            padding: '6px 4px', 
                            borderBottom: '1px solid var(--app-border-color)',
                            borderLeft: '1px solid var(--app-border-color)',
                            borderRight: '1px solid var(--app-border-color)',
                            verticalAlign: 'top'
                          }}
                        />
                      );

                      return (
                        <td 
                          key={`day-${dayInfo.dietDayIndex}-comida-${comidaIndex}`}
                          style={{ 
                            padding: '6px 4px', 
                            borderBottom: '1px solid var(--app-border-color)',
                            borderLeft: '1px solid var(--app-border-color)',
                            borderRight: '1px solid var(--app-border-color)',
                            verticalAlign: 'top',
                            backgroundColor: comidaIndex % 2 === 0 ? 
                              (isDark ? 'rgba(35, 35, 35, 0.4)' : 'rgba(250, 250, 250, 0.8)') : 
                              (isDark ? 'rgba(35, 35, 35, 0.2)' : 'white')
                          }}
                        >
                          <Text 
                            fw={600} 
                            size="sm" 
                            c="nutroos-green" 
                            mb="4px"
                            p="4px 6px"
                            style={{
                              backgroundColor: isDark ? 'rgba(35, 139, 80, 0.12)' : 'rgba(35, 139, 80, 0.08)',
                              borderRadius: '4px',
                              display: 'inline-block',
                              width: '100%',
                              borderLeft: '2px solid var(--mantine-color-nutroos-green-6)'
                            }}
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
              <tr style={{
                backgroundColor: isDark ? 'rgba(35, 139, 80, 0.15)' : 'rgba(35, 139, 80, 0.08)',
                borderTop: '3px solid var(--mantine-color-nutroos-green-6)'
              }}>
                {daysRange.days.map((dayInfo) => (
                  <td 
                    key={`calories-${dayInfo.dietDayIndex}`}
                    style={{ 
                      padding: '10px 12px', 
                      textAlign: 'right',
                      fontWeight: 'bold',
                      color: isDark ? 'var(--mantine-color-nutroos-green-4)' : 'var(--mantine-color-nutroos-green-7)',
                      borderLeft: '1px solid var(--app-border-color)',
                      borderRight: '1px solid var(--app-border-color)',
                      borderBottom: '1px solid var(--app-border-color)',
                      borderRadius: '0 0 8px 8px'
                    }}
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
