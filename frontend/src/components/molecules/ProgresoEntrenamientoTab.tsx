import React, { useState, useEffect, useCallback } from 'react';
import { 
  Grid, 
  Card, 
  Text, 
  Group, 
  Badge, 
  Progress, 
  NumberFormatter,
  Select,
  Button,
  Alert,
  Loader,
  Center,
  Stack,
  ThemeIcon,
  Divider,
  Paper
} from '@mantine/core';
import { 
  IconCalendar, 
  IconTarget, 
  IconTrendingUp, 
  IconClock,
  IconRefresh,
  IconBarbell
} from '@tabler/icons-react';
import { estadisticasService } from '../../services/estadisticasService';
import { EstadisticasCliente, EstadisticasSemanal, ProgresoEjercicio } from '../../types/estadisticas';
import EmptyProgresoState from './EmptyProgresoState';

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
  // Función para obtener el número de semana actual (ISO 8601)
  const getCurrentWeekNumber = (): number => {
    const d = new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
  };

  const [semanaSeleccionada, setSemanaSeleccionada] = useState<number>(getCurrentWeekNumber());
  const [añoSeleccionado, setAñoSeleccionado] = useState<number>(new Date().getFullYear());
  const [mostrarHistorial, setMostrarHistorial] = useState<boolean>(false);

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
    return (
      <Center py="xl">
        <Loader size="lg" />
      </Center>
    );
  }

  if (error) {
    if (error.includes('No hay datos')) {
      return <EmptyProgresoState onRetry={cargarEstadisticas} />;
    }
    
    return (
      <Alert color="red" title="Error" icon={<IconRefresh size={16} />}>
        {error}
        <Button 
          variant="light" 
          size="sm" 
          mt="sm" 
          onClick={cargarEstadisticas}
        >
          Reintentar
        </Button>
      </Alert>
    );
  }


  return (
    <Stack gap="xl">
      {/* Panel de información de la semana */}
      <Paper p="md" radius="md" withBorder style={{ backgroundColor: '#f8f9fa' }}>
        <Group justify="space-between" align="center">
          <Group gap="md">
            <ThemeIcon color="blue" variant="light" size="lg">
              <IconCalendar size={20} />
            </ThemeIcon>
            <div>
              <Text size="lg" fw={600}>
                Semana {semanaSeleccionada} de {añoSeleccionado}
              </Text>
              <Text size="sm" c="dimmed">
                {semanaSeleccionada === getCurrentWeekNumber() && añoSeleccionado === new Date().getFullYear() 
                  ? "Semana actual" 
                  : "Semana histórica"}
              </Text>
            </div>
          </Group>
          
          <Group gap="sm">
            <Button 
              variant="light" 
              leftSection={<IconRefresh size={16} />}
              onClick={cargarEstadisticas}
              size="sm"
            >
              Actualizar
            </Button>
            <Button 
              variant="outline" 
              leftSection={<IconTarget size={16} />}
              onClick={() => setMostrarHistorial(!mostrarHistorial)}
              size="sm"
            >
              {mostrarHistorial ? 'Ocultar Historial' : 'Ver Historial'}
            </Button>
          </Group>
        </Group>
      </Paper>

      {/* Selectores de historial (solo cuando se muestre) */}
      {mostrarHistorial && (
        <Paper p="md" radius="md" withBorder>
          <Text size="md" fw={500} mb="md">Historial de Progreso</Text>
          <Group>
            <Select
              label="Semana"
              placeholder="Seleccionar semana"
              data={Array.from({ length: 52 }, (_, i) => ({
                value: (i + 1).toString(),
                label: `Semana ${i + 1}`
              }))}
              value={semanaSeleccionada.toString()}
              onChange={(value) => setSemanaSeleccionada(parseInt(value || '1'))}
              style={{ minWidth: 150 }}
            />
            <Select
              label="Año"
              placeholder="Seleccionar año"
              data={Array.from({ length: 3 }, (_, i) => {
                const año = new Date().getFullYear() - i;
                return {
                  value: año.toString(),
                  label: año.toString()
                };
              })}
              value={añoSeleccionado.toString()}
              onChange={(value) => setAñoSeleccionado(parseInt(value || new Date().getFullYear().toString()))}
              style={{ minWidth: 120 }}
            />
            <Button 
              variant="outline" 
              leftSection={<IconCalendar size={16} />}
              onClick={() => {
                setSemanaSeleccionada(getCurrentWeekNumber());
                setAñoSeleccionado(new Date().getFullYear());
                setMostrarHistorial(false);
              }}
              style={{ marginTop: 25 }}
            >
              Volver a Actual
            </Button>
          </Group>
        </Paper>
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
                    {Math.round(estadisticasSemanal.progreso?.porcentajeCompletitud || 0)}%
                  </Text>
                  <Text size="sm" c="dimmed" ml="xs">
                    ({estadisticasSemanal.progreso?.ejerciciosCompletados || 0}/{estadisticasSemanal.progreso?.ejerciciosRegistrados || 0} ejercicios)
                  </Text>
                </Group>
                
                <Progress 
                  value={estadisticasSemanal.progreso?.porcentajeCompletitud || 0} 
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
                  {estadisticasSemanal.progreso?.tiempoTotalEntrenamiento || 0} min
                </Text>
                
                {estadisticasSemanal.asistencia?.sesionesCompletadas && estadisticasSemanal.asistencia.sesionesCompletadas > 0 && (
                  <Text size="sm" c="dimmed" mt="xs">
                    Promedio: {Math.round((estadisticasSemanal.progreso?.tiempoTotalEntrenamiento || 0) / estadisticasSemanal.asistencia.sesionesCompletadas)} min/sesión
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
                  {estadisticasSemanal.progreso?.cargaTotalUtilizada || 0} kg
                </Text>
                
                {estadisticasSemanal.asistencia?.sesionesCompletadas && estadisticasSemanal.asistencia.sesionesCompletadas > 0 && (
                  <Text size="sm" c="dimmed" mt="xs">
                    Promedio: {Math.round((estadisticasSemanal.progreso?.cargaTotalUtilizada || 0) / estadisticasSemanal.asistencia.sesionesCompletadas)} kg/sesión
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
        </>
      )}
    </Stack>
  );
};

export default ProgresoEntrenamientoTab;
