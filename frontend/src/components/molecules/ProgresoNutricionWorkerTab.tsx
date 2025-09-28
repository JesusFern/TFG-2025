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
  Paper
} from '@mantine/core';
import {
  IconTarget, 
  IconRefresh,
  IconApple,
  IconStar,
  IconCheck,
  IconUsers
} from '@tabler/icons-react';
import { useAuth } from '../../hooks/useAuth';
import { getClientesAsignados, getEstadisticasNutricionalesCliente, ClienteAsignado } from '../../services/workerService';
import { 
  EstadisticasNutricionalesGenerales, 
  EstadisticasNutricionalesSemanal, 
  ProgresoComida
} from '../../types/estadisticasNutricionales';

// Tipo extendido para manejar la diferencia entre frontend y backend
interface EstadisticasSemanalBackend extends EstadisticasNutricionalesSemanal {
  cumplimiento: EstadisticasNutricionalesSemanal['cumplimiento'];
}

interface ClienteNutricional extends ClienteAsignado {
  estadisticas?: EstadisticasNutricionalesGenerales;
  estadisticasSemanal?: EstadisticasSemanalBackend;
  progresoComidas?: ProgresoComida[];
}

const ProgresoNutricionWorkerTab: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientes, setClientes] = useState<ClienteNutricional[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<string | null>(null);
  const [semanaSeleccionada, setSemanaSeleccionada] = useState<number>(getCurrentWeekNumber());
  const [añoSeleccionado, setAñoSeleccionado] = useState<number>(new Date().getFullYear());

  // Función para obtener el número de semana actual (ISO 8601)
  function getCurrentWeekNumber(): number {
    const d = new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
  }

  // Cargar clientes del trabajador
  const cargarClientes = useCallback(async () => {
    if (!user || user.role !== 'worker') return;

    try {
      setLoading(true);
      setError(null);

      // Obtener clientes asignados del trabajador
      const clientesAsignados = await getClientesAsignados();
      
      // Filtrar solo los clientes asignados como nutricionista
      const clientesNutricion = clientesAsignados
        .filter(cliente => cliente.tipoAsignacion === 'Nutricionista')
        .map(cliente => ({
          ...cliente,
          estadisticas: undefined,
          estadisticasSemanal: undefined,
          progresoComidas: undefined
        }));

      setClientes(clientesNutricion);
      
      // Seleccionar el primer cliente por defecto
      if (clientesNutricion.length > 0) {
        setClienteSeleccionado(clientesNutricion[0].clienteId);
      }
    } catch (err) {
      setError('Error al cargar los clientes');
      console.error('Error cargando clientes:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Cargar estadísticas del cliente seleccionado
  const cargarEstadisticasCliente = useCallback(async (clienteId: string) => {
    try {
      const cliente = clientes.find(c => c.clienteId === clienteId);
      if (!cliente) return;

      // Obtener estadísticas nutricionales del cliente
      const response = await getEstadisticasNutricionalesCliente(clienteId, semanaSeleccionada, añoSeleccionado);
      
      if (response.success) {
        // Actualizar el cliente con las estadísticas
        setClientes(prev => prev.map(c => 
          c.clienteId === clienteId 
            ? { 
                ...c, 
                estadisticas: response.estadisticas,
                estadisticasSemanal: response.estadisticasSemanal,
                progresoComidas: response.progresoComidas
              }
            : c
        ));
      }
    } catch (err) {
      console.error('Error cargando estadísticas del cliente:', err);
    }
  }, [clientes, semanaSeleccionada, añoSeleccionado]);

  useEffect(() => {
    cargarClientes();
  }, [cargarClientes]);

  useEffect(() => {
    if (clienteSeleccionado) {
      cargarEstadisticasCliente(clienteSeleccionado);
    }
  }, [clienteSeleccionado, cargarEstadisticasCliente]);

  const clienteActual = clientes.find(c => c.clienteId === clienteSeleccionado);

  if (loading) {
    return (
      <Center py="xl">
        <Loader size="lg" />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert color="red" title="Error" icon={<IconRefresh size={16} />}>
        {error}
        <Button 
          variant="light" 
          size="sm" 
          mt="sm" 
          onClick={cargarClientes}
        >
          Reintentar
        </Button>
      </Alert>
    );
  }

  if (clientes.length === 0) {
    return (
      <Alert color="blue" title="Sin clientes" icon={<IconUsers size={16} />}>
        No tienes clientes asignados para seguimiento nutricional.
      </Alert>
    );
  }

  return (
    <Stack gap="xl">
      {/* Selector de cliente y semana */}
      <Paper p="md" radius="md" withBorder>
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Select
              label="Cliente"
              placeholder="Seleccionar cliente"
              data={clientes.map(cliente => ({
                value: cliente.clienteId,
                label: cliente.cliente.fullName
              }))}
              value={clienteSeleccionado}
              onChange={(value) => setClienteSeleccionado(value)}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 6, md: 3 }}>
            <Select
              label="Semana"
              placeholder="Seleccionar semana"
              data={Array.from({ length: 52 }, (_, i) => ({
                value: (i + 1).toString(),
                label: `Semana ${i + 1}`
              }))}
              value={semanaSeleccionada.toString()}
              onChange={(value) => setSemanaSeleccionada(parseInt(value || '1'))}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 6, md: 3 }}>
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
            />
          </Grid.Col>
        </Grid>
      </Paper>

      {clienteActual && (
        <>
          {/* Información del cliente */}
          <Paper p="md" radius="md" withBorder>
            <Group justify="space-between" align="center">
              <div>
                <Text size="lg" fw={600}>{clienteActual.cliente.fullName}</Text>
                <Text size="sm" c="dimmed">{clienteActual.cliente.email}</Text>
              </div>
              <Badge color="nutroos-green" variant="light">
                Cliente Activo
              </Badge>
            </Group>
          </Paper>

          {/* Estadísticas Generales del Cliente */}
          {clienteActual.estadisticas && (
            <Grid>
              <Grid.Col span={12}>
                <Text size="lg" fw={600} mb="md">
                  Resumen General
                </Text>
              </Grid.Col>
              
              <Grid.Col span={{ base: 6, md: 3 }}>
                <Card shadow="sm" padding="md" radius="md">
                  <Group justify="space-between" mb="xs">
                    <Text fw={500} size="sm">Cumplimiento</Text>
                    <ThemeIcon color="green" variant="light">
                      <IconCheck size={16} />
                    </ThemeIcon>
                  </Group>
                  <Text size="xl" fw={700} c="green">
                    {Math.round(clienteActual.estadisticas.porcentajeCumplimientoGeneral)}%
                  </Text>
                  <Text size="sm" c="dimmed">
                    {clienteActual.estadisticas.totalComidasRegistradas} de {clienteActual.estadisticas.totalComidasPlanificadas} comidas
                  </Text>
                  <Progress 
                    value={clienteActual.estadisticas.porcentajeCumplimientoGeneral} 
                    size="sm" 
                    mt="xs" 
                    color="green"
                  />
                </Card>
              </Grid.Col>

              <Grid.Col span={{ base: 6, md: 3 }}>
                <Card shadow="sm" padding="md" radius="md">
                  <Group justify="space-between" mb="xs">
                    <Text fw={500} size="sm">Satisfacción</Text>
                    <ThemeIcon color="yellow" variant="light">
                      <IconStar size={16} />
                    </ThemeIcon>
                  </Group>
                  <Text size="xl" fw={700} c="yellow">
                    {clienteActual.estadisticas.promedioSatisfaccion.toFixed(1)}/5
                  </Text>
                  <Text size="sm" c="dimmed">
                    Promedio general
                  </Text>
                </Card>
              </Grid.Col>

              <Grid.Col span={{ base: 6, md: 3 }}>
                <Card shadow="sm" padding="md" radius="md">
                  <Group justify="space-between" mb="xs">
                    <Text fw={500} size="sm">Dietas Activas</Text>
                    <ThemeIcon color="blue" variant="light">
                      <IconApple size={16} />
                    </ThemeIcon>
                  </Group>
                  <Text size="xl" fw={700} c="blue">
                    {clienteActual.estadisticas.dietasActivas}
                  </Text>
                  <Text size="sm" c="dimmed">
                    de {clienteActual.estadisticas.totalDietas} totales
                  </Text>
                </Card>
              </Grid.Col>

              <Grid.Col span={{ base: 6, md: 3 }}>
                <Card shadow="sm" padding="md" radius="md">
                  <Group justify="space-between" mb="xs">
                    <Text fw={500} size="sm">Cumplimiento Promedio</Text>
                    <ThemeIcon color="orange" variant="light">
                      <IconTarget size={16} />
                    </ThemeIcon>
                  </Group>
                  <Text size="xl" fw={700} c="orange">
                    {clienteActual.estadisticas.promedioCumplimiento.toFixed(1)}/5
                  </Text>
                  <Text size="sm" c="dimmed">
                    Promedio general
                  </Text>
                </Card>
              </Grid.Col>
            </Grid>
          )}

          {/* Estadísticas Semanales */}
          {clienteActual.estadisticasSemanal && (
            <>
              <Divider my="md" />
              <Text size="lg" fw={600} mb="md">
                🍎 Resumen de la Semana {clienteActual.estadisticasSemanal.semana?.numero}
              </Text>
              
              <Grid>
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
                        {Math.round(clienteActual.estadisticasSemanal.cumplimiento?.porcentajeCumplimiento || 0)}%
                      </Text>
                      <Text size="sm" c="dimmed" ml="xs">
                        ({clienteActual.estadisticasSemanal.cumplimiento?.comidasRegistradas || 0}/{clienteActual.estadisticasSemanal.cumplimiento?.comidasPlanificadas || 0} comidas)
                      </Text>
                    </Group>
                    
                    <Progress 
                      value={clienteActual.estadisticasSemanal.cumplimiento?.porcentajeCumplimiento || 0} 
                      size="lg" 
                      color="green"
                      radius="xl"
                    />
                  </Card>
                </Grid.Col>

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
                        {clienteActual.estadisticasSemanal.cumplimiento?.promedioSatisfaccion?.toFixed(1) || '0.0'}/5
                      </Text>
                      <Text size="sm" c="dimmed" ml="xs">
                        Promedio semanal
                      </Text>
                    </Group>
                    
                    <Progress 
                      value={(clienteActual.estadisticasSemanal.cumplimiento?.promedioSatisfaccion || 0) * 20} 
                      size="lg" 
                      color="yellow"
                      radius="xl"
                    />
                  </Card>
                </Grid.Col>
              </Grid>

              {/* Platos Favoritos del Cliente */}
              {clienteActual.estadisticasSemanal.comidasFavoritas && clienteActual.estadisticasSemanal.comidasFavoritas.length > 0 && (
                <>
                  <Divider my="md" />
                  <Group justify="space-between" align="center" mb="md">
                    <Text size="lg" fw={600}>
                      🏆 Platos Favoritos de {clienteActual.cliente.fullName}
                    </Text>
                    <Text size="sm" c="dimmed">
                      Mejor satisfacción registrada
                    </Text>
                  </Group>
                  
                  <Grid>
                    {clienteActual.estadisticasSemanal.comidasFavoritas.map((plato, index) => (
                      <Grid.Col span={{ base: 12, md: 4 }} key={index}>
                        <Card shadow="sm" padding="lg" radius="md" h="100%">
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
                                <Text fw={600} size="md">{plato.nombre}</Text>
                                <Text size="sm" c="dimmed">{plato.vecesConsumida} veces</Text>
                              </div>
                            </Group>
                          </Group>

                          <Stack gap="md">
                            <div>
                              <Text size="sm" c="dimmed">Satisfacción Promedio</Text>
                              <Text fw={700} size="xl" c="yellow">
                                {plato.satisfaccionPromedio.toFixed(1)}/5
                              </Text>
                            </div>
                          </Stack>
                        </Card>
                      </Grid.Col>
                    ))}
                  </Grid>
                </>
              )}

            </>
          )}
        </>
      )}
    </Stack>
  );
};

export default ProgresoNutricionWorkerTab;
