import React, { useState, useEffect, useCallback } from 'react';
import { 
  Grid, 
  Card, 
  Text, 
  Group, 
  Badge, 
  Progress, 
  NumberFormatter,
  Stack,
  ThemeIcon,
  Divider,
  SimpleGrid,
  Box
} from '@mantine/core';
import { 
  IconCalendar,
  IconTarget,
  IconTrendingUp, 
  IconClock,
  IconBarbell,
  IconFlame,
  IconHeart,
  IconTrendingDown,
  IconTrendingUp as IconUp,
  IconBarbell as IconDumbbell,
  IconRun,
  IconActivity,
  IconTrophy
} from '@tabler/icons-react';
import { 
  BarChart, 
  PieChart
} from '@mantine/charts';
import { estadisticasService } from '../../services/estadisticasService';
import { EstadisticasCliente, EstadisticasSemanal, ProgresoEjercicio, RachasEntrenamiento } from '../../types/estadisticas';
import EmptyProgresoState from './EmptyProgresoState';
import WeekPanel from './shared/WeekPanel';
import HistorialSelector from './shared/HistorialSelector';
import { LoadingState, ErrorState } from './shared/LoadingErrorStates';
import { useProgressTab } from '../../hooks/useProgressTab';

// Tipo extendido para manejar la diferencia entre frontend y backend
interface EstadisticasSemanalBackend extends EstadisticasSemanal {
  progreso: EstadisticasSemanal['progreso'];
}

const ProgresoEntrenamientoTab: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [estadisticas, setEstadisticas] = useState<EstadisticasCliente | null>(null);
  const [estadisticasSemanal, setEstadisticasSemanal] = useState<EstadisticasSemanalBackend | null>(null);
  const [progresoEjercicios, setProgresoEjercicios] = useState<ProgresoEjercicio[]>([]);
  const [rachas, setRachas] = useState<RachasEntrenamiento | null>(null);

  const {
    getCurrentWeekNumber,
    semanaSeleccionada,
    añoSeleccionado,
    mostrarHistorial,
    isCurrentWeek,
    setSemanaSeleccionada,
    setAñoSeleccionado,
    setMostrarHistorial,
    handleVolverActual
  } = useProgressTab();

  // Componente para mostrar comparación con semana anterior
  const ComparacionSemanaAnterior = ({ comparacion }: { comparacion: Record<string, { actual: number; porcentajeCambio: number }> }) => {
    const getIcon = (porcentaje: number) => {
      if (porcentaje > 0) return <IconUp size={16} color="green" />;
      if (porcentaje < 0) return <IconTrendingDown size={16} color="red" />;
      return <IconTarget size={16} color="gray" />;
    };

    const getColor = (porcentaje: number) => {
      if (porcentaje > 0) return 'green';
      if (porcentaje < 0) return 'red';
      return 'gray';
    };

    return (
      <Card p="md" radius="md" withBorder>
        <Text size="lg" fw={600} mb="md">
          Comparación con Semana Anterior
        </Text>
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
          <Box>
            <Group mb="xs">
              {getIcon(comparacion.sesionesCompletadas.porcentajeCambio)}
              <Text size="sm" fw={500}>Sesiones</Text>
            </Group>
            <Text size="xl" fw={700} c={getColor(comparacion.sesionesCompletadas.porcentajeCambio)}>
              {comparacion.sesionesCompletadas.actual}
            </Text>
            <Text size="xs" c="dimmed">
              {comparacion.sesionesCompletadas.porcentajeCambio > 0 ? '+' : ''}
              {Math.round(comparacion.sesionesCompletadas.porcentajeCambio)}%
            </Text>
          </Box>
          
          <Box>
            <Group mb="xs">
              {getIcon(comparacion.tiempoEntrenamiento.porcentajeCambio)}
              <Text size="sm" fw={500}>Tiempo (min)</Text>
            </Group>
            <Text size="xl" fw={700} c={getColor(comparacion.tiempoEntrenamiento.porcentajeCambio)}>
              {Math.round(comparacion.tiempoEntrenamiento.actual)}
            </Text>
            <Text size="xs" c="dimmed">
              {comparacion.tiempoEntrenamiento.porcentajeCambio > 0 ? '+' : ''}
              {Math.round(comparacion.tiempoEntrenamiento.porcentajeCambio)}%
            </Text>
          </Box>
          
          <Box>
            <Group mb="xs">
              {getIcon(comparacion.cargaUtilizada.porcentajeCambio)}
              <Text size="sm" fw={500}>Carga (kg)</Text>
            </Group>
            <Text size="xl" fw={700} c={getColor(comparacion.cargaUtilizada.porcentajeCambio)}>
              {Math.round(comparacion.cargaUtilizada.actual)}
            </Text>
            <Text size="xs" c="dimmed">
              {comparacion.cargaUtilizada.porcentajeCambio > 0 ? '+' : ''}
              {Math.round(comparacion.cargaUtilizada.porcentajeCambio)}%
            </Text>
          </Box>
          
          <Box>
            <Group mb="xs">
              {getIcon(comparacion.ejerciciosCompletados.porcentajeCambio)}
              <Text size="sm" fw={500}>Ejercicios</Text>
            </Group>
            <Text size="xl" fw={700} c={getColor(comparacion.ejerciciosCompletados.porcentajeCambio)}>
              {comparacion.ejerciciosCompletados.actual}
            </Text>
            <Text size="xs" c="dimmed">
              {comparacion.ejerciciosCompletados.porcentajeCambio > 0 ? '+' : ''}
              {Math.round(comparacion.ejerciciosCompletados.porcentajeCambio)}%
            </Text>
          </Box>
        </SimpleGrid>
      </Card>
    );
  };

  // Componente para mostrar rachas de entrenamiento
  const RachasEntrenamientoCard = ({ rachas }: { rachas: RachasEntrenamiento }) => {
    return (
      <Card p="md" radius="md" withBorder>
        <Group mb="md">
          <ThemeIcon size="lg" radius="md" color="blue">
            <IconTrophy size={20} />
          </ThemeIcon>
          <Text size="lg" fw={600}>Rachas de Entrenamiento</Text>
        </Group>
        
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
          <Box>
            <Text size="sm" c="dimmed" mb="xs">Racha Actual</Text>
            <Text size="xl" fw={700} c="blue">
              {rachas.rachaActual.dias} días
            </Text>
            <Text size="xs" c="dimmed">
              {rachas.rachaActual.semanas} semanas
            </Text>
          </Box>
          
          <Box>
            <Text size="sm" c="dimmed" mb="xs">Mejor Racha</Text>
            <Text size="xl" fw={700} c="green">
              {rachas.rachaMaxima.dias} días
            </Text>
            <Text size="xs" c="dimmed">
              {rachas.rachaMaxima.semanas} semanas
            </Text>
          </Box>
          
          <Box>
            <Text size="sm" c="dimmed" mb="xs">Última Sesión</Text>
            <Text size="sm" fw={500}>
              {rachas.ultimaSesion ? 
                new Date(rachas.ultimaSesion).toLocaleDateString() : 
                'Nunca'
              }
            </Text>
          </Box>
          
          <Box>
            <Text size="sm" c="dimmed" mb="xs">Días Sin Entrenar</Text>
            <Text size="xl" fw={700} c={rachas.diasSinEntrenar > 3 ? 'red' : 'gray'}>
              {rachas.diasSinEntrenar}
            </Text>
          </Box>
        </SimpleGrid>
      </Card>
    );
  };

  // Componente para mostrar distribución por tipo de ejercicio
  const DistribucionTipoEjercicio = ({ distribucion }: { distribucion: Record<string, number> }) => {
    const data = Object.entries(distribucion)
      .filter(([, value]) => value > 0)
      .map(([tipo, cantidad]) => ({
        tipo: tipo.charAt(0).toUpperCase() + tipo.slice(1),
        cantidad: cantidad
      }));

    if (data.length === 0) {
      return (
        <Card p="md" radius="md" withBorder>
          <Text size="lg" fw={600} mb="md">Distribución por Tipo de Ejercicio</Text>
          <Text c="dimmed" ta="center">No hay datos disponibles</Text>
        </Card>
      );
    }

    return (
      <Card p="md" radius="md" withBorder>
        <Text size="lg" fw={600} mb="md">Distribución por Tipo de Ejercicio</Text>
        <Box h={300}>
          <BarChart
            h={300}
            data={data}
            dataKey="tipo"
            series={[{ name: 'cantidad', color: 'blue.6' }]}
            withLegend
            legendProps={{ verticalAlign: 'bottom' }}
            withTooltip
            tooltipProps={{
              content: ({ label, payload }) => (
                <Paper p="sm" withBorder>
                  <Text size="sm" fw={500}>{label}</Text>
                  <Text size="sm" c="blue">
                    {payload?.[0]?.value} ejercicios
                  </Text>
                </Paper>
              ),
            }}
          />
        </Box>
      </Card>
    );
  };

  // Componente para mostrar percepción del esfuerzo (RPE)
  const PercepcionEsfuerzoCard = ({ percepcion }: { percepcion: { promedioRPE: number; distribucionRPE: { ligero: number; moderado: number; intenso: number } } }) => {
    const data = [
      { name: 'Ligero', value: percepcion.distribucionRPE.ligero, color: '#40c057' },
      { name: 'Moderado', value: percepcion.distribucionRPE.moderado, color: '#fd7e14' },
      { name: 'Intenso', value: percepcion.distribucionRPE.intenso, color: '#fa5252' }
    ].filter(item => item.value > 0);

    return (
      <Card p="md" radius="md" withBorder>
        <Group mb="md">
          <ThemeIcon size="lg" radius="md" color="orange">
            <IconFlame size={20} />
          </ThemeIcon>
          <Text size="lg" fw={600}>Percepción del Esfuerzo</Text>
        </Group>
        
        <Group mb="md">
          <Box>
            <Text size="sm" c="dimmed">Promedio RPE</Text>
            <Text size="xl" fw={700} c="orange">
              {percepcion.promedioRPE.toFixed(1)}/10
            </Text>
          </Box>
        </Group>

        {data.length > 0 ? (
          <Box h={200}>
            <PieChart
              h={200}
              data={data}
              withTooltip
              tooltipProps={{
                content: ({ label, payload }) => (
                  <Paper p="sm" withBorder>
                    <Text size="sm" fw={500}>{label}</Text>
                    <Text size="sm" c={payload?.[0]?.payload?.color}>
                      {payload?.[0]?.value} sesiones
                    </Text>
                  </Paper>
                ),
              }}
            />
          </Box>
        ) : (
          <Text c="dimmed" ta="center">No hay datos de esfuerzo disponibles</Text>
        )}
      </Card>
    );
  };


  const cargarEstadisticas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar estadísticas generales
      try {
        const responseGeneral = await estadisticasService.getMiProgreso();
        if (responseGeneral.success && responseGeneral.estadisticas) {
          setEstadisticas(responseGeneral.estadisticas as EstadisticasCliente);
        }
      } catch (err) {
        console.warn('No se pudieron cargar las estadísticas generales:', err);
      }

      // Cargar estadísticas semanales
      try {
        const responseSemanal = await estadisticasService.getMiProgresoSemanal(semanaSeleccionada, añoSeleccionado);
        if (responseSemanal.success && responseSemanal.estadisticas) {
          setEstadisticasSemanal(responseSemanal.estadisticas as EstadisticasSemanalBackend);
        }
      } catch (err) {
        console.warn('No se pudieron cargar las estadísticas semanales:', err);
      }

      // Cargar progreso de ejercicios
      try {
        const responseEjercicios = await estadisticasService.getMiProgresoEjercicios();
        if (responseEjercicios.success && responseEjercicios.progreso) {
          setProgresoEjercicios(responseEjercicios.progreso);
        }
      } catch (err) {
        console.warn('No se pudo cargar el progreso de ejercicios:', err);
      }

      // Cargar rachas de entrenamiento
      try {
        const responseRachas = await estadisticasService.getRachasEntrenamiento();
        if (responseRachas.success && responseRachas.rachas) {
          setRachas(responseRachas.rachas);
        }
      } catch (err) {
        console.warn('No se pudieron cargar las rachas de entrenamiento:', err);
      }

    } catch (err) {
      setError('Error al cargar las estadísticas');
      console.error('Error cargando estadísticas:', err);
    } finally {
      setLoading(false);
    }
  }, [semanaSeleccionada, añoSeleccionado]);

  useEffect(() => {
    cargarEstadisticas();
  }, [semanaSeleccionada, añoSeleccionado, cargarEstadisticas]);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <ErrorState 
        error={error} 
        onRetry={cargarEstadisticas}
        emptyStateComponent={<EmptyProgresoState onRetry={cargarEstadisticas} />}
      />
    );
  }


  return (
    <Stack gap="xl">
      {/* Panel de información de la semana */}
      <WeekPanel
        semanaSeleccionada={semanaSeleccionada}
        añoSeleccionado={añoSeleccionado}
        isCurrentWeek={isCurrentWeek}
        onRefresh={cargarEstadisticas}
        onToggleHistorial={() => setMostrarHistorial(!mostrarHistorial)}
        mostrarHistorial={mostrarHistorial}
        color="blue"
      />

      {/* Selectores de historial (solo cuando se muestre) */}
      {mostrarHistorial && (
        <HistorialSelector
          semanaSeleccionada={semanaSeleccionada}
          añoSeleccionado={añoSeleccionado}
          onSemanaChange={setSemanaSeleccionada}
          onAñoChange={setAñoSeleccionado}
          onVolverActual={handleVolverActual}
          getCurrentWeekNumber={getCurrentWeekNumber}
        />
      )}


      {/* Estadísticas Generales */}
      {estadisticas && (
        <Grid>
          <Grid.Col span={12}>
            <Text size="lg" fw={600} mb="md">
              Resumen General
            </Text>
          </Grid.Col>
          
          {/* Asistencia */}
          <Grid.Col span={{ base: 6, md: 3 }}>
            <Card shadow="sm" padding="md" radius="md">
              <Group justify="space-between" mb="xs">
                <Text fw={500} size="sm">Asistencia</Text>
                <ThemeIcon color="blue" variant="light">
                  <IconCalendar size={16} />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700} c="blue">
                {Math.round(estadisticas.asistencia?.porcentajeAsistencia || 0)}%
              </Text>
              <Text size="sm" c="dimmed">
                {estadisticas.asistencia?.sesionesCompletadas || 0} de {estadisticas.asistencia?.sesionesProgramadas || 0} sesiones
              </Text>
              <Progress 
                value={estadisticas.asistencia?.porcentajeAsistencia || 0} 
                size="sm" 
                mt="xs" 
                color="blue"
              />
            </Card>
          </Grid.Col>

          {/* Progreso */}
          <Grid.Col span={{ base: 6, md: 3 }}>
            <Card shadow="sm" padding="md" radius="md">
              <Group justify="space-between" mb="xs">
                <Text fw={500} size="sm">Progreso</Text>
                <ThemeIcon color="green" variant="light">
                  <IconTarget size={16} />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700} c="green">
                {Math.round(estadisticas.rendimiento?.porcentajeCompletitud || 0)}%
              </Text>
                <Text size="sm" c="dimmed">
                  {estadisticas.rendimiento?.ejerciciosCompletados || 0} de {estadisticas.rendimiento?.ejerciciosTotal || 0} ejercicios
                </Text>
              <Progress 
                value={estadisticas.rendimiento?.porcentajeCompletitud || 0} 
                size="sm" 
                mt="xs" 
                color="green"
              />
            </Card>
          </Grid.Col>

          {/* Consistencia */}
          <Grid.Col span={{ base: 6, md: 3 }}>
            <Card shadow="sm" padding="md" radius="md">
              <Group justify="space-between" mb="xs">
                <Text fw={500} size="sm">Consistencia</Text>
                <ThemeIcon color="orange" variant="light">
                  <IconTrendingUp size={16} />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700} c="orange">
                {Math.round(estadisticas.consistencia?.porcentajeConsistencia || 0)}%
              </Text>
              <Text size="sm" c="dimmed">
                {estadisticas.consistencia?.diasEntrenados || 0} de {estadisticas.consistencia?.diasDisponibles || 0} días
              </Text>
              <Progress 
                value={estadisticas.consistencia?.porcentajeConsistencia || 0}
                size="sm" 
                mt="xs" 
                color="orange"
              />
            </Card>
          </Grid.Col>

          {/* Rendimiento */}
          <Grid.Col span={{ base: 6, md: 3 }}>
            <Card shadow="sm" padding="md" radius="md">
              <Group justify="space-between" mb="xs">
                <Text fw={500} size="sm">Tiempo Promedio</Text>
                <ThemeIcon color="purple" variant="light">
                  <IconClock size={16} />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700} c="purple">
                <NumberFormatter value={estadisticas.rendimiento.tiempoPromedioSesion} suffix=" min" />
              </Text>
              <Text size="sm" c="dimmed">
                Por sesión
              </Text>
            </Card>
          </Grid.Col>
        </Grid>
      )}

      {/* Estadísticas Semanales */}
      {estadisticasSemanal && (
        <>
          <Divider my="md" />
          <Text size="lg" fw={600} mb="md">
            📊 Resumen de la Semana {estadisticasSemanal.semana?.numero}
          </Text>
          
          <Grid>
            {/* Asistencia con gráfica */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card shadow="sm" padding="lg" radius="md" h="100%">
                <Group justify="space-between" mb="md">
                  <div>
                    <Text fw={600} size="lg">Asistencia</Text>
                    <Text size="sm" c="dimmed">Sesiones completadas esta semana</Text>
                  </div>
                  <ThemeIcon color="blue" variant="light" size="xl">
                    <IconCalendar size={24} />
                  </ThemeIcon>
                </Group>
                
                <Group align="flex-end" mb="md">
                  <Text size="2rem" fw={800} c="blue">
                    {Math.round(estadisticasSemanal.asistencia?.porcentajeAsistencia || 0)}%
                  </Text>
                  <Text size="sm" c="dimmed" ml="xs">
                    ({estadisticasSemanal.asistencia?.sesionesCompletadas || 0}/{estadisticasSemanal.asistencia?.sesionesProgramadas || 0} sesiones)
                  </Text>
                </Group>
                
                <Progress 
                  value={estadisticasSemanal.asistencia?.porcentajeAsistencia || 0} 
                  size="lg" 
                  color="blue"
                  radius="xl"
                />
              </Card>
            </Grid.Col>

            {/* Progreso con gráfica */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card shadow="sm" padding="lg" radius="md" h="100%">
                <Group justify="space-between" mb="md">
                  <div>
                    <Text fw={600} size="lg">Progreso</Text>
                    <Text size="sm" c="dimmed">Ejercicios completados</Text>
                  </div>
                  <ThemeIcon color="green" variant="light" size="xl">
                    <IconTarget size={24} />
                  </ThemeIcon>
                </Group>
                
                <Group align="flex-end" mb="md">
                  <Text size="2rem" fw={800} c="green">
                    {Math.round(estadisticasSemanal?.progreso?.porcentajeCompletitud || 0)}%
                  </Text>
                  <Text size="sm" c="dimmed" ml="xs">
                    ({estadisticasSemanal?.progreso?.ejerciciosCompletados || 0}/{estadisticasSemanal?.progreso?.ejerciciosRegistrados || 0} ejercicios)
                  </Text>
                </Group>
                
                <Progress 
                  value={estadisticasSemanal?.progreso?.porcentajeCompletitud || 0} 
                  size="lg" 
                  color="green"
                  radius="xl"
                />
              </Card>
            </Grid.Col>

            {/* Métricas físicas */}
            <Grid.Col span={{ base: 6, md: 3 }}>
              <Card shadow="sm" padding="lg" radius="md" h="100%">
                <Group justify="space-between" mb="md">
                  <div>
                    <Text fw={600} size="md">Tiempo</Text>
                    <Text size="sm" c="dimmed">Entrenamiento total</Text>
                  </div>
                  <ThemeIcon color="purple" variant="light">
                    <IconClock size={20} />
                  </ThemeIcon>
                </Group>
                
                <Text size="xl" fw={700} c="purple">
                  {estadisticasSemanal?.progreso?.tiempoTotalEntrenamiento || 0} min
                </Text>
                
                {estadisticasSemanal?.asistencia?.sesionesCompletadas && estadisticasSemanal.asistencia.sesionesCompletadas > 0 && (
                  <Text size="sm" c="dimmed" mt="xs">
                    Promedio: {Math.round((estadisticasSemanal?.progreso?.tiempoTotalEntrenamiento || 0) / estadisticasSemanal.asistencia.sesionesCompletadas)} min/sesión
                  </Text>
                )}
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 6, md: 3 }}>
              <Card shadow="sm" padding="lg" radius="md" h="100%">
                <Group justify="space-between" mb="md">
                  <div>
                    <Text fw={600} size="md">Carga</Text>
                    <Text size="sm" c="dimmed">Peso total levantado</Text>
                  </div>
                  <ThemeIcon color="orange" variant="light">
                    <IconBarbell size={20} />
                  </ThemeIcon>
                </Group>
                
                <Text size="xl" fw={700} c="orange">
                  {estadisticasSemanal?.progreso?.cargaTotalUtilizada || 0} kg
                </Text>
                
                {estadisticasSemanal?.asistencia?.sesionesCompletadas && estadisticasSemanal.asistencia.sesionesCompletadas > 0 && (
                  <Text size="sm" c="dimmed" mt="xs">
                    Promedio: {Math.round((estadisticasSemanal?.progreso?.cargaTotalUtilizada || 0) / estadisticasSemanal.asistencia.sesionesCompletadas)} kg/sesión
                  </Text>
                )}
              </Card>
            </Grid.Col>
          </Grid>
        </>
      )}

      {/* Top 3 Ejercicios */}
      {progresoEjercicios.length > 0 && (
        <>
          <Divider my="md" />
          <Group justify="space-between" align="center" mb="md">
            <Text size="lg" fw={600}>
              🏆 Top 3 Ejercicios
            </Text>
            <Text size="sm" c="dimmed">
              Mejor rendimiento esta semana
            </Text>
          </Group>
          
          <Grid>
            {progresoEjercicios
              .filter(ejercicio => ejercicio.estadisticas?.totalSesiones && ejercicio.estadisticas.totalSesiones > 0)
              .sort((a, b) => (b.estadisticas?.cargaMaxima || 0) - (a.estadisticas?.cargaMaxima || 0))
              .slice(0, 3)
              .map((ejercicio, index) => (
              <Grid.Col span={{ base: 12, md: 4 }} key={ejercicio.ejercicioId || 'unknown'}>
                <Card shadow="sm" padding="lg" radius="md" h="100%">
                  {/* Posición y medalla */}
                  <Group justify="space-between" mb="md">
                    <Group gap="sm">
                      <ThemeIcon 
                        color={index === 0 ? 'yellow' : index === 1 ? 'gray' : 'orange'} 
                        variant="filled" 
                        size="lg"
                      >
                        <Text fw={700} size="sm">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </Text>
                      </ThemeIcon>
                      <div>
                        <Text fw={600} size="md">{ejercicio.ejercicioNombre || 'Ejercicio sin nombre'}</Text>
                        <Text size="sm" c="dimmed">{ejercicio.grupoMuscular || 'Sin grupo muscular'}</Text>
                      </div>
                    </Group>
                    
                    <Badge 
                      color={
                        ejercicio.progreso?.tendencia === 'mejora' ? 'green' :
                        ejercicio.progreso?.tendencia === 'estable' ? 'blue' : 'red'
                      }
                      variant="light"
                    >
                      {ejercicio.progreso?.tendencia === 'mejora' ? '📈 Mejora' :
                       ejercicio.progreso?.tendencia === 'estable' ? '➡️ Estable' : '📉 Baja'}
                    </Badge>
                  </Group>

                  {/* Métricas principales */}
                  <Stack gap="md">
                    <div>
                      <Text size="sm" c="dimmed">Carga Máxima</Text>
                      <Text fw={700} size="xl" c="blue">
                        {ejercicio.estadisticas?.cargaMaxima || 0} kg
                      </Text>
                    </div>
                    
                    <Group grow>
                      <div>
                        <Text size="sm" c="dimmed">Repeticiones</Text>
                        <Text fw={600} size="lg">
                          {ejercicio.estadisticas?.repeticionesMaximas || 0}
                        </Text>
                      </div>
                      <div>
                        <Text size="sm" c="dimmed">Sesiones</Text>
                        <Text fw={600} size="lg">
                          {ejercicio.estadisticas?.totalSesiones || 0}
                        </Text>
                      </div>
                    </Group>
                  </Stack>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
          
          {progresoEjercicios.filter(ejercicio => ejercicio.estadisticas?.totalSesiones && ejercicio.estadisticas.totalSesiones > 0).length === 0 && (
            <Card shadow="sm" padding="xl" radius="md">
              <Stack align="center" gap="md">
                <ThemeIcon color="gray" variant="light" size="xl">
                  <IconTarget size={32} />
                </ThemeIcon>
                <div style={{ textAlign: 'center' }}>
                  <Text fw={600} size="lg">No hay datos de ejercicios</Text>
                  <Text size="sm" c="dimmed">
                    Completa algunas sesiones para ver tus mejores ejercicios aquí
                  </Text>
                </div>
              </Stack>
            </Card>
          )}

          {/* Nuevas secciones de métricas expandidas */}
          {estadisticasSemanal && (
            <>
              {/* Rachas de Entrenamiento */}
              {rachas && (
                <RachasEntrenamientoCard rachas={rachas} />
              )}

              {/* Comparación con Semana Anterior */}
              {estadisticasSemanal?.comparacionSemanaAnterior && (
                <ComparacionSemanaAnterior 
                  comparacion={estadisticasSemanal.comparacionSemanaAnterior} 
                />
              )}

              {/* Métricas Cuantitativas Adicionales */}
              <Card p="md" radius="md" withBorder>
                <Text size="lg" fw={600} mb="md">Métricas Detalladas de la Semana</Text>
                <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
                  <Box>
                    <Group mb="xs">
                      <ThemeIcon color="blue" variant="light">
                        <IconDumbbell size={16} />
                      </ThemeIcon>
                      <Text size="sm" fw={500}>Series Totales</Text>
                    </Group>
                    <Text size="xl" fw={700} c="blue">
                      {estadisticasSemanal?.progreso?.seriesTotales || 0}
                    </Text>
                  </Box>
                  
                  <Box>
                    <Group mb="xs">
                      <ThemeIcon color="green" variant="light">
                        <IconActivity size={16} />
                      </ThemeIcon>
                      <Text size="sm" fw={500}>Repeticiones</Text>
                    </Group>
                    <Text size="xl" fw={700} c="green">
                      {estadisticasSemanal?.progreso?.repeticionesTotales || 0}
                    </Text>
                  </Box>
                  
                  <Box>
                    <Group mb="xs">
                      <ThemeIcon color="orange" variant="light">
                        <IconRun size={16} />
                      </ThemeIcon>
                      <Text size="sm" fw={500}>Cardio (min)</Text>
                    </Group>
                    <Text size="xl" fw={700} c="orange">
                      {estadisticasSemanal?.progreso?.tiempoCardio || 0}
                    </Text>
                  </Box>
                  
                  <Box>
                    <Group mb="xs">
                      <ThemeIcon color="red" variant="light">
                        <IconHeart size={16} />
                      </ThemeIcon>
                      <Text size="sm" fw={500}>Distancia (km)</Text>
                    </Group>
                    <Text size="xl" fw={700} c="red">
                      {estadisticasSemanal?.progreso?.distanciaCardio || 0}
                    </Text>
                  </Box>
                </SimpleGrid>
              </Card>

              {/* Distribución por Tipo de Ejercicio */}
              {estadisticasSemanal?.progreso?.distribucionTipoEjercicio && (
                <DistribucionTipoEjercicio 
                  distribucion={estadisticasSemanal.progreso.distribucionTipoEjercicio} 
                />
              )}

              {/* Percepción del Esfuerzo */}
              {estadisticasSemanal?.percepcionEsfuerzo && (
                <PercepcionEsfuerzoCard 
                  percepcion={estadisticasSemanal.percepcionEsfuerzo} 
                />
              )}
            </>
          )}
        </>
      )}
    </Stack>
  );
};

export default ProgresoEntrenamientoTab;
