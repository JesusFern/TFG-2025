import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Card, 
  Text, 
  Group, 
  Badge, 
  Progress, 
  Stack,
  ThemeIcon,
  Divider,
  SimpleGrid,
  Box,
  Paper
} from '@mantine/core';
import { 
  IconCalendar,
  IconTarget,
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
  PieChart
} from '@mantine/charts';
import BarChartComponent from './shared/BarChartComponent';
import { estadisticasService } from '../../services/estadisticasService';
import { EstadisticasCliente, EstadisticasSemanal, ProgresoEjercicio, RachasEntrenamiento } from '../../types/estadisticas';
import EmptyProgresoState from './EmptyProgresoState';
import WeekPanel from './shared/WeekPanel';
import HistorialSelector from './shared/HistorialSelector';
import { LoadingState, ErrorState } from './shared/LoadingErrorStates';
import EstadisticasGeneralesLayout from './shared/EstadisticasGeneralesLayout';
import { useProgressTab } from '../../hooks/useProgressTab';
import { useProgressStats } from '../../hooks/useProgressStats';

// Tipo extendido para manejar la diferencia entre frontend y backend
interface EstadisticasSemanalBackend extends EstadisticasSemanal {
  progreso: EstadisticasSemanal['progreso'];
}


const ProgresoEntrenamientoTab: React.FC = () => {
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

  // Hook para manejar estadísticas
  const {
    loading,
    error,
    estadisticas,
    estadisticasSemanal,
    progresoStats: progresoEjercicios,
    cargarEstadisticas
  } = useProgressStats({
    loadGeneralStats: async () => {
      const response = await estadisticasService.getMiProgreso();
      return response.success && response.estadisticas ? response.estadisticas as EstadisticasCliente : null;
    },
    loadWeeklyStats: async (semana: number, año: number) => {
      const response = await estadisticasService.getMiProgresoSemanal(semana, año);
      return response.success && response.estadisticas ? response.estadisticas as EstadisticasSemanalBackend : null;
    },
    loadProgressStats: async () => {
      const response = await estadisticasService.getMiProgresoEjercicios();
      return response.success && response.progreso ? response.progreso : null;
    }
  });

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

    // Verificar que la comparación existe y tiene las propiedades necesarias
    if (!comparacion) {
      return (
        <Card p="md" radius="md" withBorder>
          <Text size="lg" fw={600} mb="md">
            Comparación con Semana Anterior
          </Text>
          <Text c="dimmed">No hay datos de comparación disponibles</Text>
        </Card>
      );
    }

    return (
      <Card p="md" radius="md" withBorder>
        <Text size="lg" fw={600} mb="md">
          Comparación con Semana Anterior
        </Text>
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
          <Box>
            <Group mb="xs">
              {getIcon(comparacion.sesionesCompletadas?.porcentajeCambio || 0)}
              <Text size="sm" fw={500}>Sesiones</Text>
            </Group>
            <Text size="xl" fw={700} c={getColor(comparacion.sesionesCompletadas?.porcentajeCambio || 0)}>
              {comparacion.sesionesCompletadas?.actual || 0}
            </Text>
            <Text size="xs" c="dimmed">
              {(comparacion.sesionesCompletadas?.porcentajeCambio || 0) > 0 ? '+' : ''}
              {Math.round(comparacion.sesionesCompletadas?.porcentajeCambio || 0)}%
            </Text>
          </Box>
          
          <Box>
            <Group mb="xs">
              {getIcon(comparacion.tiempoEntrenamiento?.porcentajeCambio || 0)}
              <Text size="sm" fw={500}>Tiempo (min)</Text>
            </Group>
            <Text size="xl" fw={700} c={getColor(comparacion.tiempoEntrenamiento?.porcentajeCambio || 0)}>
              {Math.round(comparacion.tiempoEntrenamiento?.actual || 0)}
            </Text>
            <Text size="xs" c="dimmed">
              {(comparacion.tiempoEntrenamiento?.porcentajeCambio || 0) > 0 ? '+' : ''}
              {Math.round(comparacion.tiempoEntrenamiento?.porcentajeCambio || 0)}%
            </Text>
          </Box>
          
          <Box>
            <Group mb="xs">
              {getIcon(comparacion.cargaUtilizada?.porcentajeCambio || 0)}
              <Text size="sm" fw={500}>Carga (kg)</Text>
            </Group>
            <Text size="xl" fw={700} c={getColor(comparacion.cargaUtilizada?.porcentajeCambio || 0)}>
              {Math.round(comparacion.cargaUtilizada?.actual || 0)}
            </Text>
            <Text size="xs" c="dimmed">
              {(comparacion.cargaUtilizada?.porcentajeCambio || 0) > 0 ? '+' : ''}
              {Math.round(comparacion.cargaUtilizada?.porcentajeCambio || 0)}%
            </Text>
          </Box>
          
          <Box>
            <Group mb="xs">
              {getIcon(comparacion.seriesCompletadas?.porcentajeCambio || 0)}
              <Text size="sm" fw={500}>Series</Text>
            </Group>
            <Text size="xl" fw={700} c={getColor(comparacion.seriesCompletadas?.porcentajeCambio || 0)}>
              {comparacion.seriesCompletadas?.actual || 0}
            </Text>
            <Text size="xs" c="dimmed">
              {(comparacion.seriesCompletadas?.porcentajeCambio || 0) > 0 ? '+' : ''}
              {Math.round(comparacion.seriesCompletadas?.porcentajeCambio || 0)}%
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
    const data = Object.entries(distribucion).map(([tipo, cantidad]) => ({
      tipo,
      cantidad
    }));

    return (
      <BarChartComponent
        title="Distribución por Tipo de Ejercicio"
        data={data}
        tooltipLabel="ejercicios"
        color="blue.6"
      />
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


  // Cargar rachas de entrenamiento
  useEffect(() => {
    const cargarRachas = async () => {
      try {
        const responseRachas = await estadisticasService.getRachasEntrenamiento();
        if (responseRachas.success && responseRachas.rachas) {
          setRachas(responseRachas.rachas);
        }
      } catch (err) {
        console.warn('No se pudieron cargar las rachas de entrenamiento:', err);
      }
    };
    cargarRachas();
  }, []);

  useEffect(() => {
    cargarEstadisticas(semanaSeleccionada, añoSeleccionado);
  }, [semanaSeleccionada, añoSeleccionado, cargarEstadisticas]);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <ErrorState 
        error={error} 
        onRetry={() => cargarEstadisticas(semanaSeleccionada, añoSeleccionado)}
        emptyStateComponent={<EmptyProgresoState onRetry={() => cargarEstadisticas(semanaSeleccionada, añoSeleccionado)} />}
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
        onRefresh={() => cargarEstadisticas(semanaSeleccionada, añoSeleccionado)}
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
        <EstadisticasGeneralesLayout 
          estadisticas={estadisticas} 
          tipo="entrenamiento" 
        />
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
                  {Math.round(estadisticasSemanal?.progreso?.tiempoTotalEntrenamiento || 0)} min
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
      {progresoEjercicios && progresoEjercicios.length > 0 && (
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
              .filter((ejercicio: ProgresoEjercicio) => ejercicio.estadisticas?.totalSesiones && ejercicio.estadisticas.totalSesiones > 0)
              .sort((a: ProgresoEjercicio, b: ProgresoEjercicio) => (b.estadisticas?.cargaMaxima || 0) - (a.estadisticas?.cargaMaxima || 0))
              .slice(0, 3)
              .map((ejercicio: ProgresoEjercicio, index: number) => (
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
          
          {progresoEjercicios.filter((ejercicio: ProgresoEjercicio) => ejercicio.estadisticas?.totalSesiones && ejercicio.estadisticas.totalSesiones > 0).length === 0 && (
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
                      {Math.round(estadisticasSemanal?.progreso?.tiempoCardio || 0)}
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
