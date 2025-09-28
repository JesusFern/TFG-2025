import React, { useState, useEffect, useCallback } from 'react';
import { 
  Grid, 
  Card, 
  Text, 
  Group, 
  Badge, 
  Progress, 
  Select,
  Button,
  Alert,
  Loader,
  Center,
  Stack, 
  ThemeIcon,
  Divider,
  Paper,
  SimpleGrid,
  Box
} from '@mantine/core';
import { 
  IconCalendar, 
  IconTarget, 
  IconRefresh,
  IconApple,
  IconStar,
  IconCheck
} from '@tabler/icons-react';
import { estadisticasNutricionalesService } from '../../services/estadisticasNutricionalesService';
import { 
  EstadisticasNutricionalesGenerales, 
  EstadisticasNutricionalesSemanal, 
  ProgresoComida
} from '../../types/estadisticasNutricionales';
import EmptyProgresoNutricionalState from './EmptyProgresoNutricionalState';

// Tipo extendido para manejar la diferencia entre frontend y backend
interface EstadisticasSemanalBackend extends EstadisticasNutricionalesSemanal {
  cumplimiento: EstadisticasNutricionalesSemanal['cumplimiento'];
}

const ProgresoNutricionTab: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [estadisticas, setEstadisticas] = useState<EstadisticasNutricionalesGenerales | null>(null);
  const [estadisticasSemanal, setEstadisticasSemanal] = useState<EstadisticasSemanalBackend | null>(null);
  const [progresoComidas, setProgresoComidas] = useState<ProgresoComida[]>([]);

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
        const responseGeneral = await estadisticasNutricionalesService.getMiProgresoNutricional();
        if (responseGeneral.success && responseGeneral.estadisticas) {
          setEstadisticas(responseGeneral.estadisticas);
        }
      } catch (err) {
        console.warn('No se pudieron cargar las estadísticas generales:', err);
      }

      // Cargar estadísticas semanales
      try {
        const responseSemanal = await estadisticasNutricionalesService.getMiProgresoNutricionalSemanal(semanaSeleccionada, añoSeleccionado);
        if (responseSemanal.success && responseSemanal.estadisticas) {
          setEstadisticasSemanal(responseSemanal.estadisticas as EstadisticasSemanalBackend);
        }
      } catch (err) {
        console.warn('No se pudieron cargar las estadísticas semanales:', err);
      }

      // Cargar progreso de comidas
      try {
        const responseComidas = await estadisticasNutricionalesService.getMiProgresoComidas();
        console.log('Respuesta del progreso de comidas:', responseComidas);
        if (responseComidas.success && responseComidas.progreso) {
          console.log('Progreso de comidas cargado:', responseComidas.progreso);
          setProgresoComidas(responseComidas.progreso);
        }
      } catch (err) {
        console.warn('No se pudo cargar el progreso de comidas:', err);
      }


    } catch (err) {
      setError('Error al cargar las estadísticas nutricionales');
      console.error('Error cargando estadísticas nutricionales:', err);
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
      return <EmptyProgresoNutricionalState onRetry={cargarEstadisticas} />;
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
            <ThemeIcon color="green" variant="light" size="lg">
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
          
          {/* Cumplimiento General */}
          <Grid.Col span={{ base: 6, md: 3 }}>
            <Card shadow="sm" padding="md" radius="md">
              <Group justify="space-between" mb="xs">
                <Text fw={500} size="sm">Cumplimiento</Text>
                <ThemeIcon color="green" variant="light">
                  <IconCheck size={16} />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700} c="green">
                {Math.round(estadisticas.porcentajeCumplimientoGeneral)}%
              </Text>
              <Text size="sm" c="dimmed">
                {estadisticas.totalComidasRegistradas} de {estadisticas.totalComidasPlanificadas} comidas
              </Text>
              <Progress 
                value={estadisticas.porcentajeCumplimientoGeneral} 
                size="sm" 
                mt="xs" 
                color="green"
              />
            </Card>
          </Grid.Col>

          {/* Satisfacción Promedio */}
          <Grid.Col span={{ base: 6, md: 3 }}>
            <Card shadow="sm" padding="md" radius="md">
              <Group justify="space-between" mb="xs">
                <Text fw={500} size="sm">Satisfacción</Text>
                <ThemeIcon color="yellow" variant="light">
                  <IconStar size={16} />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700} c="yellow">
                {estadisticas.promedioSatisfaccion.toFixed(1)}/5
              </Text>
              <Text size="sm" c="dimmed">
                Promedio general
              </Text>
            </Card>
          </Grid.Col>

          {/* Dietas Activas */}
          <Grid.Col span={{ base: 6, md: 3 }}>
            <Card shadow="sm" padding="md" radius="md">
              <Group justify="space-between" mb="xs">
                <Text fw={500} size="sm">Dietas Activas</Text>
                <ThemeIcon color="blue" variant="light">
                  <IconApple size={16} />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700} c="blue">
                {estadisticas.dietasActivas}
              </Text>
              <Text size="sm" c="dimmed">
                de {estadisticas.totalDietas} totales
              </Text>
            </Card>
          </Grid.Col>

          {/* Cumplimiento Promedio */}
          <Grid.Col span={{ base: 6, md: 3 }}>
            <Card shadow="sm" padding="md" radius="md">
              <Group justify="space-between" mb="xs">
                <Text fw={500} size="sm">Cumplimiento Promedio</Text>
                <ThemeIcon color="orange" variant="light">
                  <IconTarget size={16} />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700} c="orange">
                {estadisticas.promedioCumplimiento.toFixed(1)}/5
              </Text>
              <Text size="sm" c="dimmed">
                Promedio general
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
            🍎 Resumen de la Semana {estadisticasSemanal.semana?.numero}
          </Text>
          
          <Grid>
            {/* Cumplimiento con gráfica */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card shadow="sm" padding="lg" radius="md" h="100%">
                <Group justify="space-between" mb="md">
                  <div>
                    <Text fw={600} size="lg">Cumplimiento</Text>
                    <Text size="sm" c="dimmed">Comidas registradas esta semana</Text>
                  </div>
                  <ThemeIcon color="green" variant="light" size="xl">
                    <IconCheck size={24} />
          </ThemeIcon>
                </Group>
                
                <Group align="flex-end" mb="md">
                  <Text size="2rem" fw={800} c="green">
                    {Math.round(estadisticasSemanal.cumplimiento?.porcentajeCumplimiento || 0)}%
                  </Text>
                  <Text size="sm" c="dimmed" ml="xs">
                    ({estadisticasSemanal.cumplimiento?.comidasRegistradas || 0}/{estadisticasSemanal.cumplimiento?.comidasPlanificadas || 0} comidas)
                  </Text>
        </Group>
                
                <Progress 
                  value={estadisticasSemanal.cumplimiento?.porcentajeCumplimiento || 0} 
                  size="lg" 
                  color="green"
                  radius="xl"
                />
              </Card>
            </Grid.Col>

            {/* Satisfacción con gráfica */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card shadow="sm" padding="lg" radius="md" h="100%">
                <Group justify="space-between" mb="md">
                  <div>
                    <Text fw={600} size="lg">Satisfacción</Text>
                    <Text size="sm" c="dimmed">Promedio de satisfacción</Text>
                  </div>
                  <ThemeIcon color="yellow" variant="light" size="xl">
                    <IconStar size={24} />
                  </ThemeIcon>
                </Group>
                
                <Group align="flex-end" mb="md">
                  <Text size="2rem" fw={800} c="yellow">
                    {estadisticasSemanal.cumplimiento?.promedioSatisfaccion?.toFixed(1) || '0.0'}/5
                  </Text>
                  <Text size="sm" c="dimmed" ml="xs">
                    Promedio semanal
                  </Text>
                </Group>
                
                <Progress 
                  value={(estadisticasSemanal.cumplimiento?.promedioSatisfaccion || 0) * 20} 
                  size="lg" 
        color="yellow"
                  radius="xl"
                />
              </Card>
            </Grid.Col>
          </Grid>
        </>
      )}

      {/* Platos Favoritos */}
      {progresoComidas.length > 0 && (
        <>
          <Divider my="md" />
          <Group justify="space-between" align="center" mb="md">
            <Text size="lg" fw={600}>
              🏆 Platos Favoritos
            </Text>
            <Text size="sm" c="dimmed">
              Mejor satisfacción registrada
            </Text>
          </Group>
          
          <Grid>
            {(() => {
              const platosFiltrados = progresoComidas
                .filter(comida => comida.estadisticas?.totalRegistros && comida.estadisticas.totalRegistros > 0)
                .sort((a, b) => (b.estadisticas?.satisfaccionPromedio || 0) - (a.estadisticas?.satisfaccionPromedio || 0))
                .slice(0, 3);
              
              console.log('Platos filtrados para favoritos:', platosFiltrados);
              
              return platosFiltrados.map((comida, index) => (
              <Grid.Col span={{ base: 12, md: 4 }} key={comida.comidaId || 'unknown'}>
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
                        <Text fw={600} size="md">{comida.nombreComida || 'Plato sin nombre'}</Text>
                        <Text size="sm" c="dimmed">{comida.nombreDieta || 'Sin dieta'}</Text>
                      </div>
                    </Group>
                    
                    <Badge 
                      color={
                        comida.estadisticas?.tendenciaSatisfaccion === 'mejorando' ? 'green' :
                        comida.estadisticas?.tendenciaSatisfaccion === 'estable' ? 'blue' : 'red'
                      }
                      variant="light"
                    >
                      {comida.estadisticas?.tendenciaSatisfaccion === 'mejorando' ? '📈 Mejora' :
                       comida.estadisticas?.tendenciaSatisfaccion === 'estable' ? '➡️ Estable' : '📉 Baja'}
                    </Badge>
                  </Group>

                  {/* Métricas principales */}
                  <Stack gap="md">
                    <div>
                      <Text size="sm" c="dimmed">Satisfacción Promedio</Text>
                      <Text fw={700} size="xl" c="yellow">
                        {comida.estadisticas?.satisfaccionPromedio?.toFixed(1) || '0.0'}/5
                      </Text>
                    </div>
                    
                    <Group grow>
                      <div>
                        <Text size="sm" c="dimmed">Cumplimiento</Text>
                        <Text fw={600} size="lg">
                          {comida.estadisticas?.cumplimientoPromedio?.toFixed(1) || '0.0'}/5
                        </Text>
                      </div>
                      <div>
                        <Text size="sm" c="dimmed">Registros</Text>
                        <Text fw={600} size="lg">
                          {comida.estadisticas?.totalRegistros || 0}
                        </Text>
                      </div>
                    </Group>
                  </Stack>
                </Card>
              </Grid.Col>
              ));
            })()}
          </Grid>
          
          {progresoComidas.filter(comida => comida.estadisticas?.totalRegistros && comida.estadisticas.totalRegistros > 0).length === 0 && (
            <Card shadow="sm" padding="xl" radius="md">
              <Stack align="center" gap="md">
                <ThemeIcon color="gray" variant="light" size="xl">
                  <IconApple size={32} />
                </ThemeIcon>
                <div style={{ textAlign: 'center' }}>
                  <Text fw={600} size="lg">No hay datos de platos</Text>
                  <Text size="sm" c="dimmed">
                    Registra el seguimiento de algunas comidas para ver tus platos favoritos aquí
                  </Text>
                </div>
              </Stack>
            </Card>
          )}

          {/* Tendencias de Cumplimiento */}
          {estadisticasSemanal?.tendencias && (
            <Card p="md" radius="md" withBorder>
              <Text size="lg" fw={600} mb="md">
                Tendencias de Cumplimiento
              </Text>
              <SimpleGrid cols={{ base: 1, sm: 1 }} spacing="md">
                <Box>
                  <Text size="sm" c="dimmed" mb="xs">Cumplimiento de la Semana</Text>
                  <Text size="xl" fw={700} c={
                    estadisticasSemanal.tendencias.cumplimiento === 'mejorando' ? 'green' :
                    estadisticasSemanal.tendencias.cumplimiento === 'empeorando' ? 'red' : 'gray'
                  }>
                    {estadisticasSemanal.tendencias.cumplimiento === 'mejorando' ? '📈 Mejorando' :
                     estadisticasSemanal.tendencias.cumplimiento === 'empeorando' ? '📉 Empeorando' : '➡️ Estable'}
                  </Text>
                </Box>
              </SimpleGrid>
            </Card>
          )}
        </>
      )}
    </Stack>
  );
};

export default ProgresoNutricionTab;
